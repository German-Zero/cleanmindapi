import { Injectable } from '@nestjs/common';
import {
  PomodoroSession,
  PomodoroSessionStatus,
} from '../../../pomodoro/domain/models/pomodoro.model';
import { PointTransactionType } from '../../domain/enums/point-transaction-type.enum';
import { RewardGrant, RewardSummary } from '../../domain/models/reward.model';
import { PointsRepository } from '../../domain/repositories/points.repository';

@Injectable()
export class RewardsService {
  static readonly MONTHLY_LIMIT = 100;
  static readonly TASK_COMPLETION_POINTS = 5;
  static readonly POMODORO_COMPLETION_POINTS = 2;
  static readonly MINIMUM_REWARDED_FOCUS_SECONDS = 15 * 60;

  constructor(private readonly points: PointsRepository) {}

  async awardTaskCompletion(
    userId: string,
    taskId: string,
    now = new Date(),
  ): Promise<RewardGrant> {
    const periodKey = await this.currentPeriodKey(userId, now);
    const result = await this.points.award({
      userId,
      type: PointTransactionType.TASK_COMPLETED,
      sourceId: taskId,
      amount: RewardsService.TASK_COMPLETION_POINTS,
      periodKey,
      monthlyLimit: RewardsService.MONTHLY_LIMIT,
    });

    return this.toGrant(result);
  }

  async awardPomodoroCompletion(
    userId: string,
    session: PomodoroSession,
    now = new Date(),
  ): Promise<RewardGrant> {
    const periodKey = await this.currentPeriodKey(userId, now);

    if (!this.isRewardedPomodoro(session)) {
      const summary = await this.points.getSummary(userId, periodKey);
      return {
        pointsAwarded: 0,
        ...this.toSummary(summary),
      };
    }

    const result = await this.points.award({
      userId,
      type: PointTransactionType.POMODORO_COMPLETED,
      sourceId: session.id,
      amount: RewardsService.POMODORO_COMPLETION_POINTS,
      periodKey,
      monthlyLimit: RewardsService.MONTHLY_LIMIT,
    });

    return this.toGrant(result);
  }

  async getSummary(userId: string, now = new Date()): Promise<RewardSummary> {
    const periodKey = await this.currentPeriodKey(userId, now);
    const totals = await this.points.getSummary(userId, periodKey);
    return this.toSummary(totals);
  }

  private isRewardedPomodoro(session: PomodoroSession): boolean {
    if (
      session.status !== PomodoroSessionStatus.COMPLETED ||
      !session.endedAt
    ) {
      return false;
    }

    const effectiveElapsedSeconds = Math.max(
      0,
      Math.floor(
        (session.endedAt.getTime() - session.startedAt.getTime()) / 1000,
      ) - session.accumulatedPausedSeconds,
    );
    const minimum = RewardsService.MINIMUM_REWARDED_FOCUS_SECONDS;

    return (
      session.plannedFocusSeconds >= minimum &&
      session.actualFocusSeconds >= minimum &&
      effectiveElapsedSeconds >= minimum
    );
  }

  private async currentPeriodKey(userId: string, date: Date): Promise<string> {
    const timezone = await this.points.findUserTimezone(userId);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
    });
    const parts = formatter.formatToParts(date);
    const year = parts.find((part) => part.type === 'year')?.value;
    const month = parts.find((part) => part.type === 'month')?.value;

    return `${year}-${month}`;
  }

  private toGrant(totals: {
    pointsAwarded: number;
    balance: number;
    earnedThisMonth: number;
  }): RewardGrant {
    return {
      pointsAwarded: totals.pointsAwarded,
      ...this.toSummary(totals),
    };
  }

  private toSummary(totals: {
    balance: number;
    earnedThisMonth: number;
  }): RewardSummary {
    return {
      ...totals,
      monthlyLimit: RewardsService.MONTHLY_LIMIT,
      remainingThisMonth: Math.max(
        0,
        RewardsService.MONTHLY_LIMIT - totals.earnedThisMonth,
      ),
    };
  }
}
