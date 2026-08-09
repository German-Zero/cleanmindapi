import { PointTransactionType } from '../enums/point-transaction-type.enum';
import { PointsTotals } from '../models/reward.model';

export interface AwardPointsInput {
  userId: string;
  type: PointTransactionType;
  sourceId: string;
  amount: number;
  periodKey: string;
  monthlyLimit: number;
}

export interface AwardPointsResult extends PointsTotals {
  pointsAwarded: number;
}

export abstract class PointsRepository {
  abstract findUserTimezone(userId: string): Promise<string>;

  abstract award(input: AwardPointsInput): Promise<AwardPointsResult>;

  abstract getSummary(userId: string, periodKey: string): Promise<PointsTotals>;
}
