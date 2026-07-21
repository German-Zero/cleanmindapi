import { Module } from '@nestjs/common';
import { TaskModule } from '../tasks/tasks.module';
import { PomodoroController } from './api/controllers/pomodoro.controller';
import { PomodoroService } from './application/services/pomodoro.service';
import { PomodoroRepository } from './domain/repositories/pomodoro.repository';
import { PrismaPomodoroRepository } from './infrastructure/repositories/prisma-pomodoro.repository';

@Module({
  imports: [TaskModule],
  controllers: [PomodoroController],
  providers: [
    PomodoroService,
    PrismaPomodoroRepository,
    {
      provide: PomodoroRepository,
      useExisting: PrismaPomodoroRepository,
    },
  ],
  exports: [PomodoroService],
})
export class PomodoroModule {}
