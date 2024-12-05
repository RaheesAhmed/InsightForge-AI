"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import {
  Brain,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Sparkles,
  FileText,
  Bot,
  BrainCircuit,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { motion } from "framer-motion";

const floatingFeatures = [
  {
    icon: <FileText className="h-5 w-5 text-blue-400" />,
    text: "Smart Document Analysis",
  },
  {
    icon: <Bot className="h-5 w-5 text-indigo-400" />,
    text: "AI-Powered Insights",
  },
  {
    icon: <BrainCircuit className="h-5 w-5 text-purple-400" />,
    text: "Neural Processing",
  },
];

export default function SignInPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    try {
      setIsLoading(true);

      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
          Pragma: "no-cache",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      // Set auth data in the store
      setAuth(data.token, data.user);

      console.log("auth", data.user);

      // Show success message
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to your account",
      });

      // Force navigation to /chat
      window.location.href = "/";
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Invalid email or password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0A0F1E] via-[#162454] to-[#0A0F1E]">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_400px_at_50%_300px,#3B82F6,transparent)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_400px_at_80%_80%,#6366F1,transparent)]" />
        </div>
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {floatingFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            animate={{
              opacity: 1,
              y: 0,
              x: Math.sin(Date.now() / (2000 + index * 500)) * 20,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: index * 0.2,
            }}
            className="absolute"
            style={{
              top: `${20 + index * 30}%`,
              left: `${10 + index * 25}%`,
            }}
          >
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              {feature.icon}
              <span className="text-sm font-medium text-gray-300">
                {feature.text}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative min-h-screen flex">
        {/* Left Side - Hero Section */}
        <div className="hidden lg:flex w-1/2 flex-col justify-center items-center p-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-md"
          >
            <div className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/20 px-6 py-2 mb-8">
              <BrainCircuit className="w-5 h-5 mr-2 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent font-medium">
                AI-Powered Intelligence
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 font-display">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                VirtuHelpX
              </span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Transform your document experience with AI-powered insights and
              intelligent analysis.
            </p>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          >
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((_, index) => (
                <div
                  key={index}
                  className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  style={{
                    opacity: 0.3 + index * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <Link href="/" className="inline-block mb-6">
                <div className="flex items-center justify-center space-x-2 group">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-200"></div>
                    <Brain className="relative h-8 w-8 text-blue-400" />
                  </div>
                  <span className="text-xl font-bold font-display">
                    <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      Virtu
                    </span>
                    <span className="text-gray-200">HelpX</span>
                  </span>
                </div>
              </Link>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2 className="text-3xl font-bold text-white mb-2 font-display">
                  Welcome Back
                </h2>
                <p className="text-gray-400">
                  Sign in to continue to your account
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative p-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <form onSubmit={handleSubmit} className="relative space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 bg-white/5 border-white/10 text-gray-100 focus:border-blue-500 focus:ring-blue-500 placeholder-gray-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 bg-white/5 border-white/10 text-gray-100 focus:border-blue-500 focus:ring-blue-500 placeholder-gray-500"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 py-5"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Signing in..."
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    href="/sign-up"
                    className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                  >
                    Sign up
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </p>
              </div>
            </motion.div>

            <div className="text-center text-sm">
              <Link
                href="/reset-password"
                className="text-gray-400 hover:text-gray-300"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
