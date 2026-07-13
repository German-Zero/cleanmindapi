import { Injectable } from "@nestjs/common";
import { UpdateMotivationalPreferencesPort } from "../ports/inbound/update-motivational-preferences.port";
import { UserSettingsRepository } from "../../domain/repositories/user-settings.repository";
import { UpdateMotivationalPreferencesCommand } from "../commands/update-motivational-preferences.command";
import { UserSettingsResponse } from "../common/responses/user-settings.response";
import { UserSettingsResponseMapper } from "../common/mapper/user-settings-response.mapper";
import { SettingsLoaderService } from "../services/settings-loader.service";

@Injectable()
export class UpdateMotivationalPreferencesUseCase implements UpdateMotivationalPreferencesPort {
  constructor(
    private readonly repository: UserSettingsRepository,
    private readonly settingsLoader: SettingsLoaderService,
  ) {}

  async execute( command: UpdateMotivationalPreferencesCommand ): Promise<UserSettingsResponse> {

    const settings = await this.settingsLoader.load( command.userId );

    settings.updateMotivationalMessages(
      command.motivationalMessages,
      command.motivationFrequency,
    );

    const updated = await this.repository.update( settings );

    return UserSettingsResponseMapper.toResponse( updated );
  }
}
