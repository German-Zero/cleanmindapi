import { randomUUID } from 'crypto';

export class PasswordResetToken {
  constructor(
    public readonly id: string,
    public readonly tokenHash: string,
    public readonly userId: string,
    public readonly expiresAt: Date,
    public usedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    tokenHash: string;
    userId: string;
    expiresAt: Date;
  }): PasswordResetToken {
    return new PasswordResetToken(
      randomUUID(),
      params.tokenHash,
      params.userId,
      params.expiresAt,
      null,
      new Date(),
    );
  }

  use(): void {
    this.usedAt = new Date();
  }

  get isUsed(): boolean {
    return this.usedAt !== null;
  }

  get isExpired(): boolean {
    return this.expiresAt <= new Date();
  }
}
