import { TaskResponse } from '../../../../tasks/application/common/responses/task.response';
import { DashboardSummaryResponse } from './dashbaord-summary.response';
import { QuadrantSummaryResponse } from './quadrant-summary.response';
import { PomodoroSummary } from '../../../../pomodoro/domain/models/pomodoro.model';
import { CurrentUserResponse } from '../../../../auth/api/response/current-user.response';
import { UserSettingsResponse } from '../../../../settings/application/common/responses/user-settings.response';
import {
  RewardSummary,
  StorefrontResponse,
} from '../../../../rewards/domain/models/reward.model';

export class DashboardResponse {
  user!: CurrentUserResponse;
  settings!: UserSettingsResponse;
  rewards!: RewardSummary;
  rewardStore!: StorefrontResponse;
  tasks!: TaskResponse[];
  summary!: DashboardSummaryResponse;
  quadrants!: QuadrantSummaryResponse;
  today!: TaskResponse[];
  overdue!: TaskResponse[];
  upcoming!: TaskResponse[];
  pomodoro!: PomodoroSummary['today'];
}
