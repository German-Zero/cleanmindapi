import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PomodoroBreakType } from '../../domain/models/pomodoro.model';

export class StartPomodoroSessionRequest {
  @IsOptional()
  @IsUUID()
  taskId?: string | null;

  @IsOptional()
  @IsEnum(PomodoroBreakType)
  breakType?: PomodoroBreakType;
}
