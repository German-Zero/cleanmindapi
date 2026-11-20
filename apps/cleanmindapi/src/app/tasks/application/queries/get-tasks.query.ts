import { TaskFilters } from '../../domain/queries/task.query';

export class GetTasksQuery {
  constructor(
    public readonly userId: string,
    public readonly query?: TaskFilters,
  ) {}
}
