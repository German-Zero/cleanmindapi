import { Injectable } from "@nestjs/common";
import { GetTaskPort } from "../../ports/inbound/get-task.port";
import { GetTaskCommand } from "../../commands/get-task.command";
import { TaskResponse } from "../../common/responses/task.response";
import { TaskResponseMapper } from "../../common/mapper/task-response.mapper";
import { TaskOwnerService } from "../../services/task-owner.service";

@Injectable()
export class GetTaskUseCase implements GetTaskPort {
  constructor(
    private readonly taskOwnerService: TaskOwnerService
  ) {}

  async execute(command: GetTaskCommand): Promise<TaskResponse> {
    const task = await this.taskOwnerService.getOwnedTask(command.taskId, command.userId)

    return TaskResponseMapper.toResponse(task)
  }
}
