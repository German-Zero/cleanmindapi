import { Module } from '@nestjs/common';
import { TaskModule } from '../tasks/tasks.module';
import { PrismaModule } from '../shared/infrastructure/prisma/prisma.module';
import { PomodoroController } from './api/controllers/pomodoro.controller';
import { PomodoroCommandPort } from './application/ports/inbound/pomodoro-command.port';
import { PomodoroQueryPort } from './application/ports/inbound/pomodoro-query.port';
import { PomodoroCommandService } from './application/services/pomodoro-command.service';
import { PomodoroQueryService } from './application/services/pomodoro-query.service';
import { PomodoroRepository } from './domain/repositories/pomodoro.repository';
import { PrismaPomodoroRepository } from './infrastructure/repositories/prisma-pomodoro.repository';

@Module({
  imports: [TaskModule, PrismaModule],
  controllers: [PomodoroController],
  providers: [
    PomodoroQueryService,
    PomodoroCommandService,
    {
      provide: PomodoroQueryPort,
      useExisting: PomodoroQueryService,
    },
    {
      provide: PomodoroCommandPort,
      useExisting: PomodoroCommandService,
    },
    PrismaPomodoroRepository,
    {
      provide: PomodoroRepository,
      useExisting: PrismaPomodoroRepository,
    },
  ],
  exports: [PomodoroQueryPort],
})
export class PomodoroModule {}
