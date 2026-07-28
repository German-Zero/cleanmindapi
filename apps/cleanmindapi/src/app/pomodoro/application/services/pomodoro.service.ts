import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TaskRepository } from '../../../tasks/domain/repositories/task.repository';
import {
  PomodoroBreakType,
  PomodoroDailySummary,
  PomodoroSession,
  PomodoroSessionStatus,
  PomodoroSettings,
  PomodoroSummary,
} from '../../domain/models/pomodoro.model';
import {
  PomodoroRepository,
  PomodoroSettingsUpdate,
} from '../../domain/repositories/pomodoro.repository';

export interface UpdatePomodoroSettingsInput {
  focusMinutes?: number;
  shortBreakMinutes?: number;
  longBreakMinutes?: number;
  sessionsBeforeLongBreak?: number;
  autoStartBreak?: boolean;
  dailyGoalMinutes?: number | null;
}

@Injectable()
export class PomodoroService {
  private static readonly DEFAULT_SETTINGS: PomodoroSettingsUpdate = {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreak: false,
    dailyGoalMinutes: null,
  };

  constructor(
    private readonly repository: PomodoroRepository,
    private readonly taskRepository: TaskRepository,
  ) {}

  async getSettings(userId: string): Promise<PomodoroSettings> {
    const current = await this.repository.findSettingsByUserId(userId);

    return (
      current ??
      this.repository.upsertSettings(userId, PomodoroService.DEFAULT_SETTINGS)
    );
  }

  async updateSettings(
    userId: string,
    input: UpdatePomodoroSettingsInput,
  ): Promise<PomodoroSettings> {
    const current = await this.getSettings(userId);

    return this.repository.upsertSettings(userId, {
      focusMinutes: input.focusMinutes ?? current.focusMinutes,
      shortBreakMinutes: input.shortBreakMinutes ?? current.shortBreakMinutes,
      longBreakMinutes: input.longBreakMinutes ?? current.longBreakMinutes,
      sessionsBeforeLongBreak:
        input.sessionsBeforeLongBreak ?? current.sessionsBeforeLongBreak,
      autoStartBreak: input.autoStartBreak ?? current.autoStartBreak,
      dailyGoalMinutes:
        input.dailyGoalMinutes === undefined
          ? current.dailyGoalMinutes
          : input.dailyGoalMinutes,
    });
  }

  async startSession(
    userId: string,
    taskId: string | null,
    breakType: PomodoroBreakType,
  ): Promise<PomodoroSession> {
    if (await this.repository.findActiveByUserId(userId)) {
      throw new ConflictException('Ya existe una sesión Pomodoro activa');
    }

    if (taskId) {
      const task = await this.taskRepository.findById(taskId);

      if (!task || task.userId !== userId) {
        throw new NotFoundException('Tarea no encontrada');
      }
    }

    const settings = await this.getSettings(userId);
    const breakMinutes =
      breakType === PomodoroBreakType.LONG
        ? settings.longBreakMinutes
        : settings.shortBreakMinutes;

    return this.repository.createSession({
      userId,
      taskId,
      breakType,
      plannedFocusSeconds: settings.focusMinutes * 60,
      plannedBreakSeconds: breakMinutes * 60,
    });
  }

  async getActiveSession(userId: string): Promise<PomodoroSession | null> {
    return this.repository.findActiveByUserId(userId);
  }

  async pauseSession(
    userId: string,
    sessionId: string,
    now = new Date(),
  ): Promise<PomodoroSession> {
    const session = await this.getOwnedActiveSession(userId, sessionId);

    if (session.pausedAt) {
      throw new ConflictException('La sesión Pomodoro ya está pausada');
    }

    return (await this.repository.updateActiveSessionPause(sessionId, userId, {
      pausedAt: now,
      accumulatedPausedSeconds: session.accumulatedPausedSeconds,
    }))!;
  }

  async resumeSession(
    userId: string,
    sessionId: string,
    now = new Date(),
  ): Promise<PomodoroSession> {
    const session = await this.getOwnedActiveSession(userId, sessionId);

    if (!session.pausedAt) {
      throw new ConflictException('La sesión Pomodoro no está pausada');
    }

    const pausedSeconds = Math.max(
      0,
      Math.floor((now.getTime() - session.pausedAt.getTime()) / 1000),
    );

    return (await this.repository.updateActiveSessionPause(sessionId, userId, {
      pausedAt: null,
      accumulatedPausedSeconds:
        session.accumulatedPausedSeconds + pausedSeconds,
    }))!;
  }

  async completeSession(
    userId: string,
    sessionId: string,
    actualFocusSeconds: number,
    actualBreakSeconds: number,
  ): Promise<PomodoroSession> {
    return this.finishSession(
      userId,
      sessionId,
      PomodoroSessionStatus.COMPLETED,
      actualFocusSeconds,
      actualBreakSeconds,
    );
  }

  async interruptSession(
    userId: string,
    sessionId: string,
    actualFocusSeconds: number,
    actualBreakSeconds: number,
  ): Promise<PomodoroSession> {
    return this.finishSession(
      userId,
      sessionId,
      PomodoroSessionStatus.INTERRUPTED,
      actualFocusSeconds,
      actualBreakSeconds,
    );
  }

  async cancelSession(
    userId: string,
    sessionId: string,
  ): Promise<PomodoroSession> {
    return this.finishSession(
      userId,
      sessionId,
      PomodoroSessionStatus.CANCELLED,
      0,
      0,
    );
  }

  async getSummary(
    userId: string,
    days = 7,
    now = new Date(),
  ): Promise<PomodoroSummary> {
    if (!Number.isInteger(days) || days < 1 || days > 31) {
      throw new BadRequestException('El período debe estar entre 1 y 31 días');
    }

    const timezone = await this.repository.findUserTimezone(userId);
    const from = new Date(now.getTime() - (days + 1) * 24 * 60 * 60 * 1000);
    const sessions = await this.repository.findEndedBetween(userId, from, now);
    const daily = this.createDailyBuckets(now, days, timezone);
    const byDate = new Map(daily.map((item) => [item.date, item]));

    for (const session of sessions) {
      if (!session.endedAt) continue;

      const bucket = byDate.get(this.dateKey(session.endedAt, timezone));
      if (!bucket) continue;

      bucket.focusSeconds += session.actualFocusSeconds;
      bucket.breakSeconds += session.actualBreakSeconds;
      if (session.status === PomodoroSessionStatus.COMPLETED) {
        bucket.completedSessions += 1;
      }
    }

    const today = daily[daily.length - 1];

    return {
      today: {
        focusSeconds: today.focusSeconds,
        breakSeconds: today.breakSeconds,
        completedSessions: today.completedSessions,
      },
      period: {
        days,
        focusSeconds: sessions.reduce(
          (sum, item) => sum + item.actualFocusSeconds,
          0,
        ),
        breakSeconds: sessions.reduce(
          (sum, item) => sum + item.actualBreakSeconds,
          0,
        ),
        completedSessions: sessions.filter(
          (item) => item.status === PomodoroSessionStatus.COMPLETED,
        ).length,
        interruptedSessions: sessions.filter(
          (item) => item.status === PomodoroSessionStatus.INTERRUPTED,
        ).length,
      },
      daily,
    };
  }

  private async getOwnedActiveSession(
    userId: string,
    sessionId: string,
  ): Promise<PomodoroSession> {
    const session = await this.repository.findSessionByIdAndUserId(
      sessionId,
      userId,
    );

    if (!session || session.status !== PomodoroSessionStatus.ACTIVE) {
      throw new NotFoundException('Sesión Pomodoro activa no encontrada');
    }

    return session;
  }

  private async finishSession(
    userId: string,
    sessionId: string,
    status: Exclude<PomodoroSessionStatus, PomodoroSessionStatus.ACTIVE>,
    actualFocusSeconds: number,
    actualBreakSeconds: number,
  ): Promise<PomodoroSession> {
    const session = await this.repository.finishActiveSession(
      sessionId,
      userId,
      {
        status,
        actualFocusSeconds,
        actualBreakSeconds,
        endedAt: new Date(),
      },
    );

    if (!session) {
      throw new NotFoundException('Sesión Pomodoro activa no encontrada');
    }

    return session;
  }

  private createDailyBuckets(
    now: Date,
    days: number,
    timezone: string,
  ): PomodoroDailySummary[] {
    const [year, month, day] = this.dateKey(now, timezone)
      .split('-')
      .map(Number);

    return Array.from({ length: days }, (_, index) => {
      const date = new Date(
        Date.UTC(year, month - 1, day - (days - 1 - index)),
      );

      return {
        date: date.toISOString().slice(0, 10),
        focusSeconds: 0,
        breakSeconds: 0,
        completedSessions: 0,
      };
    });
  }

  private dateKey(date: Date, timezone: string): string {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const value = (type: Intl.DateTimeFormatPartTypes): string =>
      parts.find((part) => part.type === type)?.value ?? '';

    return `${value('year')}-${value('month')}-${value('day')}`;
  }
}
