import { LogoutCommand } from "../../commands/logout.command";

export abstract class LogoutPort {
  abstract execute(command: LogoutCommand): Promise<void>
}
