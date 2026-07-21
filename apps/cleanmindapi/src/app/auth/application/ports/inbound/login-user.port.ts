import { LoginResponse } from "../../../api/response/auth-response";
import { LoginUserCommand } from "../../commands/login-user.command";


export abstract class LoginUserPort {
  abstract execute(command: LoginUserCommand): Promise<LoginResponse>
}
