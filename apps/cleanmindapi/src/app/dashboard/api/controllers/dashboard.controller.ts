import { Controller, Get, UseGuards } from "@nestjs/common";
import { GetDashboardUseCase } from "../../application/use-cases/get-dashboard.usecase";
import { CurrentUser } from "../../../shared/security/decorators/current-user.decorator";
import { JwtPayload } from "../../../auth/application/common/jwt-payload";
import { DashboardResponse } from "../../application/common/responses/dashboard.response";
import { GetDashboardCommand } from "../../application/commands/get-dashboard.command";
import { JwtAuthGuard } from "../../../shared/security/guards/jwt-auth.guard";


@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly getDashboard: GetDashboardUseCase,
  ) {}

  @Get()
  async getDashboardData(@CurrentUser() user: JwtPayload): Promise<DashboardResponse> {
    return this.getDashboard.execute(new GetDashboardCommand(user.sub))
  }
}
