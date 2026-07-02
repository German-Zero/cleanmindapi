import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/infrastructure/prisma/prisma.service";
import { RefreshTokenRepository } from "../../../domain/repositories/refresh-token.repository";
import { RefreshToken } from "../../../domain/entities/refresh-token.entity";
import { RefreshTokenMapper } from "../mappers/refresh-token.mapper";



@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository
{
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    refreshToken: RefreshToken,
  ): Promise<RefreshToken> {
    const created = await this.prisma.refreshToken.create({
      data: RefreshTokenMapper.toPersistence(refreshToken),
    });

    return RefreshTokenMapper.toDomain(created);
  }

  async update(
    refreshToken: RefreshToken,
  ): Promise<RefreshToken> {
    const updated = await this.prisma.refreshToken.update({
      where: {
        id: refreshToken.id!,
      },
      data: RefreshTokenMapper.toPersistence(refreshToken),
    });

    return RefreshTokenMapper.toDomain(updated);
  }

  async findById(
    id: string,
  ): Promise<RefreshToken | null> {
    const refreshToken =
      await this.prisma.refreshToken.findUnique({
        where: {
          id,
        },
      });

    return refreshToken
      ? RefreshTokenMapper.toDomain(refreshToken)
      : null;
  }

  async findByUserId(
    userId: string,
  ): Promise<RefreshToken[]> {
    const refreshTokens =
      await this.prisma.refreshToken.findMany({
        where: {
          userId,
          revokedAt: null,
        },
      });

    return refreshTokens.map(
      RefreshTokenMapper.toDomain,
    );
  }

  async findByTokenHash(
    tokenHash: string,
  ): Promise<RefreshToken | null> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: {
        tokenHash,
      },
    });

    return refreshToken
      ? RefreshTokenMapper.toDomain(refreshToken)
      : null;
  }

  async revoke(id: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: {
        id,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async revokeAllByUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
