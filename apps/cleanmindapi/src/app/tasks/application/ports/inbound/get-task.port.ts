import { GetTaskQuery } from '../../queries/get-task.query';
import { TaskResponse } from '../../common/responses/task.response';

export abstract class GetTaskPort {
  abstract execute(query: GetTaskQuery): Promise<TaskResponse>;
}
