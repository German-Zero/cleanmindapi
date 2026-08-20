import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtPayload } from '../../../auth/application/common/jwt-payload';
import { CurrentUser } from '../../../shared/security/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../shared/security/guards/jwt-auth.guard';
import { RewardsService } from '../../application/services/rewards.service';
import {
  RewardSummary,
  StorefrontResponse,
  StorePurchaseResponse,
} from '../../domain/models/reward.model';

@UseGuards(JwtAuthGuard)
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewards: RewardsService) {}

  @Get('summary')
  async getSummary(@CurrentUser() user: JwtPayload): Promise<RewardSummary> {
    return this.rewards.getSummary(user.sub);
  }

  @Get('store')
  async getStore(@CurrentUser() user: JwtPayload): Promise<StorefrontResponse> {
    return this.rewards.getStore(user.sub);
  }

  @Post('store/:itemId/purchase')
  @HttpCode(HttpStatus.OK)
  async purchaseStoreItem(
    @CurrentUser() user: JwtPayload,
    @Param('itemId') itemId: string,
  ): Promise<StorePurchaseResponse> {
    return this.rewards.purchaseStoreItem(user.sub, itemId);
  }

  @Put('store/:itemId/equip')
  async equipStoreItem(
    @CurrentUser() user: JwtPayload,
    @Param('itemId') itemId: string,
  ): Promise<StorefrontResponse> {
    return this.rewards.setStoreItemEquipped(user.sub, itemId, true);
  }

  @Delete('store/:itemId/equip')
  async unequipStoreItem(
    @CurrentUser() user: JwtPayload,
    @Param('itemId') itemId: string,
  ): Promise<StorefrontResponse> {
    return this.rewards.setStoreItemEquipped(user.sub, itemId, false);
  }
}
