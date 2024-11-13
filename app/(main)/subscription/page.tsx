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
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

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

export default function SubscriptionPage() {
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
    try {
      const response = await fetch("/api/users/me");
      const data = await response.json();
      if (response.ok) {
        setUser(data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await fetch("/api/subscriptions/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "check" }),
      });
      const data = await response.json();
      if (response.ok) {
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/subscriptions/plans");
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products);
        setPrices(data.prices);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setUpgrading(true);
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else if (response.ok) {
        toast({
          title: "Success",
          description: "Subscription updated successfully",
        });
        fetchSubscriptionDetails();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8 px-4">
      {/* User Profile Section */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-6 text-white shadow-xl"
        >
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-4 border-white">
              <AvatarImage src={user.image} />
              <AvatarFallback>
                {user.name?.charAt(0) || user.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-white/80">{user.email}</p>
              {subscription && (
                <Badge className="mt-2 bg-white/20 hover:bg-white/30">
                  <Crown className="w-4 h-4 mr-1" />
                  {subscription.plan} Plan
                </Badge>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Current Subscription */}
      {subscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Crown className="text-yellow-500" />
                    Current Subscription
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4" />
                    Valid until{" "}
                    {new Date(subscription.validUntil).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    subscription.plan === "FREE" ? "secondary" : "default"
                  }
                >
                  {subscription.plan}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" /> Documents Usage
                  </p>
                  <span className="text-sm font-semibold">
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
                  className="h-2"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Questions Usage
                  </p>
                  <span className="text-sm font-semibold">
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
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Available Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {products.map((product, index) => {
          const price = prices.find((p) => p.id === product.default_price);
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <Card
                className={`hover:shadow-lg transition-shadow ${
                  subscription?.planId === product.id
                    ? "border-2 border-purple-500"
                    : ""
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {product.name}
                    {subscription?.planId === product.id && (
                      <Badge variant="success" className="bg-green-500">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Current
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-3xl font-bold text-center">
                      {price
                        ? `${(price.unit_amount / 100).toFixed(
                            2
                          )} ${price.currency.toUpperCase()}`
                        : "Free"}
                      {price?.recurring && (
                        <span className="text-sm font-normal text-gray-500">
                          /{price.recurring.interval}
                        </span>
                      )}
                    </p>
                    <ul className="space-y-3">
                      {[
                        `${product.metadata.documentsPerMonth} documents/month`,
                        `${product.metadata.questionsPerMonth} questions/month`,
                        "24/7 Support",
                        "API Access",
                      ].map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${
                        subscription?.planId === product.id
                          ? "bg-green-500 hover:bg-green-600"
                          : ""
                      }`}
                      onClick={() => handleUpgrade(product.id)}
                      disabled={
                        upgrading || subscription?.planId === product.id
                      }
                    >
                      {upgrading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : subscription?.planId === product.id ? (
                        "Current Plan"
                      ) : (
                        "Select Plan"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
