"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "@/hooks/use-toast";
import { activateSubscription, cancelSubscription } from "@/lib/paypal";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: {
    plan: string;
    questionsUsed: number;
    documentsUsed: number;
    questionsPerMonth: number;
    documentsPerMonth: number;
    validUntil: Date;
  } | null;
}

export function SettingsSheet({
  isOpen,
  onClose,
  subscription,
}: SettingsSheetProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      await cancelSubscription(subscription?.plan || "");

      toast({
        title: "Subscription cancelled",
        description: "Your subscription has been cancelled successfully",
      });

      router.refresh();
      onClose();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error cancelling subscription",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeSubscription = async (subscriptionId: string) => {
    try {
      setLoading(true);
      await activateSubscription(subscriptionId);

      toast({
        title: "Subscription upgraded",
        description: "Your subscription has been upgraded successfully",
      });

      router.refresh();
      onClose();
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      toast({
        title: "Error upgrading subscription",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        <div className="py-6">
          <h3 className="font-medium mb-4">Subscription Details</h3>
          {subscription ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="font-medium">{subscription.plan}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Usage</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Documents: {subscription.documentsUsed}/
                    {subscription.documentsPerMonth === -1
                      ? "∞"
                      : subscription.documentsPerMonth}
                  </li>
                  <li>
                    Questions: {subscription.questionsUsed}/
                    {subscription.questionsPerMonth === -1
                      ? "∞"
                      : subscription.questionsPerMonth}
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valid Until</p>
                <p className="font-medium">
                  {new Date(subscription.validUntil).toLocaleDateString()}
                </p>
              </div>

              {subscription.plan !== "Free" && (
                <div className="pt-4">
                  <Button
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    disabled={loading}
                    className="w-full"
                  >
                    Cancel Subscription
                  </Button>
                </div>
              )}

              {subscription.plan === "Free" && (
                <div className="pt-4 space-y-4">
                  <h4 className="font-medium">Upgrade to Pro</h4>
                  <PayPalButtons
                    createSubscription={(data, actions) => {
                      return actions.subscription.create({
                        plan_id: process.env.NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID!,
                      });
                    }}
                    onApprove={async (data, actions) => {
                      if (data.subscriptionID) {
                        await handleUpgradeSubscription(data.subscriptionID);
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
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No active subscription found
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
