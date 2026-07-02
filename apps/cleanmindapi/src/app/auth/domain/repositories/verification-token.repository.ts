import { VerificationToken } from "../entities/verification-token.entity";

export abstract class VerificationTokenRepository {
  abstract create(
    token: VerificationToken,
  ): Promise<void>;

  abstract findByHash(
    hash: string,
  ): Promise<VerificationToken | null>;

  abstract update(
    token: VerificationToken,
  ): Promise<void>;
}
