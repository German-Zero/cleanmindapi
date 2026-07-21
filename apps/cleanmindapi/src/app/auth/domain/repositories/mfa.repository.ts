import { MfaAuthenticatorRecord, MfaChallengeRecord } from '../models/mfa.model';

export abstract class MfaRepository {
  abstract findAuthenticator(userId: string): Promise<MfaAuthenticatorRecord | null>;
  abstract upsertPendingAuthenticator(
    userId: string,
    secretEncrypted: string,
  ): Promise<MfaAuthenticatorRecord>;
  abstract enableAuthenticator(
    authenticatorId: string,
    recoveryCodeHashes: string[],
  ): Promise<void>;
  abstract deleteAuthenticator(userId: string): Promise<void>;
  abstract replaceRecoveryCodes(
    authenticatorId: string,
    recoveryCodeHashes: string[],
  ): Promise<void>;
  abstract consumeRecoveryCode(
    authenticatorId: string,
    codeHash: string,
  ): Promise<boolean>;
  abstract useTotpStep(authenticatorId: string, step: number): Promise<boolean>;
  abstract createChallenge(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    primaryMethod: 'pwd' | 'google',
  ): Promise<void>;
  abstract claimChallengeAttempt(
    tokenHash: string,
    maxAttempts: number,
  ): Promise<MfaChallengeRecord | null>;
  abstract consumeChallenge(challengeId: string): Promise<boolean>;
}
