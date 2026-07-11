import { Injectable } from "@nestjs/common";
import { DeleteTaskPort } from "../ports/inbound/delete.task.port";
import { TaskRepository } from "../../domain/repositories/task.repository";
import { DeleteTaskCommand } from "../commands/delete-task.command";
import { TaskOwnerService } from "../services/task-owner.service";

@Injectable()
export class DeleteTaskUseCase implements DeleteTaskPort {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly taskOwnerService: TaskOwnerService
  ) {}

  async execute(command: DeleteTaskCommand): Promise<void> {
    await this.taskOwnerService.getOwnedTask(command.taskId, command.userId)

    await this.taskRepository.delete(command.taskId)
  }
}
