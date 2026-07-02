import { VerificationToken } from "../../../domain/entities/verification-token.entity";
import { VerificationToken as PrismaVerificationToken } from "@prisma/client";

export class VerificationTokenMapper {
  static toDomain(
    prisma: PrismaVerificationToken,
  ): VerificationToken {
    return new VerificationToken(
      prisma.id,
      prisma.tokenHash,
      prisma.userId,
      prisma.expiresAt,
      prisma.verifiedAt,
      prisma.createdAt,
    );
  }

  static toPersistence(
    token: VerificationToken,
  ) {
    return {
      id: token.id,
      tokenHash: token.tokenHash,
      userId: token.userId,
      expiresAt: token.expiresAt,
      verifiedAt: token.verifiedAt,
      createdAt: token.createdAt,
    };
  }
}
