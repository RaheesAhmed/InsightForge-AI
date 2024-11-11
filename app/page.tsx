"use client";

import { useState } from "react";
import { ArrowRight, BookOpen, Users, Brain, Check } from "lucide-react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">VirtuHelpX</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">Unlock the Secrets of</span>
            <span className="block text-indigo-600 mt-2">
              Business Leaders' Success
            </span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 sm:text-xl">
            Get instant access to our exclusive guide featuring proven
            strategies from top entrepreneurs. Learn how they built their
            empires and apply their wisdom to your journey.
          </p>

          {/* Feature List */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-left">
              {[
                "Expert insights from industry leaders",
                "Actionable success strategies",
                "Real-world case studies",
                "Practical implementation tips",
              ].map((feature) => (
                <div key={feature} className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Email Collection Form */}
          <div className="mt-12 max-w-xl mx-auto">
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
                  className="block w-full rounded-lg border-gray-300 px-5 py-3 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="block rounded-lg bg-indigo-600 px-5 py-3 text-base font-medium text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:px-10 disabled:opacity-75 whitespace-nowrap"
              >
                {isLoading ? "Sending..." : "Get Free Guide"}
              </button>
            </form>
            {success && (
              <div className="mt-4 text-sm text-green-600">
                Check your email for the free guide! 🎉
              </div>
            )}
          </div>

          {/* Social Proof */}
          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <BookOpen className="h-8 w-8 text-indigo-600 mx-auto" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  Comprehensive Guide
                </h3>
                <p className="mt-2 text-gray-600">
                  Detailed strategies and frameworks used by successful
                  entrepreneurs
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <Users className="h-8 w-8 text-indigo-600 mx-auto" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  Expert Network
                </h3>
                <p className="mt-2 text-gray-600">
                  Learn from a curated network of successful business leaders
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <Brain className="h-8 w-8 text-indigo-600 mx-auto" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  AI-Powered Insights
                </h3>
                <p className="mt-2 text-gray-600">
                  Access personalized insights powered by advanced AI technology
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-500">
            © 2024 VirtuHelpX. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
