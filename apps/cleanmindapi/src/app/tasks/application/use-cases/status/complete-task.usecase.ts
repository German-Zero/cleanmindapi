import { Injectable } from "@nestjs/common";
import { CompleteTaskPort } from "../../ports/inbound/complete-task.port";
import { TaskActionCommand } from "../../commands/task-action.command";
import { TaskResponse } from "../../common/responses/task.response";
import { TaskOwnerService } from "../../services/task-owner.service";
import { TaskPersistenceService } from "../../services/task-persistence.service";

@Injectable()
export class CompleteTaskUseCase implements CompleteTaskPort {
  constructor(
    private readonly taskPersistenceService: TaskPersistenceService,
    private readonly taskOwnerService: TaskOwnerService
  ) {}

  async execute(command: TaskActionCommand): Promise<TaskResponse> {
    const task = await this.taskOwnerService.getOwnedTask( command.taskId, command.userId );

    task.complete();

    return this.taskPersistenceService.save(task)
  }
}
