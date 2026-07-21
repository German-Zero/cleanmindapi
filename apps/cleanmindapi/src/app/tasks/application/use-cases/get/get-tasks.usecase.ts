import { Injectable } from "@nestjs/common";
import { TaskRepository } from "../../../domain/repositories/task.repository";
import { GetTasksPort } from "../../ports/inbound/get-tasks.port";
import { GetTasksCommand } from "../../commands/get-tasks.command";
import { TaskResponse } from "../../common/responses/task.response";
import { TaskResponseMapper } from "../../common/mapper/task-response.mapper";

@Injectable()
export class GetTasksUseCase implements GetTasksPort {
  constructor(
    private readonly taskRepository: TaskRepository
  ) {}

  async execute(command: GetTasksCommand): Promise<TaskResponse[]> {
    const tasks = await this.taskRepository.findAllByUser(command.userId, command.query)

    return TaskResponseMapper.toResponseList(tasks)
  }
}
