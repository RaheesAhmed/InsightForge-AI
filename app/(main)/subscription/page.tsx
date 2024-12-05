"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Crown,
  User,
  Calendar,
  CreditCard,
  CheckCircle2,
  Zap,
  Shield,
  Gift,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useAuth, useUser, RedirectToSignIn } from "@clerk/nextjs";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { activateSubscription } from "@/lib/paypal";

interface UserData {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface Subscription {
  plan: string;
  documentsLimit: number;
  questionsLimit: number;
  questionsUsed: number;
  documentsUsed: number;
  validUntil: Date;
  planId: string | null;
}

const plans = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for trying out our service",
    price: 0,
    documentsLimit: 3,
    questionsLimit: 20,
    planId: null,
    features: [
      "3 documents/month",
      "20 questions/month",
      "Basic Support",
      "Standard Features",
    ],
    icon: <User className="h-5 w-5" />,
    color: "bg-gray-100 text-gray-900",
  },
  {
    id: "pro",
    name: "Professional",
    description: "Best for professionals and small teams",
    price: 29.99,
    documentsLimit: 25,
    questionsLimit: 100,
    planId: process.env.NEXT_PUBLIC_PAYPAL_BASIC_PLAN_ID,
    features: [
      "25 documents/month",
      "100 questions/month",
      "Priority Support",
      "Advanced Features",
      "API Access",
      "Team Collaboration",
    ],
    icon: <Zap className="h-5 w-5" />,
    color: "bg-blue-100 text-blue-900",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with advanced needs",
    price: 99.99,
    documentsLimit: -1,
    questionsLimit: -1,
    planId: process.env.NEXT_PUBLIC_PAYPAL_ENTERPRISE_PLAN_ID,
    features: [
      "Unlimited documents",
      "Unlimited questions",
      "24/7 Premium Support",
      "All Features",
      "Custom Integration",
      "Dedicated Account Manager",
      "SLA Guarantee",
      "Custom AI Training",
    ],
    icon: <Crown className="h-5 w-5" />,
    color: "bg-purple-100 text-purple-900",
  },
];

export default function SubscriptionPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const { toast } = useToast();
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    console.log("Auth State:", { isLoaded, isSignedIn, user: clerkUser });
    if (isLoaded && isSignedIn && clerkUser) {
      fetchUserData();
      fetchSubscriptionDetails();
    }
  }, [isLoaded, isSignedIn, clerkUser]);

  const fetchUserData = async () => {
    console.log("Fetching user data...");
    if (!clerkUser) {
      console.log("No clerk user found");
      setLoading(false);
      return;
    }

    setUser({
      id: clerkUser.id,
      name: clerkUser.fullName || clerkUser.username || "User",
      email: clerkUser.primaryEmailAddress?.emailAddress || "",
      image: clerkUser.imageUrl,
    });
    console.log("User data set successfully");
  };

  const fetchSubscriptionDetails = async () => {
    if (!clerkUser) {
      console.log("No clerk user found for subscription details");
      return;
    }

    try {
      console.log("Fetching subscription details...");
      const token = await getToken();
      const response = await fetch("/api/subscriptions/manage", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Subscription API error:", error);
        throw new Error("Failed to fetch subscription details");
      }

      const data = await response.json();
      console.log("Subscription data received:", data);
      setSubscription(data);
    } catch (error) {
      console.error("Error fetching subscription details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch subscription details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionSuccess = async (
    subscriptionId: string,
    planName: string
  ) => {
    try {
      setUpgrading(true);
      const token = await getToken();

      // Update subscription in database
      const response = await fetch("/api/subscriptions/manage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscriptionId,
          plan: planName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update subscription");
      }

      // Activate PayPal subscription
      await activateSubscription(subscriptionId);

      toast({
        title: "Success",
        description: "Your subscription has been upgraded successfully",
      });

      await fetchSubscriptionDetails();
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      toast({
        title: "Error",
        description: "Failed to upgrade subscription",
        variant: "destructive",
      });
    } finally {
      setUpgrading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Current Plan Section */}
      {subscription && (
        <div className="mx-auto max-w-7xl mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={user?.image} />
                  <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{user?.name}</h2>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={
                  subscription.plan === "Free" ? "bg-gray-100" : "bg-blue-100"
                }
              >
                {subscription.plan} Plan
              </Badge>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {subscription.documentsUsed} /{" "}
                      {subscription.documentsLimit === -1
                        ? "∞"
                        : subscription.documentsLimit}
                    </div>
                    <Progress
                      value={
                        (subscription.documentsUsed /
                          subscription.documentsLimit) *
                        100
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {subscription.questionsUsed} /{" "}
                      {subscription.questionsLimit === -1
                        ? "∞"
                        : subscription.questionsLimit}
                    </div>
                    <Progress
                      value={
                        (subscription.questionsUsed /
                          subscription.questionsLimit) *
                        100
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Billing Period
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      Valid until{" "}
                      {new Date(subscription.validUntil).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Payment Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      Active
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Plans Section */}
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Select the perfect plan for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className={`relative h-full ${
                  plan.name === subscription?.plan ? "ring-2 ring-blue-500" : ""
                }`}
              >
                {plan.name === subscription?.plan && (
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-blue-500">Current Plan</Badge>
                  </div>
                )}
                <CardHeader>
                  <div
                    className={`inline-flex rounded-lg p-2 ${plan.color} mb-4`}
                  >
                    {plan.icon}
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-4">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.planId && plan.name !== subscription?.plan ? (
                    <div className="relative">
                      {upgrading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      )}
                      <PayPalButtons
                        createSubscription={(data, actions) => {
                          return actions.subscription.create({
                            plan_id: plan.planId!,
                          });
                        }}
                        onApprove={async (data, actions) => {
                          if (data.subscriptionID) {
                            await handleSubscriptionSuccess(
                              data.subscriptionID,
                              plan.name
                            );
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
                        disabled={upgrading}
                      />
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      variant={
                        plan.name === subscription?.plan ? "outline" : "default"
                      }
                      disabled={true}
                    >
                      {plan.name === subscription?.plan
                        ? "Current Plan"
                        : "Select Plan"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
