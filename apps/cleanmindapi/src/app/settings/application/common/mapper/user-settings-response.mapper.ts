import { UserSettings } from "../../../domain/entities/user-settings.entity";
import { UserSettingsResponse } from "../responses/user-settings.response";

export class UserSettingsResponseMapper {
  static toResponse(
    settings: UserSettings,
  ): UserSettingsResponse {
    return {
      theme: settings.theme,
      backgroundMotion: settings.backgroundMotion,
      emailNotifications: settings.emailNotifications,
      whatsappNotifications: settings.whatsappNotifications,
      discordNotifications: settings.discordNotifications,
      taskNotificationFrequency: settings.taskNotificationFrequency,
      motivationalMessages: settings.motivationalMessages,
      motivationFrequency: settings.motivationFrequency,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }
}
