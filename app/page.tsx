"use client";

import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  MessageSquare,
  FileText,
  BarChart,
  Shield,
  Zap,
  BookCheck,
  Upload,
  Check,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/lib/useAuth";
import { toast } from "@/hooks/use-toast";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const features = [
    {
      title: "AI-Powered Document Analysis",
      description:
        "Interact with business documents using advanced AI technology",
      icon: <MessageSquare className="h-6 w-6 text-indigo-500" />,
    },
    {
      title: "Premium Business Content",
      description:
        "Access insights from leading entrepreneurs and business leaders",
      icon: <BookCheck className="h-6 w-6 text-emerald-500" />,
    },
    {
      title: "Custom Document Upload",
      description: "Upload and analyze your own business documents",
      icon: <Upload className="h-6 w-6 text-blue-500" />,
    },
  ];

  const plans = [
    {
      name: "Free",
      price: "$0",
      features: [
        "1 document per month",
        "3 AI questions per document",
        "Basic document analysis",
        "Community support",
      ],
      buttonText: "Start Free",
      highlighted: false,
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month",
      features: [
        "10 documents per month",
        "Unlimited AI questions",
        "Advanced document analysis",
        "Priority support",
        "Custom document upload",
        "Export capabilities",
      ],
      buttonText: "Get Started",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Unlimited documents",
        "Unlimited AI questions",
        "White-label solution",
        "Dedicated support",
        "API access",
        "Custom integrations",
      ],
      buttonText: "Contact Sales",
      highlighted: false,
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You must be logged in to start your trial",
      });
      return;
    }

    try {
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <header>
        <NavBar />
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="text-center">
          <div className="mb-8 inline-flex items-center rounded-full bg-indigo-50 px-6 py-2 text-sm font-medium text-indigo-600 ring-1 ring-inset ring-indigo-600/10">
            <Zap className="mr-2 h-4 w-4" />
            <span>AI-Powered Document Intelligence</span>
          </div>

          <h1 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl md:text-6xl lg:text-5xl">
            <span className="block">Transform Business Documents</span>
            <span className="block text-indigo-600 mt-2">
              Into Interactive Knowledge
            </span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 sm:text-xl">
            Leverage AI to extract insights from business documents. Ask
            questions, get answers, and make better decisions with our
            intelligent document analysis platform.
          </p>

          {/* Features Grid */}
          <div className="mt-12 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-center mb-4">
                    {feature.icon}
                    <h3 className="ml-3 font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mt-24 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-3xl p-12 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-indigo-600 font-bold text-lg mb-2">1</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Upload Documents
                </h3>
                <p className="text-sm text-gray-600">
                  Upload business documents or access our premium content
                  library
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-indigo-600 font-bold text-lg mb-2">2</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Ask Questions
                </h3>
                <p className="text-sm text-gray-600">
                  Interact with documents using natural language questions
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-indigo-600 font-bold text-lg mb-2">3</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Get Insights
                </h3>
                <p className="text-sm text-gray-600">
                  Receive AI-powered answers and actionable insights
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">
              Choose Your Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative bg-white rounded-2xl p-8 ${
                    plan.highlighted
                      ? "ring-2 ring-indigo-600 shadow-lg"
                      : "shadow-sm"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="inline-flex rounded-full bg-indigo-600 px-4 py-1 text-sm font-semibold text-white">
                        Most Popular
                      </div>
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {plan.name}
                    </h3>
                    <div className="mt-4 flex items-baseline justify-center gap-x-2">
                      <span className="text-4xl font-bold tracking-tight text-gray-900">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-sm text-gray-600">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <ul className="mt-8 space-y-4 text-sm text-gray-600">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center justify-center"
                        >
                          <Check className="h-4 w-4 text-indigo-600 mr-3" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`mt-8 w-full rounded-lg px-4 py-2 text-sm font-semibold ${
                        plan.highlighted
                          ? "bg-indigo-600 text-white hover:bg-indigo-700"
                          : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                      } transition-colors duration-200`}
                    >
                      {plan.buttonText}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-24">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <Shield className="h-8 w-8 text-indigo-600 mx-auto" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  Enterprise Security
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Bank-level encryption and secure document handling
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <BarChart className="h-8 w-8 text-indigo-600 mx-auto" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  Advanced Analytics
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Detailed insights and usage analytics
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <BookOpen className="h-8 w-8 text-indigo-600 mx-auto" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  Premium Content
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Curated business documents and case studies
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                About VirtuHelpX
              </h4>
              <p className="text-sm text-gray-600">
                AI-powered document analysis platform for business leaders and
                entrepreneurs.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                Contact
              </h4>
              <p className="text-sm text-gray-600">
                support@virtuhelpx.com
                <br />
                Monday - Friday, 9am - 5pm EST
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                Legal
              </h4>
              <div className="space-y-2">
                <a
                  href="/privacy"
                  className="text-sm text-gray-600 hover:text-gray-900 block"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms"
                  className="text-sm text-gray-600 hover:text-gray-900 block"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              © 2024 VirtuHelpX. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
