import { UpdateTaskCommand } from "../../commands/update-task.command";
import { TaskResponse } from "../../common/responses/task.response";

export abstract class UpdateTaskPort {
  abstract execute(command: UpdateTaskCommand): Promise<TaskResponse>
}
