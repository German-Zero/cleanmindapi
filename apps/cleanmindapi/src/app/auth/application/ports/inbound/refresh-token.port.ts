import { AuthResponse } from '../../common/responses/auth-response';
import { RefreshTokenCommand } from '../../commands/refresh-token.command';

export abstract class RefreshTokenPort {
  abstract execute(command: RefreshTokenCommand): Promise<AuthResponse>;
}
