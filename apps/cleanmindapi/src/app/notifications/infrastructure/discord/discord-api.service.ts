import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { DiscordProfile } from '../../domain/models/discord-connection.model';

interface DiscordTokenResponse {
  access_token: string;
}

interface DiscordUserResponse {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
}

interface DiscordChannelResponse {
  id: string;
}

@Injectable()
export class DiscordApiService {
  private readonly apiBaseUrl = 'https://discord.com/api/v10';

  constructor(private readonly config: ConfigService) {}

  createAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.getOrThrow<string>('notifications.discord.clientId'),
      redirect_uri: this.config.getOrThrow<string>('notifications.discord.redirectUri'),
      response_type: 'code',
      scope: 'identify',
      state,
      prompt: 'consent',
    });

    return `https://discord.com/oauth2/authorize?${params.toString()}`;
  }

  async getProfileFromCode(code: string): Promise<DiscordProfile> {
    const token = await axios.post<DiscordTokenResponse>(
      `${this.apiBaseUrl}/oauth2/token`,
      new URLSearchParams({
        client_id: this.config.getOrThrow<string>('notifications.discord.clientId'),
        client_secret: this.config.getOrThrow<string>('notifications.discord.clientSecret'),
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.getOrThrow<string>('notifications.discord.redirectUri'),
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: this.timeoutMs,
      },
    );

    const user = await axios.get<DiscordUserResponse>(
      `${this.apiBaseUrl}/users/@me`,
      {
        headers: { Authorization: `Bearer ${token.data.access_token}` },
        timeout: this.timeoutMs,
      },
    );

    return {
      id: user.data.id,
      username: user.data.username,
      globalName: user.data.global_name,
      avatarHash: user.data.avatar,
    };
  }

  async sendDirectMessage(discordUserId: string, content: string): Promise<void> {
    const authorization = `Bot ${this.config.getOrThrow<string>(
      'notifications.discord.botToken',
    )}`;
    const headers = {
      Authorization: authorization,
      'Content-Type': 'application/json',
    };

    const channel = await axios.post<DiscordChannelResponse>(
      `${this.apiBaseUrl}/users/@me/channels`,
      { recipient_id: discordUserId },
      { headers, timeout: this.timeoutMs },
    );

    await axios.post(
      `${this.apiBaseUrl}/channels/${channel.data.id}/messages`,
      {
        content,
        allowed_mentions: { parse: [] },
      },
      { headers, timeout: this.timeoutMs },
    );
  }

  private get timeoutMs(): number {
    return this.config.get<number>('notifications.discord.timeoutMs', 5000);
  }
}
