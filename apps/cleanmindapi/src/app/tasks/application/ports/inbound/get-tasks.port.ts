import { GetTasksQuery } from '../../queries/get-tasks.query';
import { TaskResponse } from '../../common/responses/task.response';

export abstract class GetTasksPort {
  abstract execute(query: GetTasksQuery): Promise<TaskResponse[]>;
}
