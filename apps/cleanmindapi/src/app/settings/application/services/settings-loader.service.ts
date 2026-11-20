import { Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../shared/application/errors/application-error';
import { UserSettingsRepository } from '../../domain/repositories/user-settings.repository';
import { UserSettings } from '../../domain/entities/user-settings.entity';

@Injectable()
export class SettingsLoaderService {
  constructor(private readonly repo: UserSettingsRepository) {}

  async load(userId: string): Promise<UserSettings> {
    const settings = await this.repo.findByUserId(userId);

    if (!settings)
      throw new ApplicationError('SETTINGS_NOT_FOUND', 'Settings not found');

    return settings;
  }
}
