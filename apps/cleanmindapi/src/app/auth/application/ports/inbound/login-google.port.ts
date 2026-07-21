import { LoginResponse } from "../../../api/response/auth-response";
import { LoginGoogleCommand } from "../../commands/login-google.command";


export abstract class LoginGooglePort {
  abstract execute(command: LoginGoogleCommand): Promise<LoginResponse>
}
