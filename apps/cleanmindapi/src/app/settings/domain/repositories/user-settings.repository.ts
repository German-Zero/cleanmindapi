import { UserSettings } from "../entities/user-settings.entity";

export abstract class UserSettingsRepository {
  abstract findByUserId(userId: string): Promise<UserSettings | null>
  abstract create(settings: UserSettings): Promise<UserSettings>
  abstract update(settings: UserSettings): Promise<UserSettings>
}
