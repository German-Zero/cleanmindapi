import { Injectable } from "@nestjs/common";
import { TaskRepository } from "../../domain/repositories/task.repository";
import { TaskResponse } from "../common/responses/task.response";
import { TaskResponseMapper } from "../common/mapper/task-response.mapper";
import { Task } from "../../domain/entities/task.entity";

@Injectable()
export class TaskPersistenceService {
  constructor(
    private readonly repo: TaskRepository
  ) {}

  async save(task: Task): Promise<TaskResponse> {
    const updated = await this.repo.update(task)

    return TaskResponseMapper.toResponse(updated)
  }
}
