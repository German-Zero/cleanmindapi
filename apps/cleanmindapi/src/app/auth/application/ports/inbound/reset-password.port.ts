import { ResetPasswordCommand } from "../../commands/reset-password.command";

export abstract class ResetPasswordPort {
  abstract execute(command: ResetPasswordCommand): Promise<void>;
}
