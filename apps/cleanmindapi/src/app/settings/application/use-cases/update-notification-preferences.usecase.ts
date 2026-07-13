import { Injectable } from "@nestjs/common";
import { UpdateNotificationPreferencesPort } from "../ports/inbound/update-notification-preferences.port";
import { UserSettingsRepository } from "../../domain/repositories/user-settings.repository";
import { UserSettingsResponse } from "../common/responses/user-settings.response";
import { UpdateNotificationPreferencesCommand } from "../commands/update-notification-preferences.command";
import { UserSettingsResponseMapper } from "../common/mapper/user-settings-response.mapper";
import { SettingsLoaderService } from "../services/settings-loader.service";

@Injectable()
export class UpdateNotificationPreferencesUseCase implements UpdateNotificationPreferencesPort {
  constructor(
    private readonly repository: UserSettingsRepository,
    private readonly settingsLoader: SettingsLoaderService,
  ) {}

  async execute(command: UpdateNotificationPreferencesCommand): Promise<UserSettingsResponse> {

    const settings = await this.settingsLoader.load( command.userId )

    settings.updateNotificationChannels(
      command.emailNotifications,
      command.whatsappNotifications,
      command.discordNotifications,
    );

    settings.changeTaskNotificationFrequency( command.taskNotificationFrequency );

    const updated = await this.repository.update( settings );

    return UserSettingsResponseMapper.toResponse( updated );
  }
}
