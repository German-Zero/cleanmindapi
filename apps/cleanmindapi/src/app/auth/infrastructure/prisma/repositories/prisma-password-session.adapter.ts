import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { PasswordSessionPort } from '../../../application/ports/outbound/password-session.port';

@Injectable()
export class PrismaPasswordSessionAdapter implements PasswordSessionPort {
  constructor(private readonly prisma: PrismaService) {}

  async changePasswordAndRevokeSessions(
    userId: string,
    passwordHash: string,
    updatedAt: Date,
  ): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.user.update({
        where: { id: userId },
        data: { passwordHash, updatedAt },
      });

      await transaction.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: updatedAt },
      });
    });
  }
}
