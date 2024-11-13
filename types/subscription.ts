export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: string;
  price: number;
  documentsPerMonth: number;
  questionsPerDocument: number;
  features: string[];
  stripePriceId: string | null;
}

export interface UserSubscription {
  planId: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  documentsUsed: number;
  questionsUsed: Record<string, number>;
}
