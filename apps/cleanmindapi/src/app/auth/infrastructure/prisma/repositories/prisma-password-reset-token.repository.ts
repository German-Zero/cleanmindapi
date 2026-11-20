import { Injectable } from '@nestjs/common';
import { PasswordResetTokenRepository } from '../../../domain/repositories/password-reset-token.repository';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { PasswordResetToken } from '../../../domain/entities/password-reset-token.entity';
import { PasswordResetTokenMapper } from '../mappers/password-reset-token.mapper';

@Injectable()
export class PrismaPasswordResetTokenRepository
  implements PasswordResetTokenRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(token: PasswordResetToken): Promise<void> {
    await this.prisma.passwordResetToken.create({
      data: PasswordResetTokenMapper.toPersistence(token),
    });
  }

  async findByHash(hash: string): Promise<PasswordResetToken | null> {
    const token = await this.prisma.passwordResetToken.findUnique({
      where: {
        tokenHash: hash,
      },
    });

    if (!token) {
      return null;
    }

    return PasswordResetTokenMapper.toDomain(token);
  }

  async completeReset(
    tokenId: string,
    userId: string,
    passwordHash: string,
    now: Date,
  ): Promise<boolean> {
    return this.prisma.$transaction(async (transaction) => {
      const consumed = await transaction.passwordResetToken.updateMany({
        where: {
          id: tokenId,
          userId,
          usedAt: null,
          expiresAt: { gt: now },
        },
        data: { usedAt: now },
      });

      if (consumed.count !== 1) return false;

      await transaction.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
      await transaction.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: now },
      });

      return true;
    });
  }
}
