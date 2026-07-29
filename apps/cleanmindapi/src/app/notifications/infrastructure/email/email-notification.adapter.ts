import { Injectable } from '@nestjs/common';
import { NotificationSenderPort } from '../../application/ports/outbound/notification-sender.port';
import { NotificationChannel } from '../../domain/enums/notification-channel.enum';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import { NotificationTemplateService } from '../templates/notification-template.service';
import { BrevoMailService } from '../../../shared/mail/brevo-mail.service';

@Injectable()
export class EmailNotificationAdapter implements NotificationSenderPort {
  readonly channel = NotificationChannel.EMAIL;
  constructor(
    private readonly mail: BrevoMailService,
    private readonly templates: NotificationTemplateService,
  ) {}

  async send<T extends NotificationType>(
    _userId: string,
    notification: Notification<T>,
  ): Promise<void> {
    await this.mail.send({
      to: notification.recipient,
      subject: this.templates.subject(notification.type),
      htmlContent: this.templates.renderEmail(notification),
    });
  }
}
