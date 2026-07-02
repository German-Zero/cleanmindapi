import { randomUUID } from 'crypto';

export class VerificationToken {
  constructor(
    public readonly id: string,
    public readonly tokenHash: string,
    public readonly userId: string,
    public readonly expiresAt: Date,
    public verifiedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    tokenHash: string;
    userId: string;
    expiresAt: Date;
  }): VerificationToken {
    return new VerificationToken(
      randomUUID(),
      params.tokenHash,
      params.userId,
      params.expiresAt,
      null,
      new Date(),
    );
  }

  verify(): void {
    this.verifiedAt = new Date();
  }

  get isVerified(): boolean {
    return this.verifiedAt !== null;
  }

  get isExpired(): boolean {
    return this.expiresAt <= new Date();
  }
}
