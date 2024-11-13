// app/layout.tsx
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import AuthenticatedComponent from "@/components/AuthenticatedComponent";
import NavBar from "@/components/NavBar";
import { Toaster } from "sonner";

export default function RootLayout({ children }: any) {
  return (
    <html lang="en">
      {" "}
      {/* Ensure you have the <html> tag with the appropriate attributes */}
      <body>
        {" "}
        {/* Ensure you have the <body> tag */}
        <ClerkProvider>
          <div>
            {" "}
            {/* Wrapper div for your content */}
            <main>
              {/* <AuthenticatedComponent> */}
              {children}
              {/* </AuthenticatedComponent> */}
            </main>
          </div>
        </ClerkProvider>
        <Toaster />
      </body>
    </html>
  );
}
