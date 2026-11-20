import { GetSettingsQuery } from '../../queries/get-settings.query';
import { UserSettingsResponse } from '../../common/responses/user-settings.response';

export abstract class GetSettingsPort {
  abstract execute(query: GetSettingsQuery): Promise<UserSettingsResponse>;
}
