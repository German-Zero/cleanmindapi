import { DeleteTaskCommand } from "../../commands/delete-task.command";

export abstract class DeleteTaskPort {
  abstract execute(command: DeleteTaskCommand): Promise<void>
}
