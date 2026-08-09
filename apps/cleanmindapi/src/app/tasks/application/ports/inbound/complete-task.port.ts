import { RewardedResponse } from '../../../../rewards/domain/models/reward.model';
import { TaskActionCommand } from '../../commands/task-action.command';
import { TaskResponse } from '../../common/responses/task.response';

export abstract class CompleteTaskPort {
  abstract execute(
    command: TaskActionCommand,
  ): Promise<RewardedResponse<TaskResponse>>;
}
