import { Injectable } from "@nestjs/common";
import { ReopenTaskPort } from "../../ports/inbound/reopen-task.port";
import { TaskActionCommand } from "../../commands/task-action.command";
import { TaskResponse } from "../../common/responses/task.response";
import { TaskOwnerService } from "../../services/task-owner.service";
import { TaskPersistenceService } from "../../services/task-persistence.service";

@Injectable()
export class ReopenTaskUseCase implements ReopenTaskPort {
  constructor(
    private readonly taskPersistenceService: TaskPersistenceService,
    private readonly taskOwnerService: TaskOwnerService
  ) {}

  async execute(command: TaskActionCommand): Promise<TaskResponse> {
    const task = await this.taskOwnerService.getOwnedTask( command.taskId, command.userId );

    task.reopen();

    return this.taskPersistenceService.save(task)
  }
}
