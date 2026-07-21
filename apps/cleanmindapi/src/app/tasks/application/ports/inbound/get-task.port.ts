import { GetTaskCommand } from "../../commands/get-task.command";
import { TaskResponse } from "../../common/responses/task.response";

export abstract class GetTaskPort {
  abstract execute(command: GetTaskCommand): Promise<TaskResponse>
}
