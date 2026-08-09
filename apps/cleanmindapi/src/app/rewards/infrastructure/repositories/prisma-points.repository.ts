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
      await tx.$queryRaw`
        SELECT pg_advisory_xact_lock(
          hashtextextended(${input.userId}, 0)
        ) AS locked
      `;

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
