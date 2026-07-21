import { Injectable, Logger } from '@nestjs/common';

import { NotificationSenderPort } from '../../application/ports/outbound/notification-sender.port';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationChannel } from '../../domain/enums/notification-channel.enum';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import { DiscordConnectionRepository } from '../../domain/repositories/discord-connection.repository';
import { NotificationTemplateService } from '../templates/notification-template.service';
import { DiscordApiService } from './discord-api.service';

@Injectable()
export class DiscordNotificationAdapter implements NotificationSenderPort {
  readonly channel = NotificationChannel.DISCORD;

  private readonly logger = new Logger(DiscordNotificationAdapter.name);

  constructor(
    private readonly connections: DiscordConnectionRepository,
    private readonly discord: DiscordApiService,
    private readonly templates: NotificationTemplateService,
  ) {}

  async send<T extends NotificationType>(
    userId: string,
    notification: Notification<T>,
  ): Promise<void> {
    const connection = await this.connections.findByUserId(userId);

    if (!connection) {
      throw new Error('Discord account is not connected');
    }

    await this.discord.sendDirectMessage(
      connection.discordUserId,
      this.templates.renderDiscord(notification),
    );

    this.logger.debug(`Discord direct message sent: ${notification.type}`);
  }
}
