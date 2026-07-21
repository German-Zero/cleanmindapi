import { GetTasksCommand } from "../../commands/get-tasks.command";
import { TaskResponse } from "../../common/responses/task.response";

export abstract class GetTasksPort {
  abstract execute(command: GetTasksCommand): Promise<TaskResponse[]>
}
