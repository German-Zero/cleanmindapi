import { Injectable, Logger } from "@nestjs/common";
import { NotificationSenderPort } from "../../application/ports/outbound/notification-sender.port";
import { NotificationChannel } from "../../domain/enums/notification-channel.enum";
import { Notification } from "../../domain/entities/notification.entity";
import { NotificationType } from '../../domain/enums/notification-type.enum';
import { NotificationTemplateService } from '../templates/notification-template.service';

@Injectable()
export class WhatsappNotificationAdapter implements NotificationSenderPort {
  readonly channel = NotificationChannel.WHATSAPP

  private readonly logger = new Logger(WhatsappNotificationAdapter.name)

  constructor(private readonly templates: NotificationTemplateService) {}

  async send<T extends NotificationType>(
    _userId: string,
    notification: Notification<T>,
  ): Promise<void> {
    const message = this.templates.renderWhatsapp(notification);
    this.logger.log(`[WhatsApp:${notification.recipient}] ${message}`)
  }
}
