import { ForgotPasswordCommand } from "../../commands/forgot-password.command";

export abstract class ForgotPasswordPort {
  abstract execute(command: ForgotPasswordCommand): Promise<void>;
}
