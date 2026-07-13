import { UpdateThemeCommand } from "../../commands/update-theme.command";
import { UserSettingsResponse } from "../../common/responses/user-settings.response";

export abstract class UpdateThemePort {
  abstract execute(command: UpdateThemeCommand): Promise<UserSettingsResponse>
}
