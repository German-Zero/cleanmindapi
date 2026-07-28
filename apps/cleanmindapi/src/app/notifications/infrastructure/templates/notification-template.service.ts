import { Injectable } from '@nestjs/common';

import { HandlebarsService } from '../../../shared/mail/helpers/handlebars.service';
import { MAIL_TEMPLATE_BY_NOTIFICATION_TYPE } from '../../../shared/mail/helpers/template.map';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import {
  EMAIL_VERIFICATION_EXPIRATION_MINUTES,
  PASSWORD_RESET_EXPIRATION_MINUTES,
} from '../../../shared/application/auth-token-expiration.constants';

const SUBJECTS: Record<NotificationType, string> = {
  [NotificationType.VERIFY_EMAIL]: 'Confirma tu correo en CleanMind',
  [NotificationType.PASSWORD_RESET]: 'Crea una nueva contraseña',
  [NotificationType.TASK_REMINDER]: 'Tienes una tarea próxima',
  [NotificationType.TASK_OVERDUE]: 'Una tarea quedó pendiente',
  [NotificationType.TASK_COMPLETED]: 'Completaste una tarea',
  [NotificationType.MOTIVATIONAL]: 'Un impulso tranquilo para tu día',
};

@Injectable()
export class NotificationTemplateService {
  constructor(private readonly handlebars: HandlebarsService) {}

  subject(type: NotificationType): string {
    return SUBJECTS[type];
  }

  renderEmail(notification: Notification): string {
    return this.handlebars.renderEmail(
      MAIL_TEMPLATE_BY_NOTIFICATION_TYPE[notification.type],
      this.context(notification),
    );
  }

  renderWhatsapp(notification: Notification): string {
    return this.handlebars.renderChannel(
      'whatsapp',
      MAIL_TEMPLATE_BY_NOTIFICATION_TYPE[notification.type],
      this.context(notification),
    );
  }

  renderDiscord(notification: Notification): string {
    return this.handlebars.renderChannel(
      'discord',
      MAIL_TEMPLATE_BY_NOTIFICATION_TYPE[notification.type],
      this.context(notification),
    );
  }

  private context(notification: Notification): Record<string, unknown> {
    const payload = notification.payload as unknown as Record<string, unknown>;
    const context: Record<string, unknown> = { ...payload };

    if (payload.dueDate instanceof Date) {
      context.dueDate = this.formatDate(payload.dueDate);
    }

    if (payload.completedAt instanceof Date) {
      context.completedAt = this.formatDate(payload.completedAt);
    }

    if (notification.type === NotificationType.VERIFY_EMAIL) {
      context.expirationMinutes ??= EMAIL_VERIFICATION_EXPIRATION_MINUTES;
    }

    if (notification.type === NotificationType.PASSWORD_RESET) {
      context.expirationMinutes ??= PASSWORD_RESET_EXPIRATION_MINUTES;
    }

    return context;
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(date);
  }
}
