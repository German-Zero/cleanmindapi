export interface RewardSummary {
  balance: number;
  earnedThisMonth: number;
  monthlyLimit: number;
  remainingThisMonth: number;
}

export interface RewardGrant extends RewardSummary {
  pointsAwarded: number;
}

export type RewardedResponse<T> = T & {
  reward: RewardGrant;
};

export interface PointsTotals {
  balance: number;
  earnedThisMonth: number;
}
