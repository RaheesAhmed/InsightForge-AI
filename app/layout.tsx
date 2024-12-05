// app/layout.tsx
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import AuthenticatedComponent from "@/components/AuthenticatedComponent";
import NavBar from "@/components/NavBar";
import { Toaster } from "sonner";
import dynamic from "next/dynamic";

// Create a client-side only wrapper for PayPal
const PayPalWrapper = dynamic(() => import("@/components/PayPalWrapper"), {
  ssr: false,
});

export default function RootLayout({ children }: any) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <PayPalWrapper>
            <div>
              <main>
                {/* <NavBar /> */}
                {/* <AuthenticatedComponent> */}
                {children}
                {/* </AuthenticatedComponent> */}
              </main>
            </div>
          </PayPalWrapper>
        </ClerkProvider>
        <Toaster />
      </body>
    </html>
  );
}
