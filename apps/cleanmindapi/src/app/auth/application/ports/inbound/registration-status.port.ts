import { RegistrationStatusResponse } from '../../common/responses/registration-status.response';

export abstract class RegistrationStatusPort {
  abstract getStatus(): Promise<RegistrationStatusResponse>;
}
