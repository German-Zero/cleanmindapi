import { Module } from '@nestjs/common';
import { RewardsController } from './api/controllers/rewards.controller';
import { RewardsService } from './application/services/rewards.service';
import { PointsRepository } from './domain/repositories/points.repository';
import { PrismaPointsRepository } from './infrastructure/repositories/prisma-points.repository';

@Module({
  controllers: [RewardsController],
  providers: [
    RewardsService,
    PrismaPointsRepository,
    {
      provide: PointsRepository,
      useExisting: PrismaPointsRepository,
    },
  ],
  exports: [RewardsService],
})
export class RewardsModule {}
