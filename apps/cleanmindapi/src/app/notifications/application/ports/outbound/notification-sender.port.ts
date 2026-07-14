import { Notification } from "../../../domain/entities/notification.entity";
import { NotificationChannel } from "../../../domain/enums/notification-channel.enum";

export abstract class NotificationSenderPort {
  abstract readonly channel: NotificationChannel;
  abstract send(notification: Notification): Promise<void>
}
