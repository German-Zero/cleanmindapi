import { SetPasswordCommand } from "../../commands/set-password.command";

export abstract class SetPasswordPort {
  abstract execute(command: SetPasswordCommand): Promise<void>
}
