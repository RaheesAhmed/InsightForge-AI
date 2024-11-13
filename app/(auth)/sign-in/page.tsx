"use client";

import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();

  const handleAfterSignIn = async (data: any) => {
    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: data.createdUserId || data.userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Login sync failed");
      }

      router.push("/chat");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-md w-full p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to continue to your account</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-indigo-600 hover:bg-indigo-700 text-sm normal-case",
              },
            }}
            afterSignInUrl="/chat"
            afterSignIn={handleAfterSignIn}
          />
        </div>
      </div>
    </div>
  );
}
