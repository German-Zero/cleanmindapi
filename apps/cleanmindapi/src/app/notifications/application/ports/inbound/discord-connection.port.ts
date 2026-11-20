import { DiscordConnection } from '../../../domain/models/discord-connection.model';

export abstract class DiscordConnectionPort {
  abstract createAuthorizationUrl(userId: string): Promise<string>;
  abstract completeConnection(
    code: string,
    state: string,
  ): Promise<DiscordConnection>;
  abstract findByUserId(userId: string): Promise<DiscordConnection | null>;
  abstract disconnect(userId: string): Promise<void>;
  abstract sendTestMessage(userId: string): Promise<void>;
}
