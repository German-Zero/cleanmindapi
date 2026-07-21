import { Injectable } from "@nestjs/common";
import { TaskRepository } from "../../domain/repositories/task.repository";
import { Task } from "../../domain/entities/task.entity";
import { TaskNotFoundException } from "../../domain/exceptions/task-not-found.exception";
import { TaskAccessDeniedException } from "../../domain/exceptions/task-access-denied.exception";

@Injectable()
export class TaskOwnerService {
  constructor(
    private readonly repo: TaskRepository
  ) {}

  async getOwnedTask(taskId: string, userId: string): Promise<Task> {
    const task = await this.repo.findById(taskId)

    if (!task) throw new TaskNotFoundException()

    if (task.userId !== userId) throw new TaskAccessDeniedException()

    return task
  }
}
