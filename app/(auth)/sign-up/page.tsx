"use client";

import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
          theme_preference: {
            primary: "#2563EB",
            hover: "#1D4ED8",
            gradient_start: "#EFF6FF",
            gradient_end: "#E0E7FF",
            text: "#4B5563",
            headings: "#1F2937",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      router.push("/chat");
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="max-w-md w-full ">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Logo"
              width={60}
              height={60}
              className="rounded-xl"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">Get started with your free account</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-300">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
                card: "shadow-none",
                headerTitle: "text-gray-800 text-xl",
                headerSubtitle: "text-gray-600",
                formFieldLabel: "text-gray-700",
                formFieldInput:
                  "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
                footerActionLink: "text-blue-600 hover:text-blue-700",
                dividerLine: "bg-gray-200",
                dividerText: "text-gray-500",
                socialButtonsBlockButton: "border-gray-300 hover:bg-gray-50",
                socialButtonsBlockButtonText: "text-gray-600",
              },
            }}
            fallbackRedirectUrl="/chat"
            afterSignUpUrl="/chat"
          />
        </div>
      </div>
    </div>
  );
}
