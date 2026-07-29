import { Module } from '@nestjs/common';
import { PrismaModule } from '../shared/infrastructure/prisma/prisma.module';
import { WhiteboardController } from './api/controllers/whiteboard.controller';
import { WhiteboardService } from './application/services/whiteboard.service';
import { WhiteboardRepository } from './domain/repositories/whiteboard.repository';
import { PrismaWhiteboardRepository } from './infrastructure/repositories/prisma-whiteboard.repository';

@Module({
  imports: [PrismaModule],
  controllers: [WhiteboardController],
  providers: [
    WhiteboardService,
    PrismaWhiteboardRepository,
    {
      provide: WhiteboardRepository,
      useExisting: PrismaWhiteboardRepository,
    },
  ],
})
export class WhiteboardModule {}
