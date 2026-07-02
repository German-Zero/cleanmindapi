import { Injectable } from "@nestjs/common";
import { PasswordResetTokenRepository } from "../../../domain/repositories/password-reset-token.repository";
import { PrismaService } from "../../../../shared/infrastructure/prisma/prisma.service";
import { PasswordResetToken } from "../../../domain/entities/password-reset-token.entity";
import { PasswordResetTokenMapper } from "../mappers/password-reset-token.mapper";


@Injectable()
export class PrismaPasswordResetTokenRepository implements PasswordResetTokenRepository
{
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    token: PasswordResetToken,
  ): Promise<void> {
    await this.prisma.passwordResetToken.create({
      data: PasswordResetTokenMapper.toPersistence(
        token,
      ),
    });
  }

  async findByHash(
    hash: string,
  ): Promise<PasswordResetToken | null> {
    const token =
      await this.prisma.passwordResetToken.findUnique({
        where: {
          tokenHash: hash,
        },
      });

    if (!token) {
      return null;
    }

    return PasswordResetTokenMapper.toDomain(
      token,
    );
  }

  async update(
    token: PasswordResetToken,
  ): Promise<void> {
    await this.prisma.passwordResetToken.update({
      where: {
        id: token.id,
      },
      data: PasswordResetTokenMapper.toPersistence(
        token,
      ),
    });
  }
}
