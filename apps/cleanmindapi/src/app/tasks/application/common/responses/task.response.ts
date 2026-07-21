import { TaskQuadrant } from '../../../domain/enums/task-quadrant.enum';
import { TaskStatus } from '../../../domain/enums/task-status.enum';

export class TaskResponse {
  id!: string;

  title!: string;

  description!: string | null;

  isImportant!: boolean;

  isUrgent!: boolean;

  quadrant!: TaskQuadrant;

  status!: TaskStatus;

  dueDate!: Date | null;

  completedAt!: Date | null;

  createdAt!: Date;

  updatedAt!: Date;
}
