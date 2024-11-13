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
import { useAuth } from "@/lib/useAuth";
import NavBar from "@/components/NavBar";

interface UserData {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface Subscription {
  plan: string;
  documentsPerMonth: number;
  questionsPerMonth: number;
  questionsUsed: number;
  documentsUsed: number;
  validUntil: Date;
  planId: string;
}

interface Price {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: {
    interval: string;
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  default_price: string;
  metadata: {
    documentsPerMonth: string;
    questionsPerMonth: string;
  };
}

export default function SubscriptionDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
    fetchSubscriptionDetails();
    fetchPlans();
  }, []);

  const fetchUserData = async () => {
    const user = await useAuth.getState().user;

    if (!user) {
      return; // Don't set user data if user is null/undefined
    }

    setUser({
      id: user.id || "", // Provide default empty string if undefined
      name: user.name || "", // Provide default empty string if undefined
      email: user.email || "", // Provide default empty string if undefined
      image: user.image || undefined, // Keep image optional
    });
  };

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await fetch("/api/subscriptions/usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "check" }), // Just checking current usage
      });

      if (!response.ok) {
        throw new Error("Failed to fetch subscription details");
      }

      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error("Error fetching subscription details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch subscription details",
        variant: "destructive",
      });
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/subscriptions/plans");
      if (!response.ok) {
        throw new Error("Failed to fetch plans");
      }

      const data = await response.json();
      setProducts(
        data.products.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          default_price: product.default_price,
          metadata: {
            documentsPerMonth: product.metadata.documentsPerMonth || "0",
            questionsPerMonth: product.metadata.questionsPerMonth || "0",
          },
        }))
      );
      setPrices(data.prices);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast({
        title: "Error",
        description: "Failed to fetch subscription plans",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setUpgrading(true);
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upgrade plan");
      }

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        // Handle free plan upgrade
        toast({
          title: "Plan Upgraded",
          description: "Your subscription has been successfully upgraded.",
        });
        fetchSubscriptionDetails();
      }
    } catch (error) {
      console.error("Error upgrading plan:", error);
      toast({
        title: "Error",
        description: "Failed to upgrade plan",
        variant: "destructive",
      });
    }
    setUpgrading(false);
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    setUpgrading(true);
    try {
      const response = await fetch("/api/subscriptions", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      toast({
        title: "Subscription Cancelled",
        description:
          "Your subscription will remain active until the end of the billing period",
      });
      fetchSubscriptionDetails();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    }
    setUpgrading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8 px-4 max-w-7xl">
      <NavBar />
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-xl p-8 text-white shadow-2xl"
        >
          <div className="flex items-center gap-8">
            <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
              <AvatarImage src={user.image} />
              <AvatarFallback className="bg-white/10 text-2xl font-bold">
                {user.name?.charAt(0) || user.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
              <p className="text-purple-200 text-lg">{user.email}</p>
              {subscription && (
                <Badge className="mt-2 bg-white/20 hover:bg-white/30 text-white border-none">
                  <Crown className="w-4 h-4 mr-2" />
                  {subscription.plan} Plan
                </Badge>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {subscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Card className="border border-purple-100 bg-white/50 backdrop-blur-sm shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2 text-purple-700">
                    <Zap className="text-purple-500" />
                    Usage Statistics
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Renews on{" "}
                    {new Date(subscription.validUntil).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="border-2 border-purple-200 bg-purple-50"
                >
                  {subscription.plan}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-purple-100">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4 text-purple-500" /> Documents Usage
                  </p>
                  <span className="text-sm font-bold text-purple-600">
                    {subscription.documentsUsed}/
                    {subscription.documentsPerMonth}
                  </span>
                </div>
                <Progress
                  value={
                    (subscription.documentsUsed /
                      subscription.documentsPerMonth) *
                    100
                  }
                  className="h-2 bg-purple-100"
                />
              </div>
              <div className="bg-white p-6 rounded-xl border border-purple-100">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium flex items-center gap-2 text-gray-700">
                    <CreditCard className="w-4 h-4 text-purple-500" /> Questions
                    Usage
                  </p>
                  <span className="text-sm font-bold text-purple-600">
                    {subscription.questionsUsed}/
                    {subscription.questionsPerMonth}
                  </span>
                </div>
                <Progress
                  value={
                    (subscription.questionsUsed /
                      subscription.questionsPerMonth) *
                    100
                  }
                  className="h-2 bg-purple-100"
                />
              </div>
            </CardContent>
          </Card>
          <Card className="border border-purple-100 bg-white/50 backdrop-blur-sm shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2 text-purple-700">
                <Gift className="text-purple-500" />
                Plan Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { icon: Shield, text: "Advanced Security Features" },
                { icon: Zap, text: "Faster Processing Times" },
                { icon: User, text: "Priority Customer Support" },
                { icon: Gift, text: "Exclusive Content Access" },
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-gray-700"
                >
                  <benefit.icon className="w-5 h-5 text-purple-500" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="mt-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Subscription Plans
            </h2>
            <p className="text-gray-600 mt-1">
              Choose the perfect plan for your needs
            </p>
          </div>
          {subscription && subscription.plan !== "FREE" && (
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleCancelSubscription}
              disabled={upgrading}
            >
              Cancel Subscription
            </Button>
          )}
        </div>

        <div className="relative">
          <div
            className="absolute inset-0 bg-purple-50 transform transition-all duration-300 rounded-xl"
            style={{
              width: "33.333333%",
              left: `${
                products.findIndex((p) => p.id === subscription?.planId) *
                33.333333
              }%`,
              display: subscription ? "block" : "none",
            }}
          />

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 rounded-xl border border-purple-100 bg-white overflow-hidden p-6">
            {products.map((product, index) => {
              const price = prices.find((p) => p.id === product.default_price);
              const isCurrentPlan = subscription?.planId === product.id;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`p-6 rounded-xl ${
                    isCurrentPlan
                      ? "bg-purple-50 border-purple-200"
                      : "hover:bg-gray-50 border-gray-200"
                  } border-2 transition-all duration-300`}
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        {isCurrentPlan && (
                          <Badge className="bg-purple-100 text-purple-700 border-none">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {product.description}
                      </p>
                    </div>

                    <div className="mb-6">
                      <p className="text-3xl font-bold text-purple-700">
                        {price
                          ? `$${(price.unit_amount / 100).toFixed(
                              2
                            )} ${price.currency.toUpperCase()}`
                          : "Free"}
                        <span className="text-sm font-normal text-gray-500">
                          {price?.recurring && `/${price.recurring.interval}`}
                        </span>
                      </p>
                    </div>

                    <div className="space-y-3 mb-6 flex-grow">
                      {[
                        `${product.metadata.documentsPerMonth} documents/month`,
                        `${product.metadata.questionsPerMonth} questions/month`,
                        "24/7 Support",
                        "API Access",
                      ].map((feature, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    <Button
                      className={`w-full ${
                        isCurrentPlan
                          ? "bg-purple-200 text-purple-800 hover:bg-purple-300 cursor-default"
                          : "bg-purple-600 hover:bg-purple-700"
                      }`}
                      onClick={() => handleUpgrade(product.id)}
                      disabled={upgrading || isCurrentPlan}
                    >
                      {upgrading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isCurrentPlan ? (
                        "Current Plan"
                      ) : (
                        "Upgrade Plan"
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>All plans include automatic monthly renewals. Cancel anytime.</p>
          <p className="mt-2">
            Need help choosing?{" "}
            <a href="/contact" className="text-purple-600 hover:underline">
              Contact our sales team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
