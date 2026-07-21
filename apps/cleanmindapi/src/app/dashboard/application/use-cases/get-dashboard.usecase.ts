import { Injectable } from "@nestjs/common";
import { GetDashboardPort } from "../ports/inbound/get-dashboard.port";
import { TaskRepository } from "../../../tasks/domain/repositories/task.repository";
import { DashboardBuilderService } from "../services/dashboard-builder.service";
import { GetDashboardCommand } from "../commands/get-dashboard.command";
import { DashboardResponse } from "../common/responses/dashboard.response";
import { DashboardResponseMapper } from "../common/mapper/dashboard-response.mapper";

@Injectable()
export class GetDashboardUseCase implements GetDashboardPort {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly dashboardBuilder: DashboardBuilderService,
  ) {}

  async execute(command: GetDashboardCommand): Promise<DashboardResponse> {
    const tasks = await this.taskRepository.findAllByUser(command.userId)

    const dashboard = this.dashboardBuilder.build(tasks)

    return DashboardResponseMapper.toResponse(dashboard)
  }
}
