import { Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../shared/application/errors/application-error';
import { PomodoroDailySummary, PomodoroSession, PomodoroSessionStatus, PomodoroSettings, PomodoroState, PomodoroSummary } from '../../domain/models/pomodoro.model';
import { PomodoroRepository } from '../../domain/repositories/pomodoro.repository';
import { PomodoroQueryPort } from '../ports/inbound/pomodoro-query.port';

@Injectable()
export class PomodoroQueryService implements PomodoroQueryPort {
  private static readonly DEFAULT_SETTINGS: Omit<PomodoroSettings, 'userId'> = {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreak: false,
    dailyGoalMinutes: null,
  };

  constructor(private readonly repository: PomodoroRepository) {}

  async getSettings(userId: string): Promise<PomodoroSettings> {
    const current = await this.repository.findSettingsByUserId(userId);

    return (
      current ?? {
        userId,
        ...PomodoroQueryService.DEFAULT_SETTINGS,
      }
    );
  }

  getActiveSession(userId: string): Promise<PomodoroSession | null> {
    return this.repository.findActiveByUserId(userId);
  }

  async getState(userId: string, days = 7): Promise<PomodoroState> {
    const [settings, activeSession, summary] = await Promise.all([
      this.getSettings(userId),
      this.getActiveSession(userId),
      this.getSummary(userId, days),
    ]);

    return { settings, activeSession, summary };
  }

  async getSummary(
    userId: string,
    days = 7,
    now = new Date(),
  ): Promise<PomodoroSummary> {
    if (!Number.isInteger(days) || days < 1 || days > 31) {
      throw new ApplicationError(
        'POMODORO_INVALID_PERIOD',
        'El período debe estar entre 1 y 31 días',
      );
    }

    const timezone = await this.repository.findUserTimezone(userId);
    const from = new Date(now.getTime() - (days + 1) * 24 * 60 * 60 * 1000);
    const sessions = await this.repository.findEndedBetween(userId, from, now);
    return this.buildSummary(sessions, now, days, timezone);
  }

  private buildSummary(
    sessions: PomodoroSession[],
    now: Date,
    days: number,
    timezone: string,
  ): PomodoroSummary {
    const daily = this.createDailyBuckets(now, days, timezone);
    this.addSessionsToDailyBuckets(sessions, daily, timezone);
    const firstDay = daily[0].date;
    const lastDay = daily[daily.length - 1].date;
    const periodSessions = sessions.filter((session) => {
      if (!session.endedAt) return false;

      const date = this.dateKey(session.endedAt, timezone);
      return date >= firstDay && date <= lastDay;
    });

    const today = daily[daily.length - 1];

    return {
      today: {
        focusSeconds: today.focusSeconds,
        breakSeconds: today.breakSeconds,
        completedSessions: today.completedSessions,
      },
      period: this.summarizePeriod(periodSessions, days),
      daily,
    };
  }

  private addSessionsToDailyBuckets(
    sessions: PomodoroSession[],
    daily: PomodoroDailySummary[],
    timezone: string,
  ): void {
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
  }

  private summarizePeriod(
    sessions: PomodoroSession[],
    days: number,
  ): PomodoroSummary['period'] {
    return {
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
    };
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
