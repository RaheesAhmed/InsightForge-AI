import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/useAuth";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, CreditCard, Package, Crown } from "lucide-react";
import { Subscription, SubscriptionPlan } from "@/types/subscription";

interface SettingsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Basic features for personal use",
    price: 0,
    features: ["5 documents per month", "100 questions per month"],
    documentsPerMonth: 5,
    questionsPerMonth: 100,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Advanced features for professionals",
    price: 10,
    features: ["Unlimited documents", "Unlimited questions"],
    documentsPerMonth: -1,
    questionsPerMonth: -1,
  },
];

const SettingsSheet: React.FC<SettingsSheetProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const currentPlan =
    SUBSCRIPTION_PLANS.find((plan) => plan.id === user?.subscription?.plan) ||
    SUBSCRIPTION_PLANS[0];

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          planId,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else if (data.success) {
        // Handle free plan subscription
        toast.success("Successfully subscribed to free plan!");
        onOpenChange(false); // Close the settings sheet
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to process subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[540px] overflow-hidden flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-indigo-600">
                    {user?.name?.[0] || user?.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium">{user?.name}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Plan Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{currentPlan.name}</h3>
                  <p className="text-sm text-gray-500">
                    {currentPlan.description}
                  </p>
                </div>
                <Badge variant="secondary">${currentPlan.price}/month</Badge>
              </div>

              {/* Usage Stats */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Documents Used</span>
                    <span>
                      {user?.subscription?.documentsUsed ?? 0}/
                      {currentPlan.documentsPerMonth === -1
                        ? "∞"
                        : currentPlan.documentsPerMonth}
                    </span>
                  </div>
                  <Progress
                    value={
                      ((user?.subscription?.documentsUsed ?? 0) /
                        (currentPlan.documentsPerMonth || 1)) *
                      100
                    }
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Questions Used</span>
                    <span>
                      {user?.subscription?.questionsUsed ?? 0}/
                      {currentPlan.questionsPerMonth === -1
                        ? "∞"
                        : currentPlan.questionsPerMonth}
                    </span>
                  </div>
                  <Progress
                    value={
                      ((user?.subscription?.questionsUsed ?? 0) /
                        (currentPlan.questionsPerMonth || 1)) *
                      100
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Plans */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Available Plans
              </CardTitle>
              <CardDescription>
                Choose the plan that best fits your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-500 transition-colors duration-200"
                >
                  <div>
                    <h4 className="font-medium">{plan.name}</h4>
                    <p className="text-sm text-gray-500">${plan.price}/month</p>
                    <ul className="text-sm text-gray-500 mt-2">
                      {plan.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading || plan.id === user?.subscription?.plan}
                    variant={
                      plan.id === user?.subscription?.plan
                        ? "secondary"
                        : "default"
                    }
                    className="min-w-[100px]"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <span className="animate-spin mr-2">⚪</span>
                        Processing...
                      </div>
                    ) : plan.id === user?.subscription?.plan ? (
                      "Current Plan"
                    ) : (
                      "Upgrade"
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Manage Payment Methods
              </Button>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSheet;
