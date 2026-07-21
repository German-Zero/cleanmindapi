export interface MfaAuthenticatorRecord {
  id: string;
  userId: string;
  secretEncrypted: string;
  enabledAt: Date | null;
  lastUsedStep: number | null;
}

export interface MfaChallengeRecord {
  id: string;
  userId: string;
  expiresAt: Date;
  attempts: number;
  primaryMethod: 'pwd' | 'google';
  consumedAt: Date | null;
}
