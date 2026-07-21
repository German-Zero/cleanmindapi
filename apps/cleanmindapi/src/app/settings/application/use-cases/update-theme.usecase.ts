import { Injectable } from "@nestjs/common";
import { UpdateThemePort } from "../ports/inbound/update-theme.port";
import { UserSettingsRepository } from "../../domain/repositories/user-settings.repository";
import { UpdateThemeCommand } from "../commands/update-theme.command";
import { UserSettingsResponse } from "../common/responses/user-settings.response";
import { UserSettingsResponseMapper } from "../common/mapper/user-settings-response.mapper";
import { SettingsLoaderService } from "../services/settings-loader.service";

@Injectable()
export class UpdateThemeUseCase implements UpdateThemePort {
  constructor(
    private readonly repository: UserSettingsRepository,
    private readonly settingsLodaer: SettingsLoaderService
  ) {}

  async execute(command: UpdateThemeCommand): Promise<UserSettingsResponse> {
    const settings = await this.settingsLodaer.load(command.userId)

    settings.changeTheme(command.theme)

    const updated = await this.repository.update(settings)

    return UserSettingsResponseMapper.toResponse(updated)
  }
}
