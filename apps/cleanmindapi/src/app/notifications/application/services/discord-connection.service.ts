import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';

import { DiscordConnection } from '../../domain/models/discord-connection.model';
import { DiscordConnectionRepository } from '../../domain/repositories/discord-connection.repository';
import { DiscordApiService } from '../../infrastructure/discord/discord-api.service';

@Injectable()
export class DiscordConnectionService {
  private readonly stateLifetimeMs = 10 * 60 * 1000;

  constructor(
    private readonly connections: DiscordConnectionRepository,
    private readonly discord: DiscordApiService,
  ) {}

  async createAuthorizationUrl(userId: string): Promise<string> {
    const state = randomBytes(32).toString('base64url');

    await this.connections.createOAuthState(
      userId,
      this.hash(state),
      new Date(Date.now() + this.stateLifetimeMs),
    );

    return this.discord.createAuthorizationUrl(state);
  }

  async completeConnection(code: string, state: string): Promise<DiscordConnection> {
    const userId = await this.connections.consumeOAuthState(this.hash(state));

    if (!userId) {
      throw new UnauthorizedException('Discord OAuth state is invalid or expired');
    }

    const profile = await this.discord.getProfileFromCode(code);
    const existing = await this.connections.findByDiscordUserId(profile.id);

    if (existing && existing.userId !== userId) {
      throw new ConflictException(
        'This Discord account is already connected to another CleanMind user',
      );
    }

    return this.connections.upsert(userId, profile);
  }

  findByUserId(userId: string): Promise<DiscordConnection | null> {
    return this.connections.findByUserId(userId);
  }

  disconnect(userId: string): Promise<void> {
    return this.connections.deleteByUserId(userId);
  }

  async sendTestMessage(userId: string): Promise<void> {
    const connection = await this.connections.findByUserId(userId);

    if (!connection) {
      throw new NotFoundException('Discord account is not connected');
    }

    await this.discord.sendDirectMessage(
      connection.discordUserId,
      '✅ CleanMind quedó conectado. Recibirás aquí tus notificaciones personales.',
    );
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
