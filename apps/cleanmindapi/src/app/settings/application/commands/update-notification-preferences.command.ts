import { NotificationFrequency } from "../../domain/enums/notification-frequency.enum";

export class UpdateNotificationPreferencesCommand {
  constructor(
    public readonly userId: string,
    public readonly emailNotifications: boolean,
    public readonly whatsappNotifications: boolean,
    public readonly discordNotifications: boolean,
    public readonly taskNotificationFrequency: NotificationFrequency,
  ) {}
}
