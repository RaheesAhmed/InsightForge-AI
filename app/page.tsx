"use client";

import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Users,
  Brain,
  Check,
  Star,
  FileText,
  BarChart,
  ArrowUpRight,
} from "lucide-react";
import NavBar from "@/components/NavBar";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const features = [
    {
      title: "Proven Business Strategies",
      description: "Access battle-tested methods from successful entrepreneurs",
      icon: <Star className="h-6 w-6 text-yellow-500" />,
    },
    {
      title: "Actionable Frameworks",
      description: "Step-by-step implementation guides and templates",
      icon: <FileText className="h-6 w-6 text-blue-500" />,
    },
    {
      title: "Growth Analytics",
      description: "Key metrics and indicators for business success",
      icon: <BarChart className="h-6 w-6 text-green-500" />,
    },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/collect-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess(true);
        setEmail("");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      <header>
        <NavBar />
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="text-center">
          <div className="mb-8 inline-flex items-center rounded-full bg-blue-50 px-6 py-2 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            <span>Free Business Success Guide</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>

          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">Transform Your Business with</span>
            <span className="block text-blue-600 mt-2">
              Expert Leadership Insights
            </span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 sm:text-xl">
            Download our comprehensive guide featuring proven strategies from
            industry leaders. Learn the exact methods they used to build
            successful enterprises.
          </p>

          {/* Value Propositions */}
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-left">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl p-6 shadow-sm"
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

          {/* What You'll Get Section */}
          <div className="mt-16 bg-white rounded-2xl shadow-sm p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              What You'll Get
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {[
                "50+ Pages of Actionable Content",
                "Real Case Studies & Examples",
                "Implementation Checklists",
                "Growth Strategy Templates",
                "Performance Metrics Guide",
                "Expert Tips & Insights",
                "Resource Directory",
                "Success Frameworks",
              ].map((item) => (
                <div key={item} className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Email Collection Form */}
          <div className="mt-12 max-w-xl mx-auto">
            <div className="bg-blue-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Get Your Free Guide Now
              </h3>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="flex-1">
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="block w-full rounded-lg border-gray-300 px-5 py-3 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="block rounded-lg bg-blue-600 px-5 py-3 text-base font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:px-10 disabled:opacity-75 whitespace-nowrap"
                >
                  {isLoading ? "Sending..." : "Download Free Guide"}
                </button>
              </form>
              {success && (
                <div className="mt-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                  Success! Check your email for your free business guide! 🎉
                </div>
              )}
              <p className="mt-4 text-xs text-gray-500">
                Join thousands of entrepreneurs who have transformed their
                businesses with our insights.
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  Expert Knowledge
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Curated insights from successful business leaders and
                  entrepreneurs
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <Users className="h-8 w-8 text-blue-600 mx-auto" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  10,000+ Downloads
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Trusted by thousands of ambitious entrepreneurs worldwide
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <Brain className="h-8 w-8 text-blue-600 mx-auto" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  AI-Enhanced Insights
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Advanced analysis powered by cutting-edge AI technology
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
                Empowering entrepreneurs with AI-powered business insights and
                strategies.
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
