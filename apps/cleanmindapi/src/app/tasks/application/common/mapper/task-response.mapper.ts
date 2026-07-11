import { Task } from '../../../domain/entities/task.entity';

import { TaskResponse } from '../responses/task.response';

export class TaskResponseMapper {
  static toResponse(
    task: Task,
  ): TaskResponse {
    return {
      id: task.id!,

      title: task.title,

      description: task.description,

      isImportant: task.isImportant,

      isUrgent: task.isUrgent,

      quadrant: task.quadrant,

      status: task.status,

      dueDate: task.dueDate,

      completedAt: task.completedAt,

      createdAt: task.createdAt!,

      updatedAt: task.updatedAt!,
    };
  }

  static toResponseList(
    tasks: Task[],
  ): TaskResponse[] {
    return tasks.map(task =>
      this.toResponse(task),
    );
  }
}
