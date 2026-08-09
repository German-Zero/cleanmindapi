import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PomodoroSession,
  PomodoroSessionStatus,
} from '../../../pomodoro/domain/models/pomodoro.model';
import { PointTransactionType } from '../../domain/enums/point-transaction-type.enum';
import {
  RewardGrant,
  RewardSummary,
  STORE_CATALOG,
  StorefrontResponse,
  StoreItem,
  StoreItemDefinition,
  StorePurchaseResponse,
} from '../../domain/models/reward.model';
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

  async getStore(
    userId: string,
    now = new Date(),
  ): Promise<StorefrontResponse> {
    const periodKey = await this.currentPeriodKey(userId, now);
    const [totals, ownedItemIds, equippedItemIds] = await Promise.all([
      this.points.getSummary(userId, periodKey),
      this.points.getOwnedStoreItemIds(userId),
      this.points.getEquippedStoreItemIds(userId),
    ]);
    const summary = this.toSummary(totals);
    const owned = new Set(ownedItemIds);
    const equipped = new Set(equippedItemIds);

    return {
      summary,
      items: STORE_CATALOG.map((item) =>
        this.toStoreItem(
          item,
          owned.has(item.id),
          summary.balance,
          equipped.has(item.id),
        ),
      ),
    };
  }

  async purchaseStoreItem(
    userId: string,
    itemId: string,
    now = new Date(),
  ): Promise<StorePurchaseResponse> {
    const definition = STORE_CATALOG.find((item) => item.id === itemId);
    if (!definition) {
      throw new NotFoundException('La recompensa seleccionada no existe.');
    }

    const periodKey = await this.currentPeriodKey(userId, now);
    const result = await this.points.redeemStoreItem({
      userId,
      itemId: definition.id,
      cost: definition.cost,
      periodKey,
    });

    if (result.status === 'INSUFFICIENT_POINTS') {
      throw new ConflictException(
        `Necesitas ${definition.cost} puntos para canjear esta recompensa. Tu saldo actual es ${result.balance}.`,
      );
    }

    const summary = this.toSummary(result);
    const equippedItemIds = await this.points.getEquippedStoreItemIds(userId);
    return {
      summary,
      purchased: result.status === 'PURCHASED',
      item: this.toStoreItem(
        definition,
        true,
        summary.balance,
        equippedItemIds.includes(definition.id),
      ),
    };
  }

  async setStoreItemEquipped(
    userId: string,
    itemId: string,
    equipped: boolean,
  ): Promise<StorefrontResponse> {
    const definition = STORE_CATALOG.find((item) => item.id === itemId);
    if (!definition) {
      throw new NotFoundException('La recompensa seleccionada no existe.');
    }

    const result = await this.points.setStoreItemEquipped({
      userId,
      itemId: definition.id,
      categoryItemIds: STORE_CATALOG.filter(
        (item) => item.category === definition.category,
      ).map((item) => item.id),
      equipped,
    });

    if (result.status === 'NOT_OWNED') {
      throw new ForbiddenException(
        'Debes canjear esta recompensa antes de poder aplicarla.',
      );
    }

    return this.getStore(userId);
  }

  private toStoreItem(
    definition: StoreItemDefinition,
    owned: boolean,
    balance: number,
    equipped: boolean,
  ): StoreItem {
    return {
      ...definition,
      colors: [...definition.colors],
      owned,
      canAfford: owned || balance >= definition.cost,
      equipped,
    };
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
