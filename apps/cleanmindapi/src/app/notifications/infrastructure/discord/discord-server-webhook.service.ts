import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { Notification } from '../../domain/entities/notification.entity';
import { NotificationTemplateService } from '../templates/notification-template.service';

@Injectable()
export class DiscordServerWebhookService {
  private readonly logger = new Logger(DiscordServerWebhookService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly templates: NotificationTemplateService,
  ) {}

  async send(message: string): Promise<void> {
    const webhookUrl = this.config.getOrThrow<string>(
      'notifications.discord.webhookUrl',
    );

    this.assertDiscordWebhookUrl(webhookUrl);

    await axios.post(
      webhookUrl,
      {
        content: message,
        username: this.config.get<string>('notifications.discord.username'),
        avatar_url: this.config.get<string>('notifications.discord.avatarUrl'),
        allowed_mentions: { parse: [] },
      },
      {
        timeout: this.config.get<number>(
          'notifications.discord.timeoutMs',
          5000,
        ),
        headers: { 'Content-Type': 'application/json' },
      },
    );

    this.logger.debug('Discord server webhook sent');
  }

  sendNotification(notification: Notification): Promise<void> {
    return this.send(this.templates.renderDiscord(notification));
  }

  private assertDiscordWebhookUrl(webhookUrl: string): void {
    let url: URL;

    try {
      url = new URL(webhookUrl);
    } catch {
      throw new Error('DISCORD_WEBHOOK_URL is not a valid URL');
    }

    const isDiscordHost =
      url.hostname === 'discord.com' ||
      url.hostname.endsWith('.discord.com') ||
      url.hostname === 'discordapp.com' ||
      url.hostname.endsWith('.discordapp.com');
    const isWebhookPath = /^\/api(?:\/v\d+)?\/webhooks\/[^/]+\/[^/]+/.test(
      url.pathname,
    );

    if (url.protocol !== 'https:' || !isDiscordHost || !isWebhookPath) {
      throw new Error('DISCORD_WEBHOOK_URL must be an HTTPS Discord webhook URL');
    }
  }
}
