import {
  Prisma,
  UserSettings as PrismaUserSettings,
  Theme as PrismaTheme,
  NotificationFrequency as PrismaNotificationFrequency,
  MotivationFrequency as PrismaMotivationFrequency,
} from '@prisma/client'

import { UserSettings } from '../../domain/entities/user-settings.entity';
import { Theme } from '../../domain/enums/theme.enum';
import { NotificationFrequency } from '../../domain/enums/notification-frequency.enum';
import { MotivationFrequency } from '../../domain/enums/motivation-frequency.enum';

export class UserSettingsMapper {
  static toDomain(
    settings: PrismaUserSettings,
  ): UserSettings {
    return UserSettings.restore({
      id: settings.id,
      userId: settings.userId,

      theme: settings.theme as Theme,

      emailNotifications:
        settings.emailNotifications,

      whatsappNotifications:
        settings.whatsappNotifications,

      discordNotifications:
        settings.discordNotifications,

      taskNotificationFrequency:
        settings.taskNotificationFrequency as NotificationFrequency,

      motivationalMessages:
        settings.motivationalMessages,

      motivationFrequency:
        settings.motivationFrequency as MotivationFrequency,

      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    });
  }

  static toCreatePersistence(
    settings: UserSettings,
  ): Prisma.UserSettingsUncheckedCreateInput {
    return {
      userId: settings.userId,

      theme:
        settings.theme as PrismaTheme,

      emailNotifications:
        settings.emailNotifications,

      whatsappNotifications:
        settings.whatsappNotifications,

      discordNotifications:
        settings.discordNotifications,

      taskNotificationFrequency:
        settings.taskNotificationFrequency as PrismaNotificationFrequency,

      motivationalMessages:
        settings.motivationalMessages,

      motivationFrequency:
        settings.motivationFrequency as PrismaMotivationFrequency,

      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }

  static toUpdatePersistence(
    settings: UserSettings,
  ): Prisma.UserSettingsUncheckedUpdateInput {
    return {
      theme:
        settings.theme as PrismaTheme,

      emailNotifications:
        settings.emailNotifications,

      whatsappNotifications:
        settings.whatsappNotifications,

      discordNotifications:
        settings.discordNotifications,

      taskNotificationFrequency:
        settings.taskNotificationFrequency as PrismaNotificationFrequency,

      motivationalMessages:
        settings.motivationalMessages,

      motivationFrequency:
        settings.motivationFrequency as PrismaMotivationFrequency,

      updatedAt: settings.updatedAt,
    };
  }
}
