import { Injectable } from "@nestjs/common";
import { NotificationSenderPort } from "../../application/ports/outbound/notification-sender.port";
import { NotificationChannel } from "../../domain/enums/notification-channel.enum";
import { Resend } from "resend";
import { ConfigService } from "@nestjs/config";
import { Notification } from "../../domain/entities/notification.entity";

@Injectable()
export class EmailNotificationAdapter implements NotificationSenderPort {
  readonly channel = NotificationChannel.EMAIL
  private readonly resend: Resend;

  constructor(
    private readonly config: ConfigService
  ) {
    this.resend = new Resend(this.config.getOrThrow<string>('mail.apiKey'))
  }

  async send(notification: Notification): Promise<void> {
    await this.resend.emails.send({
      from: this.config.getOrThrow<string>('mail.from'),
      to: notification.recipient,
      subject: notification.title,
      html: this.buildTemplate(notification)
    })
  }

  private buildTemplate(notification: Notification): string {
    return `
    <h2>${notification.title}</h2>
    <p>${notification.message}</p>
    `;
  }
}
