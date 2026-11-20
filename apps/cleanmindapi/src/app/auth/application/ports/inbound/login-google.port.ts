import { LoginResponse } from '../../common/responses/auth-response';
import { LoginGoogleCommand } from '../../commands/login-google.command';

export abstract class LoginGooglePort {
  abstract execute(command: LoginGoogleCommand): Promise<LoginResponse>;
}
