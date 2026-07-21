import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';

import { User } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import {
  AuthResponse,
  MfaRequiredResponse,
} from '../../api/response/auth-response';
import { MfaAuthenticatorRecord } from '../../domain/models/mfa.model';
import { MfaRepository } from '../../domain/repositories/mfa.repository';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { MfaSecretEncryptionService } from '../../infrastructure/services/mfa-secret-encryption.service';
import { TotpService } from '../../infrastructure/services/totp.service';
import { SessionIssuerService } from './session-issuer.service';

export interface MfaSetupResponse {
  secret: string;
  otpauthUri: string;
}

export interface MfaStatusResponse {
  enabled: boolean;
  enabledAt: Date | null;
}

@Injectable()
export class MfaService {
  constructor(
    private readonly repository: MfaRepository,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly users: UserRepository,
    private readonly totp: TotpService,
    private readonly encryption: MfaSecretEncryptionService,
    private readonly sessions: SessionIssuerService,
    private readonly config: ConfigService,
  ) {}

  async status(userId: string): Promise<MfaStatusResponse> {
    const authenticator = await this.repository.findAuthenticator(userId);

    return {
      enabled: Boolean(authenticator?.enabledAt),
      enabledAt: authenticator?.enabledAt ?? null,
    };
  }

  async setup(userId: string, authTime: number): Promise<MfaSetupResponse> {
    const user = await this.requireUser(userId);
    const maxAuthAge = this.config.get<number>(
      'auth.mfa.setupMaxAuthAgeSeconds',
      600,
    );

    if (
      !authTime ||
      Math.floor(Date.now() / 1000) - authTime > maxAuthAge
    ) {
      throw new UnauthorizedException('Recent authentication is required');
    }

    if (!user.emailVerified) {
      throw new ForbiddenException('Email verification is required before enabling MFA');
    }

    const current = await this.repository.findAuthenticator(userId);

    if (current?.enabledAt) {
      throw new ConflictException('MFA is already enabled');
    }

    const secret = this.totp.generateSecret();

    await this.repository.upsertPendingAuthenticator(
      userId,
      this.encryption.encrypt(secret),
    );

    return {
      secret,
      otpauthUri: this.totp.createUri(
        secret,
        user.email.getValue(),
        this.config.get<string>('auth.mfa.issuer', 'CleanMind'),
      ),
    };
  }

  async enable(userId: string, code: string): Promise<string[]> {
    const authenticator = await this.requirePendingAuthenticator(userId);

    if (!(await this.verifyAuthenticatorCode(authenticator, code))) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    const recoveryCodes = this.generateRecoveryCodes();

    await this.repository.enableAuthenticator(
      authenticator.id,
      recoveryCodes.map(recoveryCode => this.hashRecoveryCode(recoveryCode)),
    );
    await this.refreshTokens.revokeAllByUser(userId);

    return recoveryCodes;
  }

  async disable(userId: string, code: string): Promise<void> {
    const authenticator = await this.requireEnabledAuthenticator(userId);

    if (!(await this.verifyAuthenticatorCode(authenticator, code))) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    await this.repository.deleteAuthenticator(userId);
    await this.refreshTokens.revokeAllByUser(userId);
  }

  async regenerateRecoveryCodes(userId: string, code: string): Promise<string[]> {
    const authenticator = await this.requireEnabledAuthenticator(userId);

    if (!(await this.verifyAuthenticatorCode(authenticator, code))) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    const recoveryCodes = this.generateRecoveryCodes();

    await this.repository.replaceRecoveryCodes(
      authenticator.id,
      recoveryCodes.map(recoveryCode => this.hashRecoveryCode(recoveryCode)),
    );

    return recoveryCodes;
  }

  async beginLogin(
    user: User,
    primaryMethod: 'pwd' | 'google',
  ): Promise<MfaRequiredResponse | null> {
    const authenticator = await this.repository.findAuthenticator(user.id);

    if (!authenticator?.enabledAt) return null;

    const challengeToken = randomBytes(32).toString('base64url');
    const expiresIn = this.config.get<number>(
      'auth.mfa.challengeExpiresInSeconds',
      300,
    );

    await this.repository.createChallenge(
      user.id,
      this.hash(challengeToken),
      new Date(Date.now() + expiresIn * 1000),
      primaryMethod,
    );

    return { mfaRequired: true, challengeToken, expiresIn };
  }

  async verifyLogin(challengeToken: string, code: string): Promise<AuthResponse> {
    const maxAttempts = this.config.get<number>('auth.mfa.maxAttempts', 5);
    const challenge = await this.repository.claimChallengeAttempt(
      this.hash(challengeToken),
      maxAttempts,
    );

    if (!challenge) {
      throw new UnauthorizedException('MFA challenge is invalid or expired');
    }

    const authenticator = await this.requireEnabledAuthenticator(challenge.userId);
    const valid = await this.verifyAuthenticatorCode(authenticator, code);

    if (!valid) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    if (!(await this.repository.consumeChallenge(challenge.id))) {
      throw new UnauthorizedException('MFA challenge has already been used');
    }

    return this.sessions.issue(
      await this.requireUser(challenge.userId),
      [challenge.primaryMethod, 'otp'],
    );
  }

  private async verifyAuthenticatorCode(
    authenticator: MfaAuthenticatorRecord,
    code: string,
  ): Promise<boolean> {
    const normalized = code.trim().toUpperCase();

    if (/^\d{6}$/.test(normalized)) {
      const secret = this.encryption.decrypt(authenticator.secretEncrypted);
      const step = this.totp.verify(normalized, secret);

      return step !== null && this.repository.useTotpStep(authenticator.id, step);
    }

    if (/^CM-(?:[A-F0-9]{4}-){3}[A-F0-9]{4}$/.test(normalized)) {
      return this.repository.consumeRecoveryCode(
        authenticator.id,
        this.hashRecoveryCode(normalized),
      );
    }

    return false;
  }

  private async requireUser(userId: string): Promise<User> {
    const user = await this.users.findById(userId);

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  private async requirePendingAuthenticator(
    userId: string,
  ): Promise<MfaAuthenticatorRecord> {
    const authenticator = await this.repository.findAuthenticator(userId);

    if (!authenticator || authenticator.enabledAt) {
      throw new ConflictException('MFA setup has not been started');
    }

    return authenticator;
  }

  private async requireEnabledAuthenticator(
    userId: string,
  ): Promise<MfaAuthenticatorRecord> {
    const authenticator = await this.repository.findAuthenticator(userId);

    if (!authenticator?.enabledAt) {
      throw new ConflictException('MFA is not enabled');
    }

    return authenticator;
  }

  private generateRecoveryCodes(): string[] {
    return Array.from({ length: 10 }, () => {
      const value = randomBytes(8).toString('hex').toUpperCase();
      return `CM-${value.match(/.{4}/gu)?.join('-')}`;
    });
  }

  private hashRecoveryCode(code: string): string {
    return this.hash(code.trim().toUpperCase());
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
