import {
  IsBoolean,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class UpdatePomodoroSettingsRequest {
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(90)
  focusMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  shortBreakMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(60)
  longBreakMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(8)
  sessionsBeforeLongBreak?: number;

  @IsOptional()
  @IsBoolean()
  autoStartBreak?: boolean;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(600)
  dailyGoalMinutes?: number | null;
}
