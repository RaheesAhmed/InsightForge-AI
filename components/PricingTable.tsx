"use client";

import { Button } from "@/components/ui/button";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "@/hooks/use-toast";
import { activateSubscription } from "@/lib/paypal";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface PricingPlan {
  name: string;
  description: string;
  price: number;
  features: string[];
  documentsPerMonth: number;
  questionsPerMonth: number;
  planId: string | null;
}

const plans: PricingPlan[] = [
  {
    name: "Free",
    description: "Basic features for personal use",
    price: 0,
    features: ["3 Documents/month", "20 Questions/month"],
    documentsPerMonth: 3,
    questionsPerMonth: 20,
    planId: null,
  },
  {
    name: "Professional",
    description: "Everything you need for professional use",
    price: 29.99,
    features: [
      "25 Documents/month",
      "100 Questions/month",
      "Priority Support",
      "Advanced Analytics",
    ],
    documentsPerMonth: 25,
    questionsPerMonth: 100,
    planId: process.env.NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID!,
  },
  {
    name: "Enterprise",
    description: "Advanced features for teams",
    price: 99.99,
    features: [
      "Unlimited Documents",
      "Unlimited Questions",
      "24/7 Support",
      "Custom Integration",
      "Team Management",
    ],
    documentsPerMonth: -1,
    questionsPerMonth: -1,
    planId: process.env.NEXT_PUBLIC_PAYPAL_ENTERPRISE_PLAN_ID!,
  },
];

export function PricingTable() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubscriptionSuccess = async (subscriptionId: string) => {
    try {
      setLoading(true);
      await activateSubscription(subscriptionId);

      toast({
        title: "Subscription activated",
        description: "Your subscription has been successfully activated",
      });

      router.refresh();
    } catch (error) {
      console.error("Error activating subscription:", error);
      toast({
        title: "Error activating subscription",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className="flex flex-col p-6 bg-white rounded-lg shadow-lg"
        >
          <h3 className="text-2xl font-bold">{plan.name}</h3>
          <p className="mt-2 text-gray-500">{plan.description}</p>
          <div className="mt-4">
            <span className="text-4xl font-bold">${plan.price}</span>
            <span className="text-gray-500">/month</span>
          </div>
          <ul className="mt-6 space-y-4">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="ml-3">{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            {plan.planId ? (
              <PayPalButtons
                createSubscription={(data, actions) => {
                  return actions.subscription.create({
                    plan_id: plan.planId!,
                  });
                }}
                onApprove={async (data, actions) => {
                  if (data.subscriptionID) {
                    await handleSubscriptionSuccess(data.subscriptionID);
                  }
                  return Promise.resolve();
                }}
                onError={(err) => {
                  console.error("PayPal Error:", err);
                  toast({
                    title: "Payment failed",
                    description: "Please try again later",
                    variant: "destructive",
                  });
                }}
                style={{
                  layout: "vertical",
                  color: "blue",
                }}
                disabled={loading}
              />
            ) : (
              <Button className="w-full" variant="outline" disabled>
                Current Plan
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
