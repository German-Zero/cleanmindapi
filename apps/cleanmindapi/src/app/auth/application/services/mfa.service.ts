import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { ApplicationError } from '../../../shared/application/errors/application-error';

import { User } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { AuthResponse, MfaRequiredResponse } from '../common/responses/auth-response';
import { MfaAuthenticatorRecord } from '../../domain/models/mfa.model';
import { MfaRepository } from '../../domain/repositories/mfa.repository';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { MfaSecretCipherPort } from '../ports/outbound/mfa-secret-cipher.port';
import { TotpPort } from '../ports/outbound/totp.port';
import { SessionIssuerService } from './session-issuer.service';
import { MfaPort } from '../ports/inbound/mfa.port';
import { MfaSetupResponse, MfaStatusResponse } from '../common/responses/mfa-responses';

@Injectable()
export class MfaService implements MfaPort {
  constructor(
    private readonly repository: MfaRepository,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly users: UserRepository,
    private readonly totp: TotpPort,
    private readonly encryption: MfaSecretCipherPort,
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

    if (!authTime || Math.floor(Date.now() / 1000) - authTime > maxAuthAge) {
      throw new ApplicationError(
        'AUTH_UNAUTHORIZED',
        'Vuelve a iniciar sesión para continuar.',
      );
    }

    if (!user.emailVerified) {
      throw new ApplicationError(
        'AUTH_FORBIDDEN',
        'Debes verificar tu email antes de activar esta función.',
      );
    }

    const current = await this.repository.findAuthenticator(userId);

    if (current?.enabledAt) {
      throw new ApplicationError(
        'AUTH_CONFLICT',
        'La verificación en dos pasos ya está activa.',
      );
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
    await this.requireValidAuthenticatorCode(authenticator, code);

    const recoveryCodes = this.generateRecoveryCodes();

    await this.repository.enableAuthenticator(
      authenticator.id,
      recoveryCodes.map((recoveryCode) => this.hashRecoveryCode(recoveryCode)),
    );
    await this.refreshTokens.revokeAllByUser(userId);

    return recoveryCodes;
  }

  async disable(userId: string, code: string): Promise<void> {
    const authenticator = await this.requireEnabledAuthenticator(userId);
    await this.requireValidAuthenticatorCode(authenticator, code);

    await this.repository.deleteAuthenticator(userId);
    await this.refreshTokens.revokeAllByUser(userId);
  }

  async regenerateRecoveryCodes(
    userId: string,
    code: string,
  ): Promise<string[]> {
    const authenticator = await this.requireEnabledAuthenticator(userId);
    await this.requireValidAuthenticatorCode(authenticator, code);

    const recoveryCodes = this.generateRecoveryCodes();

    await this.repository.replaceRecoveryCodes(
      authenticator.id,
      recoveryCodes.map((recoveryCode) => this.hashRecoveryCode(recoveryCode)),
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

  async verifyLogin(
    challengeToken: string,
    code: string,
  ): Promise<AuthResponse> {
    const maxAttempts = this.config.get<number>('auth.mfa.maxAttempts', 5);
    const challenge = await this.repository.claimChallengeAttempt(
      this.hash(challengeToken),
      maxAttempts,
    );

    if (!challenge) {
      throw new ApplicationError(
        'AUTH_UNAUTHORIZED',
        'La verificación venció. Inicia sesión nuevamente.',
      );
    }

    const authenticator = await this.requireEnabledAuthenticator(
      challenge.userId,
    );
    await this.requireValidAuthenticatorCode(authenticator, code);

    if (!(await this.repository.consumeChallenge(challenge.id))) {
      throw new ApplicationError(
        'AUTH_UNAUTHORIZED',
        'Este intento de verificación ya fue utilizado.',
      );
    }

    return this.sessions.issue(await this.requireUser(challenge.userId), [
      challenge.primaryMethod,
      'otp',
    ]);
  }

  private async verifyAuthenticatorCode(
    authenticator: MfaAuthenticatorRecord,
    code: string,
  ): Promise<boolean> {
    const normalized = code.trim().toUpperCase();

    if (/^\d{6}$/.test(normalized)) {
      const secret = this.encryption.decrypt(authenticator.secretEncrypted);
      const step = this.totp.verify(normalized, secret);

      return (
        step !== null && this.repository.useTotpStep(authenticator.id, step)
      );
    }

    if (/^CM-(?:[A-F0-9]{4}-){3}[A-F0-9]{4}$/.test(normalized)) {
      return this.repository.consumeRecoveryCode(
        authenticator.id,
        this.hashRecoveryCode(normalized),
      );
    }

    return false;
  }

  private async requireValidAuthenticatorCode(
    authenticator: MfaAuthenticatorRecord,
    code: string,
  ): Promise<void> {
    if (await this.verifyAuthenticatorCode(authenticator, code)) return;

    throw new ApplicationError(
      'AUTH_UNAUTHORIZED',
      'El código ingresado no es válido.',
    );
  }

  private async requireUser(userId: string): Promise<User> {
    const user = await this.users.findById(userId);

    if (!user)
      throw new ApplicationError(
        'AUTH_NOT_FOUND',
        'No encontramos el usuario.',
      );

    return user;
  }

  private async requirePendingAuthenticator(
    userId: string,
  ): Promise<MfaAuthenticatorRecord> {
    const authenticator = await this.repository.findAuthenticator(userId);

    if (!authenticator || authenticator.enabledAt) {
      throw new ApplicationError(
        'AUTH_CONFLICT',
        'Primero debes iniciar la configuración de la verificación en dos pasos.',
      );
    }

    return authenticator;
  }

  private async requireEnabledAuthenticator(
    userId: string,
  ): Promise<MfaAuthenticatorRecord> {
    const authenticator = await this.repository.findAuthenticator(userId);

    if (!authenticator?.enabledAt) {
      throw new ApplicationError(
        'AUTH_CONFLICT',
        'La verificación en dos pasos no está activa.',
      );
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
