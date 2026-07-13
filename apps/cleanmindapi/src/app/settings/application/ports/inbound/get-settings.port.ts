import { GetSettingsCommand } from "../../commands/get-settings.command";
import { UserSettingsResponse } from "../../common/responses/user-settings.response";

export abstract class GetSettingsPort {
  abstract execute(command: GetSettingsCommand): Promise<UserSettingsResponse>
}
