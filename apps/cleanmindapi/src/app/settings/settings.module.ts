import { Module } from "@nestjs/common";
import { PrismaModule } from "../shared/infrastructure/prisma/prisma.module";
import { SettingsController } from "./api/controllers/settings.controller";
import { SettingsLoaderService } from "./application/services/settings-loader.service";
import { UserSettingsRepository } from "./domain/repositories/user-settings.repository";
import { PrismaUserSettingsRepository } from "./infrastructure/repositories/prisma-user-settings.reopsitory";
import { GetSettingsUseCase } from "./application/use-cases/get-settings.usercase";
import { GetSettingsPort } from "./application/ports/inbound/get-settings.port";
import { UpdateThemeUseCase } from "./application/use-cases/update-theme.usecase";
import { UpdateThemePort } from "./application/ports/inbound/update-theme.port";
import { UpdateNotificationPreferencesUseCase } from "./application/use-cases/update-notification-preferences.usecase";
import { UpdateNotificationPreferencesPort } from "./application/ports/inbound/update-notification-preferences.port";
import { UpdateMotivationalPreferencesUseCase } from "./application/use-cases/update-motivational-preferences.usecase";
import { UpdateMotivationalPreferencesPort } from "./application/ports/inbound/update-motivational-preferences.port";

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [
    SettingsController,
  ],
  providers: [


    // Services

    SettingsLoaderService,

    // Use-cases

    GetSettingsUseCase,
    {
      provide: GetSettingsPort,
      useExisting: GetSettingsUseCase,
    },

    UpdateThemeUseCase,
    {
      provide: UpdateThemePort,
      useExisting: UpdateThemeUseCase,
    },

    UpdateNotificationPreferencesUseCase,
    {
      provide: UpdateNotificationPreferencesPort,
      useExisting: UpdateNotificationPreferencesUseCase,
    },

    UpdateMotivationalPreferencesUseCase,
    {
      provide: UpdateMotivationalPreferencesPort,
      useExisting: UpdateMotivationalPreferencesUseCase,
    },

    // Repository

    PrismaUserSettingsRepository,
    {
      provide: UserSettingsRepository,
      useExisting: PrismaUserSettingsRepository,
    },
  ],
  exports: [
    UserSettingsRepository,
  ],
})
export class SettingsModule {}
