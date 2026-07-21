import { TaskActionCommand } from "../../commands/task-action.command";
import { TaskResponse } from "../../common/responses/task.response";

export abstract class StartTaskPort {
  abstract execute(command: TaskActionCommand): Promise<TaskResponse>
}
