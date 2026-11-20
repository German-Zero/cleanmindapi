import { LoginResponse } from '../../common/responses/auth-response';
import { LoginUserCommand } from '../../commands/login-user.command';

export abstract class LoginUserPort {
  abstract execute(command: LoginUserCommand): Promise<LoginResponse>;
}
