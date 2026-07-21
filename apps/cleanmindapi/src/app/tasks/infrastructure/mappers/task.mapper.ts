import {Prisma, Task as PrismaTask, } from '@prisma/client';

import { Task } from '../../domain/entities/task.entity';
import { TaskQuadrant } from '../../domain/enums/task-quadrant.enum';
import { TaskStatus } from '../../domain/enums/task-status.enum';

export class TaskMapper {
  static toDomain(task: PrismaTask): Task {
    return Task.restore({
      id: task.id,
      userId: task.userId,
      title: task.title,
      description: task.description,
      isImportant: task.isImportant,
      isUrgent: task.isUrgent,
      quadrant: task.quadrant as TaskQuadrant,
      status: task.status as TaskStatus,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    });
  }

  static toCreatePersistence(
    task: Task,
  ): Prisma.TaskUncheckedCreateInput {
    return {
      userId: task.userId,
      title: task.title,
      description: task.description,
      isImportant: task.isImportant,
      isUrgent: task.isUrgent,
      quadrant: task.quadrant,
      status: task.status,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
    };
  }

  static toUpdatePersistence(
    task: Task,
  ): Prisma.TaskUncheckedUpdateInput {
    return {
      title: task.title,
      description: task.description,
      isImportant: task.isImportant,
      isUrgent: task.isUrgent,
      quadrant: task.quadrant,
      status: task.status,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
    };
  }
}
