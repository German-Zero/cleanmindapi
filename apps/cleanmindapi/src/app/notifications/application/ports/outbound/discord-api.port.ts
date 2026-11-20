import { DiscordProfile } from '../../../domain/models/discord-connection.model';

export abstract class DiscordApiPort {
  abstract createAuthorizationUrl(state: string): string;
  abstract getProfileFromCode(code: string): Promise<DiscordProfile>;
  abstract sendDirectMessage(
    discordUserId: string,
    content: string,
  ): Promise<void>;
}
