import { PasswordResetToken } from "../../../domain/entities/password-reset-token.entity";
import { PasswordResetToken as PrismaPasswordResetToken } from "@prisma/client";


export class PasswordResetTokenMapper {
  static toDomain(
    prisma: PrismaPasswordResetToken,
  ): PasswordResetToken {
    return new PasswordResetToken(
      prisma.id,
      prisma.tokenHash,
      prisma.userId,
      prisma.expiresAt,
      prisma.usedAt,
      prisma.createdAt,
    );
  }

  static toPersistence(
    token: PasswordResetToken,
  ) {
    return {
      id: token.id,
      tokenHash: token.tokenHash,
      userId: token.userId,
      expiresAt: token.expiresAt,
      usedAt: token.usedAt,
      createdAt: token.createdAt,
    };
  }
}
