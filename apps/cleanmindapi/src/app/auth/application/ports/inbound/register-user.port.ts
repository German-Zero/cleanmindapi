import { AuthResponse } from '../../common/responses/auth-response';
import { RegisterUserCommand } from '../../commands/register-user.command';

export abstract class RegisterUserPort {
  abstract execute(command: RegisterUserCommand): Promise<AuthResponse>;
}
