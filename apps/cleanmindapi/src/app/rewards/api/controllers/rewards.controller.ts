import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtPayload } from '../../../auth/application/common/jwt-payload';
import { CurrentUser } from '../../../shared/security/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../shared/security/guards/jwt-auth.guard';
import { RewardsService } from '../../application/services/rewards.service';
import { RewardSummary } from '../../domain/models/reward.model';

@UseGuards(JwtAuthGuard)
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewards: RewardsService) {}

  @Get('summary')
  async getSummary(@CurrentUser() user: JwtPayload): Promise<RewardSummary> {
    return this.rewards.getSummary(user.sub);
  }
}
