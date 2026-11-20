import { Injectable } from '@nestjs/common';
import { GetDashboardPort } from '../ports/inbound/get-dashboard.port';
import { TaskRepository } from '../../../tasks/domain/repositories/task.repository';
import { DashboardBuilderService } from '../services/dashboard-builder.service';
import { GetDashboardQuery } from '../queries/get-dashboard.query';
import { DashboardResponse } from '../common/responses/dashboard.response';
import { DashboardResponseMapper } from '../common/mapper/dashboard-response.mapper';
import { PomodoroQueryPort } from '../../../pomodoro/application/ports/inbound/pomodoro-query.port';
import { GetCurrentUserPort } from '../../../auth/application/ports/inbound/get-current-user.port';
import { GetSettingsPort } from '../../../settings/application/ports/inbound/get-settings.port';
import { GetSettingsQuery } from '../../../settings/application/queries/get-settings.query';

@Injectable()
export class GetDashboardUseCase implements GetDashboardPort {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly dashboardBuilder: DashboardBuilderService,
    private readonly pomodoro: PomodoroQueryPort,
    private readonly getCurrentUser: GetCurrentUserPort,
    private readonly getSettings: GetSettingsPort,
  ) {}

  async execute(query: GetDashboardQuery): Promise<DashboardResponse> {
    const [tasks, pomodoro, user, settings] = await Promise.all([
      this.taskRepository.findAllByUser(query.userId),
      this.pomodoro.getSummary(query.userId),
      this.getCurrentUser.execute(query.userId),
      this.getSettings.execute(new GetSettingsQuery(query.userId)),
    ]);

    const dashboard = this.dashboardBuilder.build(tasks, pomodoro.today);

    return DashboardResponseMapper.toResponse(dashboard, tasks, user, settings);
  }
}
