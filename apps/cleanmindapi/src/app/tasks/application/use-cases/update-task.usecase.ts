import { Injectable } from "@nestjs/common";
import { UpdateTaskPort } from "../ports/inbound/update-task.port";
import { UpdateTaskCommand } from "../commands/update-task.command";
import { TaskResponse } from "../common/responses/task.response";
import { TaskOwnerService } from "../services/task-owner.service";
import { TaskPersistenceService } from "../services/task-persistence.service";

@Injectable()
export class UpdateTaskUseCase implements UpdateTaskPort {
  constructor(
    private readonly taskPersistenceService: TaskPersistenceService,
    private readonly taskOwnerService: TaskOwnerService
  ) {}

  async execute(command: UpdateTaskCommand): Promise<TaskResponse> {
    const task = await this.taskOwnerService.getOwnedTask(command.taskId, command.userId);

    task.update({
      title: command.title,
      description: command.description,
      isImportant: command.isImportant,
      isUrgent: command.isUrgent,
      dueDate: command.dueDate,
    });

    return this.taskPersistenceService.save(task)
  }
}
