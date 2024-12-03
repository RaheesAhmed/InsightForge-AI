import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useUser } from "@clerk/nextjs";
import { toast } from "@/hooks/use-toast";
import { paypalConfig } from "@/lib/paypal";

const PLAN_IDS = {
  BASIC: process.env.NEXT_PUBLIC_PAYPAL_BASIC_PLAN_ID || "BASIC_PLAN_ID",
  PREMIUM: process.env.NEXT_PUBLIC_PAYPAL_PREMIUM_PLAN_ID || "PREMIUM_PLAN_ID",
  ENTERPRISE:
    process.env.NEXT_PUBLIC_PAYPAL_ENTERPRISE_PLAN_ID || "ENTERPRISE_PLAN_ID",
};

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription?: {
    questionsUsed: number;
    documentsUsed: number;
    questionsPerMonth: number;
    documentsPerMonth: number;
  };
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  subscription,
}) => {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = React.useState(false);

  const handleSubscribe = async (planId: string) => {
    try {
      if (!user || !isLoaded) {
        toast({
          title: "Please sign in to subscribe",
        });
        return;
      }

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

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Subscription updated successfully!",
        });
        onClose();
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      toast({
        title: "Failed to update subscription",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            {subscription && (
              <div className="mt-2 text-sm text-gray-500">
                Current Usage:
                <ul className="list-disc list-inside">
                  <li>
                    Questions: {subscription.questionsUsed}/
                    {subscription.questionsPerMonth === -1
                      ? "∞"
                      : subscription.questionsPerMonth}
                  </li>
                  <li>
                    Documents: {subscription.documentsUsed}/
                    {subscription.documentsPerMonth === -1
                      ? "∞"
                      : subscription.documentsPerMonth}
                  </li>
                </ul>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <PayPalScriptProvider options={paypalConfig}>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex justify-between items-center">
                  Basic Plan
                  <span className="text-indigo-600">$9.99/month</span>
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-gray-500">
                  <li>• 5 documents per month</li>
                  <li>• 10 questions per document</li>
                  <li>• Priority support</li>
                </ul>
                <PayPalButtons
                  createSubscription={(data, actions) => {
                    return actions.subscription
                      .create({
                        plan_id: PLAN_IDS.BASIC,
                      })
                      .then((orderId) => {
                        return orderId;
                      });
                  }}
                  onApprove={(data, actions) => {
                    handleSubscribe(PLAN_IDS.BASIC);
                    return Promise.resolve();
                  }}
                  onError={(err) => {
                    toast({
                      title: "Payment failed",
                      description: "Please try again or contact support.",
                    });
                  }}
                  style={{ layout: "horizontal" }}
                  disabled={loading}
                />
              </div>

              <div className="border rounded-lg p-4 bg-indigo-50">
                <h3 className="font-semibold flex justify-between items-center">
                  Premium Plan
                  <span className="text-indigo-600">$29.99/month</span>
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-gray-500">
                  <li>• Unlimited documents</li>
                  <li>• Unlimited questions</li>
                  <li>• Premium support</li>
                  <li>• Custom features</li>
                </ul>
                <PayPalButtons
                  createSubscription={(data, actions) => {
                    return actions.subscription
                      .create({
                        plan_id: PLAN_IDS.PREMIUM,
                      })
                      .then((orderId) => {
                        return orderId;
                      });
                  }}
                  onApprove={(data, actions) => {
                    handleSubscribe(PLAN_IDS.PREMIUM);
                    return Promise.resolve();
                  }}
                  onError={(err) => {
                    toast({
                      title: "Payment failed",
                      description: "Please try again or contact support.",
                    });
                  }}
                  style={{ layout: "horizontal" }}
                  disabled={loading}
                />
              </div>
            </div>
          </PayPalScriptProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
