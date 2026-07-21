import { Injectable, NotFoundException } from "@nestjs/common";
import { UserSettingsRepository } from "../../domain/repositories/user-settings.repository";
import { UserSettings } from "../../domain/entities/user-settings.entity";

@Injectable()
export class SettingsLoaderService {
  constructor(
    private readonly repo: UserSettingsRepository
  ) {}

  async load(userId: string): Promise<UserSettings> {
    const settings = await this.repo.findByUserId(userId)

    if (!settings) throw new NotFoundException('Settings not found')

    return settings
  }
}
