import { DiscordConnection, DiscordProfile } from '../models/discord-connection.model';

export abstract class DiscordConnectionRepository {
  abstract findByUserId(userId: string): Promise<DiscordConnection | null>;
  abstract findByDiscordUserId(discordUserId: string): Promise<DiscordConnection | null>;
  abstract upsert(userId: string, profile: DiscordProfile): Promise<DiscordConnection>;
  abstract deleteByUserId(userId: string): Promise<void>;
  abstract createOAuthState(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void>;
  abstract consumeOAuthState(tokenHash: string): Promise<string | null>;
}
