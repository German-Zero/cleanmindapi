import { NotificationType } from "../enums/notification-type.enum";

export interface TaskReminderPayload {
  taskTitle: string;
  dueDate: Date;
}

export interface TaskOverduePayload {
  taskTitle: string;
  dueDate: Date;
}

export interface TaskCompletedPayload {
  taskTitle: string;
  completedAt: Date;
}

export interface MotivationalPayload {
  quote: string;
}

export interface VerifyEmailPayload {
  verificationUrl: string;
}

export interface PasswordResetPayload {
  resetUrl: string;
}

export interface NotificationPayloadMap {
  [NotificationType.TASK_REMINDER]: TaskReminderPayload;
  [NotificationType.TASK_OVERDUE]: TaskOverduePayload;
  [NotificationType.TASK_COMPLETED]: TaskCompletedPayload;
  [NotificationType.MOTIVATIONAL]: MotivationalPayload;
  [NotificationType.VERIFY_EMAIL]: VerifyEmailPayload;
  [NotificationType.PASSWORD_RESET]: PasswordResetPayload;
}
