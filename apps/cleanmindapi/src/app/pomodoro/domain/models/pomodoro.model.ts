export enum PomodoroSessionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  INTERRUPTED = 'INTERRUPTED',
  CANCELLED = 'CANCELLED',
}

export enum PomodoroBreakType {
  SHORT = 'SHORT',
  LONG = 'LONG',
}

export interface PomodoroSettings {
  userId: string;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  autoStartBreak: boolean;
  dailyGoalMinutes: number | null;
}

export interface PomodoroSession {
  id: string;
  userId: string;
  taskId: string | null;
  status: PomodoroSessionStatus;
  breakType: PomodoroBreakType;
  plannedFocusSeconds: number;
  plannedBreakSeconds: number;
  actualFocusSeconds: number;
  actualBreakSeconds: number;
  startedAt: Date;
  endedAt: Date | null;
  pausedAt: Date | null;
  accumulatedPausedSeconds: number;
}

export interface PomodoroDailySummary {
  date: string;
  focusSeconds: number;
  breakSeconds: number;
  completedSessions: number;
}

export interface PomodoroSummary {
  today: Omit<PomodoroDailySummary, 'date'>;
  period: {
    days: number;
    focusSeconds: number;
    breakSeconds: number;
    completedSessions: number;
    interruptedSessions: number;
  };
  daily: PomodoroDailySummary[];
}

export interface PomodoroState {
  settings: PomodoroSettings;
  activeSession: PomodoroSession | null;
  summary: PomodoroSummary;
}
