import { Injectable } from '@nestjs/common';
import {
  PointTransactionType as PrismaPointTransactionType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { PointsTotals } from '../../domain/models/reward.model';
import {
  AwardPointsInput,
  AwardPointsResult,
  PointsRepository,
  RedeemStoreItemInput,
  RedeemStoreItemResult,
  SetStoreItemEquippedInput,
  SetStoreItemEquippedResult,
} from '../../domain/repositories/points.repository';

type PointsClient = Pick<Prisma.TransactionClient, 'pointTransaction'>;

@Injectable()
export class PrismaPointsRepository implements PointsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserTimezone(userId: string): Promise<string> {
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
      select: { timezone: true },
    });

    return settings?.timezone ?? 'America/Argentina/Cordoba';
  }

  async award(input: AwardPointsInput): Promise<AwardPointsResult> {
    return this.prisma.$transaction(async (tx) => {
      await this.lockUserPoints(tx, input.userId);

      const existing = await tx.pointTransaction.findUnique({
        where: {
          userId_type_sourceId: {
            userId: input.userId,
            type: input.type as PrismaPointTransactionType,
            sourceId: input.sourceId,
          },
        },
        select: { id: true },
      });
      const totals = await this.calculateTotals(
        tx,
        input.userId,
        input.periodKey,
      );

      if (existing) {
        return {
          pointsAwarded: 0,
          ...totals,
        };
      }

      const pointsAwarded = Math.min(
        input.amount,
        Math.max(0, input.monthlyLimit - totals.earnedThisMonth),
      );

      await tx.pointTransaction.create({
        data: {
          userId: input.userId,
          type: input.type as PrismaPointTransactionType,
          sourceId: input.sourceId,
          amount: pointsAwarded,
          periodKey: input.periodKey,
        },
      });

      return {
        pointsAwarded,
        balance: totals.balance + pointsAwarded,
        earnedThisMonth: totals.earnedThisMonth + pointsAwarded,
      };
    });
  }

  async getSummary(userId: string, periodKey: string): Promise<PointsTotals> {
    return this.calculateTotals(this.prisma, userId, periodKey);
  }

  async getOwnedStoreItemIds(userId: string): Promise<string[]> {
    const transactions = await this.prisma.pointTransaction.findMany({
      where: {
        userId,
        type: PrismaPointTransactionType.STORE_REDEMPTION,
      },
      select: { sourceId: true },
    });

    return transactions.map((transaction) => transaction.sourceId);
  }

  async getEquippedStoreItemIds(userId: string): Promise<string[]> {
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
      select: { equippedStoreItems: true },
    });

    return settings?.equippedStoreItems ?? [];
  }

  async redeemStoreItem(
    input: RedeemStoreItemInput,
  ): Promise<RedeemStoreItemResult> {
    return this.prisma.$transaction(async (tx) => {
      await this.lockUserPoints(tx, input.userId);

      const existing = await tx.pointTransaction.findUnique({
        where: {
          userId_type_sourceId: {
            userId: input.userId,
            type: PrismaPointTransactionType.STORE_REDEMPTION,
            sourceId: input.itemId,
          },
        },
        select: { id: true },
      });
      const totals = await this.calculateTotals(
        tx,
        input.userId,
        input.periodKey,
      );

      if (existing) {
        return { status: 'OWNED', ...totals };
      }

      if (totals.balance < input.cost) {
        return { status: 'INSUFFICIENT_POINTS', ...totals };
      }

      await tx.pointTransaction.create({
        data: {
          userId: input.userId,
          type: PrismaPointTransactionType.STORE_REDEMPTION,
          sourceId: input.itemId,
          amount: -input.cost,
          periodKey: input.periodKey,
        },
      });

      return {
        status: 'PURCHASED',
        balance: totals.balance - input.cost,
        earnedThisMonth: totals.earnedThisMonth,
      };
    });
  }

  async setStoreItemEquipped(
    input: SetStoreItemEquippedInput,
  ): Promise<SetStoreItemEquippedResult> {
    return this.prisma.$transaction(async (tx) => {
      await this.lockUserPoints(tx, input.userId);

      if (input.equipped) {
        const redemption = await tx.pointTransaction.findUnique({
          where: {
            userId_type_sourceId: {
              userId: input.userId,
              type: PrismaPointTransactionType.STORE_REDEMPTION,
              sourceId: input.itemId,
            },
          },
          select: { id: true },
        });

        if (!redemption) {
          return { status: 'NOT_OWNED', equippedItemIds: [] };
        }
      }

      const settings = await tx.userSettings.findUnique({
        where: { userId: input.userId },
        select: { equippedStoreItems: true },
      });
      const current = settings?.equippedStoreItems ?? [];
      const next = input.equipped
        ? [
            ...current.filter(
              (itemId) => !input.categoryItemIds.includes(itemId),
            ),
            input.itemId,
          ]
        : current.filter((itemId) => itemId !== input.itemId);

      await tx.userSettings.upsert({
        where: { userId: input.userId },
        create: {
          userId: input.userId,
          equippedStoreItems: next,
        },
        update: { equippedStoreItems: next },
      });

      return { status: 'UPDATED', equippedItemIds: next };
    });
  }

  private async lockUserPoints(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<void> {
    await tx.$queryRaw`
      SELECT pg_advisory_xact_lock(
        hashtextextended(${userId}, 0)
      )::text AS locked
    `;
  }

  private async calculateTotals(
    client: PointsClient,
    userId: string,
    periodKey: string,
  ): Promise<PointsTotals> {
    const balance = await client.pointTransaction.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    const earned = await client.pointTransaction.aggregate({
      where: {
        userId,
        periodKey,
        type: {
          in: [
            PrismaPointTransactionType.TASK_COMPLETED,
            PrismaPointTransactionType.POMODORO_COMPLETED,
          ],
        },
      },
      _sum: { amount: true },
    });

    return {
      balance: balance._sum.amount ?? 0,
      earnedThisMonth: earned._sum.amount ?? 0,
    };
  }
}
