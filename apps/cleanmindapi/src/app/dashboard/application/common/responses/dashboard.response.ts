import { TaskResponse } from "../../../../tasks/application/common/responses/task.response";
import { DashboardSummaryResponse } from "./dashbaord-summary.response";
import { QuadrantSummaryResponse } from "./quadrant-summary.response";
import { PomodoroSummary } from "../../../../pomodoro/domain/models/pomodoro.model";

export class DashboardResponse {
  summary!: DashboardSummaryResponse;
  quadrants!: QuadrantSummaryResponse;
  today!: TaskResponse[];
  overdue!: TaskResponse[];
  upcoming!: TaskResponse[];
  pomodoro!: PomodoroSummary['today'];
}
