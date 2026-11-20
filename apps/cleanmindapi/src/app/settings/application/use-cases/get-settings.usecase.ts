import { Injectable } from '@nestjs/common';
import { GetSettingsPort } from '../ports/inbound/get-settings.port';
import { GetSettingsQuery } from '../queries/get-settings.query';
import { UserSettingsResponse } from '../common/responses/user-settings.response';
import { UserSettingsResponseMapper } from '../common/mapper/user-settings-response.mapper';
import { SettingsLoaderService } from '../services/settings-loader.service';

@Injectable()
export class GetSettingsUseCase implements GetSettingsPort {
  constructor(private readonly settingsLoader: SettingsLoaderService) {}

  async execute(query: GetSettingsQuery): Promise<UserSettingsResponse> {
    const settings = await this.settingsLoader.load(query.userId);

    return UserSettingsResponseMapper.toResponse(settings);
  }
}
