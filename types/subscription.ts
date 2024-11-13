export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  documentsPerMonth: number;
  questionsPerMonth: number;
}

export interface Subscription {
  plan: string;
  documentsPerMonth: number;
  questionsPerMonth: number;
  questionsUsed: number;
  documentsUsed: number;
  validUntil: Date;
}
