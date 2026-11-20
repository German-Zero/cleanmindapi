import { PomodoroSession, PomodoroSettings, PomodoroState, PomodoroSummary } from '../../../domain/models/pomodoro.model';

export abstract class PomodoroQueryPort {
  abstract getSettings(userId: string): Promise<PomodoroSettings>;
  abstract getActiveSession(userId: string): Promise<PomodoroSession | null>;
  abstract getState(userId: string, days?: number): Promise<PomodoroState>;
  abstract getSummary(
    userId: string,
    days?: number,
    now?: Date,
  ): Promise<PomodoroSummary>;
}
