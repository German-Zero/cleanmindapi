import { TaskQuadrant } from "../enums/task-quadrant.enum";
import { TaskStatus } from "../enums/task-status.enum";

export interface TaskFilters {
  quadrant?: TaskQuadrant;
  status?: TaskStatus;
  search?: string;
  dueDate?: Date
}
