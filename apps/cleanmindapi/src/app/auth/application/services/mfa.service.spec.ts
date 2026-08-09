import { ConfigService } from '@nestjs/config';

import { User } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { Email } from '../../../users/domain/value-objects/email.vo';
import { AuthProvider } from '../../../users/domain/enums/auth-provider.enum';
import { UserRole } from '../../../users/domain/enums/user-role.enum';
import { MfaRepository } from '../../domain/repositories/mfa.repository';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { MfaSecretEncryptionService } from '../../infrastructure/services/mfa-secret-encryption.service';
import { TotpService } from '../../infrastructure/services/totp.service';
import { MfaService } from './mfa.service';
import { SessionIssuerService } from './session-issuer.service';

describe('MfaService', () => {
  const user = new User(
    'user-id',
    'Mindful User',
    new Email('user@example.com'),
    'password-hash',
    AuthProvider.LOCAL,
    UserRole.USER,
    true,
    null,
    new Date(),
    new Date(),
    null,
  );
  const authenticator = {
    id: 'authenticator-id',
    userId: user.id,
    secretEncrypted: 'encrypted-secret',
    enabledAt: new Date(),
    lastUsedStep: null,
  };

  function createService(overrides: {
    repository?: Partial<MfaRepository>;
    users?: Partial<UserRepository>;
    refreshTokens?: Partial<RefreshTokenRepository>;
    totp?: Partial<TotpService>;
    encryption?: Partial<MfaSecretEncryptionService>;
    sessions?: Partial<SessionIssuerService>;
  } = {}) {
    const repository = {
      findAuthenticator: jest.fn(),
      createChallenge: jest.fn(),
      claimChallengeAttempt: jest.fn(),
      consumeChallenge: jest.fn(),
      useTotpStep: jest.fn(),
      consumeRecoveryCode: jest.fn(),
      ...overrides.repository,
    } as unknown as MfaRepository;
    const users = {
      findById: jest.fn().mockResolvedValue(user),
      ...overrides.users,
    } as unknown as UserRepository;
    const refreshTokens = {
      revokeAllByUser: jest.fn().mockResolvedValue(undefined),
      ...overrides.refreshTokens,
    } as unknown as RefreshTokenRepository;
    const totp = {
      verify: jest.fn(),
      ...overrides.totp,
    } as unknown as TotpService;
    const encryption = {
      decrypt: jest.fn().mockReturnValue('BASE32SECRET'),
      ...overrides.encryption,
    } as unknown as MfaSecretEncryptionService;
    const sessions = {
      issue: jest.fn().mockResolvedValue({
        mfaRequired: false,
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 900,
        refreshExpiresIn: 604800,
        user: {},
      }),
      ...overrides.sessions,
    } as unknown as SessionIssuerService;
    const config = new ConfigService({
      auth: { mfa: { challengeExpiresInSeconds: 300, maxAttempts: 5 } },
    });

    return {
      service: new MfaService(
        repository,
        refreshTokens,
        users,
        totp,
        encryption,
        sessions,
        config,
      ),
      repository,
      sessions,
    };
  }

  it('returns a temporary challenge instead of issuing a session', async () => {
    const { service, repository, sessions } = createService({
      repository: {
        findAuthenticator: jest.fn().mockResolvedValue(authenticator),
        createChallenge: jest.fn().mockResolvedValue(undefined),
      },
    });

    const result = await service.beginLogin(user, 'pwd');

    expect(result).toEqual(expect.objectContaining({
      mfaRequired: true,
      expiresIn: 300,
      challengeToken: expect.any(String),
    }));
    expect(repository.createChallenge).toHaveBeenCalledWith(
      user.id,
      expect.stringMatching(/^[a-f0-9]{64}$/),
      expect.any(Date),
      'pwd',
    );
    expect(sessions.issue).not.toHaveBeenCalled();
  });

  it('requires recent primary authentication before starting enrollment', async () => {
    const { service } = createService();
    const staleAuthTime = Math.floor(Date.now() / 1000) - 601;

    await expect(service.setup(user.id, staleAuthTime)).rejects.toThrow(
      'Vuelve a iniciar sesión para continuar.',
    );
  });

  it('consumes a valid challenge and only then issues the session', async () => {
    const { service, repository, sessions } = createService({
      repository: {
        claimChallengeAttempt: jest.fn().mockResolvedValue({
          id: 'challenge-id',
          userId: user.id,
          expiresAt: new Date(Date.now() + 60_000),
          attempts: 0,
          primaryMethod: 'pwd',
          consumedAt: null,
        }),
        findAuthenticator: jest.fn().mockResolvedValue(authenticator),
        useTotpStep: jest.fn().mockResolvedValue(true),
        consumeChallenge: jest.fn().mockResolvedValue(true),
      },
      totp: { verify: jest.fn().mockReturnValue(1234) },
    });

    const result = await service.verifyLogin('challenge-token', '123456');

    expect(repository.useTotpStep).toHaveBeenCalledWith(
      authenticator.id,
      1234,
    );
    expect(repository.consumeChallenge).toHaveBeenCalledWith('challenge-id');
    expect(sessions.issue).toHaveBeenCalledWith(user, ['pwd', 'otp']);
    expect(result.mfaRequired).toBe(false);
  });

  it('counts a failed code without issuing a session', async () => {
    const { service, repository, sessions } = createService({
      repository: {
        claimChallengeAttempt: jest.fn().mockResolvedValue({
          id: 'challenge-id',
          userId: user.id,
          expiresAt: new Date(Date.now() + 60_000),
          attempts: 0,
          primaryMethod: 'pwd',
          consumedAt: null,
        }),
        findAuthenticator: jest.fn().mockResolvedValue(authenticator),
      },
      totp: { verify: jest.fn().mockReturnValue(null) },
    });

    await expect(
      service.verifyLogin('challenge-token', '123456'),
    ).rejects.toThrow('El código ingresado no es válido.');
    expect(repository.claimChallengeAttempt).toHaveBeenCalledWith(
      expect.stringMatching(/^[a-f0-9]{64}$/),
      5,
    );
    expect(sessions.issue).not.toHaveBeenCalled();
  });
});
