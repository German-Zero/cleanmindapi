import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { ApplicationError } from '../../../shared/application/errors/application-error';

import { DiscordConnection } from '../../domain/models/discord-connection.model';
import { DiscordConnectionRepository } from '../../domain/repositories/discord-connection.repository';
import { DiscordApiPort } from '../ports/outbound/discord-api.port';
import { DiscordConnectionPort } from '../ports/inbound/discord-connection.port';

@Injectable()
export class DiscordConnectionService implements DiscordConnectionPort {
  private readonly stateLifetimeMs = 10 * 60 * 1000;

  constructor(
    private readonly connections: DiscordConnectionRepository,
    private readonly discord: DiscordApiPort,
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

  async completeConnection(
    code: string,
    state: string,
  ): Promise<DiscordConnection> {
    const userId = await this.connections.consumeOAuthState(this.hash(state));

    if (!userId) {
      throw new ApplicationError(
        'DISCORD_UNAUTHORIZED',
        'Discord OAuth state is invalid or expired',
      );
    }

    const profile = await this.discord.getProfileFromCode(code);
    const existing = await this.connections.findByDiscordUserId(profile.id);

    if (existing && existing.userId !== userId) {
      throw new ApplicationError(
        'DISCORD_CONFLICT',
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
      throw new ApplicationError(
        'DISCORD_NOT_FOUND',
        'Discord account is not connected',
      );
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
