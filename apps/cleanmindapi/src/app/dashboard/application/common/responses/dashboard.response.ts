import { TaskResponse } from '../../../../tasks/application/common/responses/task.response';
import { DashboardSummaryResponse } from './dashboard-summary.response';
import { QuadrantSummaryResponse } from './quadrant-summary.response';
import { PomodoroSummary } from '../../../../pomodoro/domain/models/pomodoro.model';
import { CurrentUserResponse } from '../../../../auth/application/common/responses/current-user.response';
import { UserSettingsResponse } from '../../../../settings/application/common/responses/user-settings.response';

export class DashboardResponse {
  user!: CurrentUserResponse;
  settings!: UserSettingsResponse;
  tasks!: TaskResponse[];
  summary!: DashboardSummaryResponse;
  quadrants!: QuadrantSummaryResponse;
  today!: TaskResponse[];
  overdue!: TaskResponse[];
  upcoming!: TaskResponse[];
  pomodoro!: PomodoroSummary['today'];
}
