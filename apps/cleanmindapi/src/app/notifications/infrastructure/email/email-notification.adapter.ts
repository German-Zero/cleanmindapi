import { Injectable } from "@nestjs/common";
import { NotificationSenderPort } from "../../application/ports/outbound/notification-sender.port";
import { NotificationChannel } from "../../domain/enums/notification-channel.enum";
import { Resend } from "resend";
import { ConfigService } from "@nestjs/config";
import { Notification } from "../../domain/entities/notification.entity";
import { NotificationType } from '../../domain/enums/notification-type.enum';
import { NotificationTemplateService } from '../templates/notification-template.service';

@Injectable()
export class EmailNotificationAdapter implements NotificationSenderPort {
  readonly channel = NotificationChannel.EMAIL
  private readonly resend: Resend;

  constructor(
    private readonly config: ConfigService,
    private readonly templates: NotificationTemplateService,
  ) {
    this.resend = new Resend(this.config.getOrThrow<string>('auth.mail.apiKey'))
  }

  async send<T extends NotificationType>(
    _userId: string,
    notification: Notification<T>,
  ): Promise<void> {
    await this.resend.emails.send({
      from: this.config.getOrThrow<string>('auth.mail.from'),
      to: notification.recipient,
      subject: this.templates.subject(notification.type),
      html: this.templates.renderEmail(notification),
    })
  }
}
