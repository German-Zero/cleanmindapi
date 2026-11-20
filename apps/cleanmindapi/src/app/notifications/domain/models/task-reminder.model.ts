import { NotificationFrequency } from '../../../settings/domain/enums/notification-frequency.enum';

export interface TaskReminderSettings {
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  discordNotifications: boolean;
  taskNotificationFrequency: NotificationFrequency;
  timezone: string;
}

export interface TaskReminderCandidate {
  taskId: string;
  userId: string;
  title: string;
  dueDate: Date;
  recipientEmail: string;
  settings: TaskReminderSettings | null;
}
