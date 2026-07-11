import { Task } from "../entities/task.entity";
import { TaskFilters } from "../queries/task.query";

export abstract class TaskRepository {
  abstract create(task: Task): Promise<Task>
  abstract update(task: Task): Promise<Task>
  abstract delete(id: string): Promise<void>
  abstract findById(id: string): Promise<Task | null>
  abstract findAllByUser(userId: string, query?: TaskFilters): Promise<Task[]>
  abstract existsById(id: string): Promise<boolean>
}
