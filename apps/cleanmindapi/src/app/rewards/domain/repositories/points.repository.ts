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

export interface RedeemStoreItemInput {
  userId: string;
  itemId: string;
  cost: number;
  periodKey: string;
}

export type StoreRedemptionStatus =
  | 'PURCHASED'
  | 'OWNED'
  | 'INSUFFICIENT_POINTS';

export interface RedeemStoreItemResult extends PointsTotals {
  status: StoreRedemptionStatus;
}

export interface SetStoreItemEquippedInput {
  userId: string;
  itemId: string;
  categoryItemIds: string[];
  equipped: boolean;
}

export type StoreItemEquipStatus = 'UPDATED' | 'NOT_OWNED';

export interface SetStoreItemEquippedResult {
  status: StoreItemEquipStatus;
  equippedItemIds: string[];
}

export abstract class PointsRepository {
  abstract findUserTimezone(userId: string): Promise<string>;

  abstract award(input: AwardPointsInput): Promise<AwardPointsResult>;

  abstract getSummary(userId: string, periodKey: string): Promise<PointsTotals>;

  abstract getOwnedStoreItemIds(userId: string): Promise<string[]>;

  abstract getEquippedStoreItemIds(userId: string): Promise<string[]>;

  abstract redeemStoreItem(
    input: RedeemStoreItemInput,
  ): Promise<RedeemStoreItemResult>;

  abstract setStoreItemEquipped(
    input: SetStoreItemEquippedInput,
  ): Promise<SetStoreItemEquippedResult>;
}
