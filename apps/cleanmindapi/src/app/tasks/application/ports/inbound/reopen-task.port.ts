import { TaskActionCommand } from "../../commands/task-action.command";
import { TaskResponse } from "../../common/responses/task.response";

export abstract class ReopenTaskPort {
  abstract execute(command: TaskActionCommand): Promise<TaskResponse>
}
