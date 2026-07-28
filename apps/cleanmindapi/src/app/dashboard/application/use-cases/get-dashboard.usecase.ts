import { Injectable } from "@nestjs/common";
import { GetDashboardPort } from "../ports/inbound/get-dashboard.port";
import { TaskRepository } from "../../../tasks/domain/repositories/task.repository";
import { DashboardBuilderService } from "../services/dashboard-builder.service";
import { GetDashboardCommand } from "../commands/get-dashboard.command";
import { DashboardResponse } from "../common/responses/dashboard.response";
import { DashboardResponseMapper } from "../common/mapper/dashboard-response.mapper";
import { PomodoroService } from "../../../pomodoro/application/services/pomodoro.service";
import { GetCurrentUserPort } from "../../../auth/application/ports/inbound/get-current-user.port";
import { GetSettingsPort } from "../../../settings/application/ports/inbound/get-settings.port";
import { GetSettingsCommand } from "../../../settings/application/commands/get-settings.command";

@Injectable()
export class GetDashboardUseCase implements GetDashboardPort {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly dashboardBuilder: DashboardBuilderService,
    private readonly pomodoroService: PomodoroService,
    private readonly getCurrentUser: GetCurrentUserPort,
    private readonly getSettings: GetSettingsPort,
  ) {}

  async execute(command: GetDashboardCommand): Promise<DashboardResponse> {
    const [tasks, pomodoro, user, settings] = await Promise.all([
      this.taskRepository.findAllByUser(command.userId),
      this.pomodoroService.getSummary(command.userId),
      this.getCurrentUser.execute(command.userId),
      this.getSettings.execute(new GetSettingsCommand(command.userId)),
    ])

    const dashboard = this.dashboardBuilder.build(tasks, pomodoro.today)

    return DashboardResponseMapper.toResponse(
      dashboard,
      tasks,
      user,
      settings,
    )
  }
}
