import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { DiscordConnection, DiscordProfile } from '../../domain/models/discord-connection.model';
import { DiscordConnectionRepository } from '../../domain/repositories/discord-connection.repository';

@Injectable()
export class PrismaDiscordConnectionRepository
  implements DiscordConnectionRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<DiscordConnection | null> {
    return this.prisma.discordConnection.findUnique({ where: { userId } });
  }

  async findByDiscordUserId(
    discordUserId: string,
  ): Promise<DiscordConnection | null> {
    return this.prisma.discordConnection.findUnique({
      where: { discordUserId },
    });
  }

  async upsert(
    userId: string,
    profile: DiscordProfile,
  ): Promise<DiscordConnection> {
    return this.prisma.discordConnection.upsert({
      where: { userId },
      create: {
        userId,
        discordUserId: profile.id,
        username: profile.username,
        globalName: profile.globalName,
        avatarHash: profile.avatarHash,
      },
      update: {
        discordUserId: profile.id,
        username: profile.username,
        globalName: profile.globalName,
        avatarHash: profile.avatarHash,
      },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.discordConnection.deleteMany({ where: { userId } });
  }

  async createOAuthState(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.discordOAuthState.deleteMany({ where: { userId } }),
      this.prisma.discordOAuthState.create({
        data: { userId, tokenHash, expiresAt },
      }),
    ]);
  }

  async consumeOAuthState(tokenHash: string): Promise<string | null> {
    const state = await this.prisma.discordOAuthState.findUnique({
      where: { tokenHash },
    });

    if (!state) return null;

    const deleted = await this.prisma.discordOAuthState.deleteMany({
      where: { id: state.id },
    });

    if (deleted.count !== 1 || state.expiresAt <= new Date()) return null;

    return state.userId;
  }
}
