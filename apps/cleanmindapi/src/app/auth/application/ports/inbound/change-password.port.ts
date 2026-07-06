import { ChangePasswordCommand } from "../../commands/change-password.command";

export abstract class ChangePasswordPort {
  abstract execute(command: ChangePasswordCommand): Promise<void>
}
