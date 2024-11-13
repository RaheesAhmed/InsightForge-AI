"use client";

import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  const handleAfterSignUp = async (data: any) => {
    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: data.createdUserId,
          email_addresses: data.emailAddresses,
          username: data.username,
          first_name: data.firstName,
          last_name: data.lastName,
        }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      router.push("/chat");
    } catch (error) {
      console.error("Registration error:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-md w-full p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-400">Get started with your free account</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-indigo-600 hover:bg-indigo-700 text-sm normal-case",
              },
            }}
            afterSignUpUrl="/chat"
            afterSignUp={handleAfterSignUp}
          />
        </div>
      </div>
    </div>
  );
}
