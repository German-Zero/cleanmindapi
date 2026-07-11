import { Injectable } from "@nestjs/common";
import { CreateTaskPort } from "../ports/inbound/create-task.port";
import { UserRepository } from "../../../users/domain/repositories/user.repository";
import { TaskRepository } from "../../domain/repositories/task.repository";
import { CreateTaskCommand } from "../commands/create-task.command";
import { TaskResponse } from "../common/responses/task.response";
import { UserNotFoundException } from "../../../users/domain/exceptions/user-not-found.exception";
import { Task } from "../../domain/entities/task.entity";
import { TaskResponseMapper } from "../common/mapper/task-response.mapper";

@Injectable()
export class CreateTaskUseCase implements CreateTaskPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(command: CreateTaskCommand): Promise<TaskResponse> {
    const user = await this.userRepository.findById(command.userId)

    if (!user) throw new UserNotFoundException()

    const task = Task.create({
      userId: command.userId,
      title: command.title,
      description: command.description,
      isImportant: command.isImportant,
      isUrgent: command.isUrgent,
      dueDate: command.dueDate,
    })

    const created = await this.taskRepository.create(task)

    return TaskResponseMapper.toResponse(created)
  }
}
