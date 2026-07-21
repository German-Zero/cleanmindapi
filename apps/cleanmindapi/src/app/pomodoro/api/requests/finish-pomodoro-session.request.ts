import { IsInt, Max, Min } from 'class-validator';

export class FinishPomodoroSessionRequest {
  @IsInt()
  @Min(0)
  @Max(10800)
  actualFocusSeconds!: number;

  @IsInt()
  @Min(0)
  @Max(7200)
  actualBreakSeconds!: number;
}
