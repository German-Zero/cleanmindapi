import { RefreshToken as PrismaRefreshToken } from '@prisma/client'
import { RefreshToken } from "../../../domain/entities/refresh-token.entity";

export class RefreshTokenMapper {
  static toDomain(
    refreshToken: PrismaRefreshToken,
  ): RefreshToken {
    return RefreshToken.restore({
      id: refreshToken.id,
      tokenHash: refreshToken.tokenHash,
      userId: refreshToken.userId,
      expiresAt: refreshToken.expiresAt,
      createdAt: refreshToken.createdAt,
      revokedAt: refreshToken.revokedAt,
    });
  }

  static toPersistence(refreshToken: RefreshToken) {
    return {
      tokenHash: refreshToken.tokenHash,
      userId: refreshToken.userId,
      expiresAt: refreshToken.expiresAt,
      revokedAt: refreshToken.revokedAt,
    };
  }
}
