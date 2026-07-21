import { UpdateMotivationalPreferencesCommand } from "../../commands/update-motivational-preferences.command";
import { UserSettingsResponse } from "../../common/responses/user-settings.response";

export abstract class UpdateMotivationalPreferencesPort {
  abstract execute(command: UpdateMotivationalPreferencesCommand): Promise<UserSettingsResponse>
}
