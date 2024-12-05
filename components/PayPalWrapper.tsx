"use client";

import {
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { paypalConfig } from "@/lib/paypal";
import { ReactNode, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface PayPalWrapperProps {
  children: ReactNode;
}

function PayPalScriptWrapper({ children }: { children: ReactNode }) {
  const [{ isPending, isRejected, isInitial }, dispatch] =
    usePayPalScriptReducer();

  useEffect(() => {
    console.log("PayPal Script State:", { isPending, isRejected, isInitial });
  }, [isPending, isRejected, isInitial]);

  if (isPending || isInitial) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isRejected) {
    console.error("PayPal script loading failed");
    return (
      <div className="text-center text-red-500 p-4">
        Failed to load PayPal. Please refresh the page or try again later.
      </div>
    );
  }

  return <>{children}</>;
}

export default function PayPalWrapper({ children }: PayPalWrapperProps) {
  useEffect(() => {
    console.log("PayPal Config:", paypalConfig);
  }, []);

  if (!paypalConfig["client-id"]) {
    console.error("PayPal client ID is not configured");
    return <div>Payment system is not properly configured</div>;
  }

  return (
    <PayPalScriptProvider options={paypalConfig} deferLoading={false}>
      <PayPalScriptWrapper>{children}</PayPalScriptWrapper>
    </PayPalScriptProvider>
  );
}
