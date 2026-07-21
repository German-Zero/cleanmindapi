import { TaskFilters } from "../../domain/queries/task.query";

export class GetTasksCommand {
  constructor(
    public readonly userId: string,
    public readonly query?: TaskFilters,
  ) {}
}
