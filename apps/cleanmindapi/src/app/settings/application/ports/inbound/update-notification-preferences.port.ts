import { UpdateNotificationPreferencesCommand } from "../../commands/update-notification-preferences.command";
import { UserSettingsResponse } from "../../common/responses/user-settings.response";

export abstract class UpdateNotificationPreferencesPort {
  abstract execute(command: UpdateNotificationPreferencesCommand): Promise<UserSettingsResponse>
}
