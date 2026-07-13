import { Injectable } from "@nestjs/common";
import { GetSettingsPort } from "../ports/inbound/get-settings.port";
import { GetSettingsCommand } from "../commands/get-settings.command";
import { UserSettingsResponse } from "../common/responses/user-settings.response";
import { UserSettingsResponseMapper } from "../common/mapper/user-settings-response.mapper";
import { SettingsLoaderService } from "../services/settings-loader.service";

@Injectable()
export class GetSettingsUseCase implements GetSettingsPort {
  constructor(
    private readonly settingsLoader: SettingsLoaderService,
  ) {}

  async execute( command: GetSettingsCommand ): Promise<UserSettingsResponse> {

    const settings = await this.settingsLoader.load( command.userId );

    return UserSettingsResponseMapper.toResponse( settings );
  }
}
