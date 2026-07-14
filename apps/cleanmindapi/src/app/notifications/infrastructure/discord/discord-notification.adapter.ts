import { Injectable, Logger } from "@nestjs/common";
import { NotificationSenderPort } from "../../application/ports/outbound/notification-sender.port";
import { NotificationChannel } from "../../domain/enums/notification-channel.enum";
import { Notification } from "../../domain/entities/notification.entity";

@Injectable()
export class DiscordNotificationAdapter implements NotificationSenderPort {
  readonly channel = NotificationChannel.DISCORD

  private readonly logger = new Logger(DiscordNotificationAdapter.name)

  async send(notification: Notification): Promise<void> {
    this.logger.log(
      `[Discord] ${notification.title}`
    );
  }
}
