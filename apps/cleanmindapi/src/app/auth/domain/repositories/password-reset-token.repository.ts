import { PasswordResetToken } from "../entities/password-reset-token.entity";

export abstract class PasswordResetTokenRepository {
  abstract create(
    token: PasswordResetToken,
  ): Promise<void>;

  abstract findByHash(
    hash: string,
  ): Promise<PasswordResetToken | null>;

  abstract update(
    token: PasswordResetToken,
  ): Promise<void>;
}
