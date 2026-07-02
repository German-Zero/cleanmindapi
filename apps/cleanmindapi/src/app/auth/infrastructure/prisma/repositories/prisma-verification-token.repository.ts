import { Injectable } from "@nestjs/common";
import { VerificationTokenRepository } from "../../../domain/repositories/verification-token.repository";
import { PrismaService } from "../../../../shared/infrastructure/prisma/prisma.service";
import { VerificationToken } from "../../../domain/entities/verification-token.entity";
import { VerificationTokenMapper } from "../mappers/verification-token.mapper";


@Injectable()
export class PrismaVerificationTokenRepository
  implements VerificationTokenRepository
{
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    token: VerificationToken,
  ): Promise<void> {
    await this.prisma.verificationToken.create({
      data: VerificationTokenMapper.toPersistence(
        token,
      ),
    });
  }

  async findByHash(
    hash: string,
  ): Promise<VerificationToken | null> {
    const token =
      await this.prisma.verificationToken.findUnique({
        where: {
          tokenHash: hash,
        },
      });

    if (!token) {
      return null;
    }

    return VerificationTokenMapper.toDomain(token);
  }

  async update(
    token: VerificationToken,
  ): Promise<void> {
    await this.prisma.verificationToken.update({
      where: {
        id: token.id,
      },
      data: VerificationTokenMapper.toPersistence(
        token,
      ),
    });
  }
}
