import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@clerk/nextjs";
import { SubscriptionPlan } from "@/types/subscription";
import { Button } from "./ui/button";
import { toast } from "@/hooks/use-toast";

interface SettingsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsSheet: React.FC<SettingsSheetProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const { user, isLoaded } = useUser();
  const [plans, setPlans] = React.useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPlans = async () => {
      const res = await fetch("/api/subscriptions");
      const data = await res.json();
      setPlans(data);
      setLoading(false);
    };
    fetchPlans();
  }, []);

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
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        // Free plan was activated
        toast({
          title: "Subscription updated successfully!",
        });
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
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[540px] overflow-hidden flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        {/* Make the entire content area scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Section */}
          <div className="py-6">
            <h3 className="text-lg font-semibold mb-4">Profile</h3>
            <div className="flex items-center gap-4">
              <img
                src={user?.imageUrl}
                alt={user?.fullName || "Profile"}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <p className="font-medium">{user?.fullName}</p>
                <p className="text-sm text-gray-500">
                  {user?.emailAddresses[0].emailAddress}
                </p>
              </div>
            </div>
          </div>

          <Separator />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSheet;
