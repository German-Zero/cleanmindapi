import { IsBoolean, IsEnum } from "class-validator";
import { NotificationFrequency } from "../../domain/enums/notification-frequency.enum";

export class UpdateNotificationPreferencesRequest {
  @IsBoolean()
  emailNotifications!: boolean;

  @IsBoolean()
  whatsappNotifications!: boolean;

  @IsBoolean()
  discordNotifications!: boolean;

  @IsEnum(NotificationFrequency)
  taskNotificationFrequency!: NotificationFrequency
}
