import { Notification } from "../../../domain/entities/notification.entity";
import { NotificationChannel } from "../../../domain/enums/notification-channel.enum";
import { NotificationType } from "../../../domain/enums/notification-type.enum";

export abstract class NotificationSenderPort {
  abstract readonly channel: NotificationChannel;
  abstract send<T extends NotificationType>(
    userId: string,
    notification: Notification<T>,
  ): Promise<void>
}
