import { CreateTaskCommand } from "../../commands/create-task.command";
import { TaskResponse } from "../../common/responses/task.response";

export abstract class CreateTaskPort {
  abstract execute(command: CreateTaskCommand): Promise<TaskResponse>
}
