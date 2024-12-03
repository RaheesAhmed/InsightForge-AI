import React, { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Switch } from "./ui/switch";
import { useAuth } from "@/lib/useAuth";
import { motion } from "framer-motion";

const pricingPlans = [
  {
    name: "Free",
    price: { monthly: 0, annual: 0 },
    description: "Perfect for getting started",
    features: [
      "3 preloaded documents",
      "3 self-uploaded documents",
      "Unlimited questions and interactions",
      "Basic summaries",
      "Standard support",
    ],
    highlighted: false,
  },
  {
    name: "Starter",
    price: { monthly: 9.99, annual: 99.99 },
    description: "Great for individual professionals",
    features: [
      "5 preloaded documents",
      "7 self-uploaded documents",
      "Unlimited questions and interactions",
      "Advanced summaries",
      "Detailed Q&A",
      "Email support",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: { monthly: 29.99, annual: 299.99 },
    description: "Perfect for growing teams",
    features: [
      "20 preloaded documents",
      "20 self-uploaded documents",
      "Unlimited questions and interactions",
      "AI-powered insights",
      "Google Drive/Dropbox integrations",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    name: "Unlimited",
    price: { monthly: 59.99, annual: 599.99 },
    description: "For enterprises and large teams",
    features: [
      "Unlimited preloaded documents",
      "Unlimited self-uploaded documents",
      "Unlimited questions and interactions",
      "All features included",
      "Priority support",
      "Future features included",
      "Team collaboration",
      "Custom branding",
      "API access",
    ],
    highlighted: false,
  },
];

export const PricingTable: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSubscribe = (planName: string) => {
    if (!user) {
      router.push("/sign-in");
      return;
    }
    // Handle subscription logic
    console.log(`Subscribing to ${planName} plan`);
  };

  const calculatePrice = (price: { monthly: number; annual: number }) => {
    return isAnnual ? price.annual : price.monthly;
  };

  const calculateSavings = (price: { monthly: number; annual: number }) => {
    const annualMonthly = price.annual / 12;
    const savings = ((price.monthly - annualMonthly) / price.monthly) * 100;
    return Math.round(savings);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_400px_at_50%_300px,#3B82F6,transparent)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_400px_at_80%_80%,#6366F1,transparent)]" />
      </div>

      <div className="relative">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-xl text-gray-400">
            Choose the perfect plan for your needs
          </p>

          {/* Billing Toggle */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="text-sm text-gray-400">Monthly</span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="bg-white/10 data-[state=checked]:bg-blue-500"
            />
            <span className="text-sm text-gray-400">
              Annual{" "}
              <span className="text-blue-400 font-medium">
                (Save up to 20%)
              </span>
            </span>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pricingPlans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card
                className={`relative flex flex-col rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 transition-all duration-300 hover:border-white/20 ${
                  plan.highlighted ? "border-2 border-blue-500" : ""
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-2 text-sm font-semibold text-white text-center">
                    Most Popular
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    {plan.name}
                    {plan.highlighted && (
                      <Sparkles className="h-5 w-5 text-blue-400" />
                    )}
                  </h3>
                  <p className="mt-2 text-gray-400">{plan.description}</p>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      ${calculatePrice(plan.price)}
                    </span>
                    <span className="ml-1 text-xl text-gray-400">
                      {isAnnual ? "/year" : "/month"}
                    </span>
                  </div>
                  {isAnnual && plan.price.monthly > 0 && (
                    <p className="mt-1 text-sm text-blue-400">
                      Save {calculateSavings(plan.price)}%
                    </p>
                  )}

                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <div className="flex-shrink-0">
                          <Check className="h-5 w-5 text-blue-400" />
                        </div>
                        <span className="ml-3 text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto p-6 pt-0">
                  <Button
                    onClick={() => handleSubscribe(plan.name)}
                    className={`w-full transition-all duration-300 ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    {plan.name === "Free" ? "Get Started" : "Subscribe Now"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mt-16 text-center">
          <a
            href="#compare"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Compare all features →
          </a>
        </div>
      </div>
    </div>
  );
};

export default PricingTable;
