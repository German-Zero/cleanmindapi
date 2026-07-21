import { NotificationType } from '../../../notifications/domain/enums/notification-type.enum';
import { MailTemplate } from '../enums/mail-template.enum';

export const MAIL_TEMPLATE_BY_NOTIFICATION_TYPE: Record<
  NotificationType,
  MailTemplate
> = {
  [NotificationType.VERIFY_EMAIL]: MailTemplate.VERIFY_EMAIL,
  [NotificationType.PASSWORD_RESET]: MailTemplate.PASSWORD_RESET,
  [NotificationType.TASK_REMINDER]: MailTemplate.TASK_REMINDER,
  [NotificationType.TASK_OVERDUE]: MailTemplate.TASK_OVERDUE,
  [NotificationType.TASK_COMPLETED]: MailTemplate.TASK_COMPLETED,
  [NotificationType.MOTIVATIONAL]: MailTemplate.MOTIVATIONAL,
};
