import { PasswordResetToken } from '../entities/password-reset-token.entity';

export abstract class PasswordResetTokenRepository {
  abstract create(token: PasswordResetToken): Promise<void>;
  abstract findByHash(hash: string): Promise<PasswordResetToken | null>;
  abstract completeReset( tokenId: string, userId: string, passwordHash: string, now: Date, ): Promise<boolean>;
}
