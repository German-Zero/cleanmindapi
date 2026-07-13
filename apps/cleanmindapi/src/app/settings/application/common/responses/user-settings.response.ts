import { MotivationFrequency } from "../../../domain/enums/motivation-frequency.enum";
import { NotificationFrequency } from "../../../domain/enums/notification-frequency.enum";
import { Theme } from "../../../domain/enums/theme.enum";

export class UserSettingsResponse {
  theme!: Theme;
  emailNotifications!: boolean;
  whatsappNotifications!: boolean;
  discordNotifications!: boolean;
  taskNotificationFrequency!: NotificationFrequency;
  motivationalMessages!: boolean;
  motivationFrequency!: MotivationFrequency;
  createdAt!: Date;
  updatedAt!: Date;
}
