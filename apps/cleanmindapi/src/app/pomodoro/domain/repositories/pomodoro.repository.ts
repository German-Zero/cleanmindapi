import {
  PomodoroBreakType,
  PomodoroSession,
  PomodoroSessionStatus,
  PomodoroSettings,
} from '../models/pomodoro.model';

export type PomodoroSettingsUpdate = Omit<PomodoroSettings, 'userId'>;

export interface CreatePomodoroSessionData {
  userId: string;
  taskId: string | null;
  breakType: PomodoroBreakType;
  plannedFocusSeconds: number;
  plannedBreakSeconds: number;
}

export interface FinishPomodoroSessionData {
  status: Exclude<PomodoroSessionStatus, PomodoroSessionStatus.ACTIVE>;
  actualFocusSeconds: number;
  actualBreakSeconds: number;
  endedAt: Date;
}

export abstract class PomodoroRepository {
  abstract findUserTimezone(userId: string): Promise<string>;
  abstract findSettingsByUserId(userId: string): Promise<PomodoroSettings | null>;
  abstract upsertSettings(userId: string, settings: PomodoroSettingsUpdate): Promise<PomodoroSettings>;
  abstract findActiveByUserId(userId: string): Promise<PomodoroSession | null>;
  abstract findSessionByIdAndUserId(id: string, userId: string): Promise<PomodoroSession | null>;
  abstract createSession(data: CreatePomodoroSessionData): Promise<PomodoroSession>;
  abstract finishActiveSession(
    id: string,
    userId: string,
    data: FinishPomodoroSessionData,
  ): Promise<PomodoroSession | null>;
  abstract findEndedBetween(userId: string, from: Date, to: Date): Promise<PomodoroSession[]>;
}
