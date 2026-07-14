import { Injectable } from "@nestjs/common";
import { Notification } from "../../domain/entities/notification.entity";
import { NotificationType } from "../../domain/enums/notification-type.enum";

@Injectable()
export class NotificationFactory {
  buildTaskReminder( recipient: string, taskTitle: string ): Notification {
    return Notification.create({
      recipient,
      title: 'Task Reminder',
      message: `Don't forget to complete "${taskTitle}".`,
      type: NotificationType.TASK_REMINDER,
    });
  }

  buildTaskOverdue( recipient: string, taskTitle: string ): Notification {
    return Notification.create({
      recipient,
      title: 'Task Overdue',
      message: `"${taskTitle}" is overdue.`,
      type: NotificationType.TASK_OVERDUE,
    });
  }

  buildTaskCompleted( recipient: string,taskTitle: string ): Notification {
    return Notification.create({
      recipient,
      title: 'Task Completed',
      message: `Great job! You completed "${taskTitle}".`,
      type: NotificationType.TASK_COMPLETED,
    });
  }

  buildMotivational( recipient: string,message: string ): Notification {
    return Notification.create({
      recipient,
      title: 'CleanMind',
      message,
      type: NotificationType.MOTIVATIONAL,
    });
  }

  buildVerifyEmail( recipient: string,verificationUrl: string ): Notification {
    return Notification.create({
      recipient,
      title: 'Verify your email',
      message: verificationUrl,
      type: NotificationType.VERIFY_EMAIL,
    });
  }

  buildPasswordReset( recipient: string,resetUrl: string ): Notification {
    return Notification.create({
      recipient,
      title: 'Reset your password',
      message: resetUrl,
      type: NotificationType.PASSWORD_RESET,
    });
  }
}
