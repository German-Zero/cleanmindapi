export class RefreshToken {
  private constructor(
    public readonly id: string | null,
    public readonly tokenHash: string,
    public readonly userId: string,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
    public revokedAt: Date | null,
  ) {}

  static create(params: {
    tokenHash: string;
    userId: string;
    expiresAt: Date;
  }): RefreshToken {
    return new RefreshToken(
      null,
      params.tokenHash,
      params.userId,
      params.expiresAt,
      new Date(),
      null,
    );
  }

  static restore(params: {
    id: string;
    tokenHash: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
    revokedAt: Date | null;
  }): RefreshToken {
    return new RefreshToken(
      params.id,
      params.tokenHash,
      params.userId,
      params.expiresAt,
      params.createdAt,
      params.revokedAt,
    );
  }

  revoke(): void {
    if (!this.revokedAt) {
      this.revokedAt = new Date();
    }
  }

  isRevoked(): boolean {
    return this.revokedAt !== null;
  }

  isExpired(): boolean {
    return this.expiresAt.getTime() <= Date.now();
  }

  isValid(): boolean {
    return !this.isRevoked() && !this.isExpired();
  }

  rotate(
    tokenHash: string,
    expiresAt: Date,
  ): RefreshToken {
    this.revoke();

    return RefreshToken.create({
      tokenHash,
      userId: this.userId,
      expiresAt,
    });
  }
}
