import { Injectable } from "@nestjs/common";
import { Notification } from "../../domain/entities/notification.entity";
import { NotificationType } from "../../domain/enums/notification-type.enum";

@Injectable()
export class NotificationFactory {
  buildTaskReminder( recipient: string, taskTitle: string, dueDate: Date ): Notification {
    return Notification.create({
      recipient,
      payload: { taskTitle, dueDate},
      type: NotificationType.TASK_REMINDER,
    });
  }

  buildTaskOverdue( recipient: string, taskTitle: string, dueDate: Date ): Notification {
    return Notification.create({
      recipient,
      payload: { taskTitle, dueDate},
      type: NotificationType.TASK_OVERDUE,
    });
  }

  buildTaskCompleted( recipient: string, taskTitle: string ): Notification {
    return Notification.create({
      recipient,
      payload: { taskTitle, completedAt: new Date() },
      type: NotificationType.TASK_COMPLETED,
    });
  }

  buildMotivational( recipient: string, quote: string ): Notification {
    return Notification.create({
      recipient,
      payload: { quote },
      type: NotificationType.MOTIVATIONAL,
    });
  }

  buildVerifyEmail( recipient: string,verificationUrl: string ): Notification {
    return Notification.create({
      recipient,
      payload: { verificationUrl, },
      type: NotificationType.VERIFY_EMAIL,
    });
  }

  buildPasswordReset( recipient: string,resetUrl: string ): Notification {
    return Notification.create({
      recipient,
      payload: { resetUrl },
      type: NotificationType.PASSWORD_RESET,
    });
  }
}
