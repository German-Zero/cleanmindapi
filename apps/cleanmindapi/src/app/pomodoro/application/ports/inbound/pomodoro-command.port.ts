import { PomodoroBreakType, PomodoroSession, PomodoroSettings } from '../../../domain/models/pomodoro.model';

export interface UpdatePomodoroSettingsInput {
  focusMinutes?: number;
  shortBreakMinutes?: number;
  longBreakMinutes?: number;
  sessionsBeforeLongBreak?: number;
  autoStartBreak?: boolean;
  dailyGoalMinutes?: number | null;
}

export abstract class PomodoroCommandPort {
  abstract updateSettings(
    userId: string,
    input: UpdatePomodoroSettingsInput,
  ): Promise<PomodoroSettings>;
  abstract startSession(
    userId: string,
    taskId: string | null,
    breakType: PomodoroBreakType,
  ): Promise<PomodoroSession>;
  abstract pauseSession(
    userId: string,
    sessionId: string,
  ): Promise<PomodoroSession>;
  abstract resumeSession(
    userId: string,
    sessionId: string,
  ): Promise<PomodoroSession>;
  abstract completeSession(
    userId: string,
    sessionId: string,
    actualFocusSeconds: number,
    actualBreakSeconds: number,
  ): Promise<PomodoroSession>;
  abstract interruptSession(
    userId: string,
    sessionId: string,
    actualFocusSeconds: number,
    actualBreakSeconds: number,
  ): Promise<PomodoroSession>;
  abstract cancelSession(
    userId: string,
    sessionId: string,
  ): Promise<PomodoroSession>;
}
