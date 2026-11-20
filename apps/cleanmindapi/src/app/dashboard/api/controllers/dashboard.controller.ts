import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetDashboardPort } from '../../application/ports/inbound/get-dashboard.port';
import { CurrentUser } from '../../../shared/security/decorators/current-user.decorator';
import { JwtPayload } from '../../../auth/application/common/jwt-payload';
import { DashboardResponse } from '../../application/common/responses/dashboard.response';
import { GetDashboardQuery } from '../../application/queries/get-dashboard.query';
import { JwtAuthGuard } from '../../../shared/security/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly getDashboard: GetDashboardPort) {}

  @Get()
  async getDashboardData(
    @CurrentUser() user: JwtPayload,
  ): Promise<DashboardResponse> {
    return this.getDashboard.execute(new GetDashboardQuery(user.sub));
  }
}
