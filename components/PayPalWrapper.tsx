"use client";

import {
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { paypalConfig } from "@/lib/paypal";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface PayPalWrapperProps {
  children: ReactNode;
}

function PayPalScriptWrapper({ children }: { children: ReactNode }) {
  const [{ isPending }] = usePayPalScriptReducer();

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function PayPalWrapper({ children }: PayPalWrapperProps) {
  // Verify PayPal configuration
  if (!paypalConfig.clientId) {
    console.error("PayPal client ID is not configured");
    return <div>Error: PayPal is not properly configured</div>;
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: paypalConfig["client-id"],
        currency: paypalConfig.currency,
        intent: paypalConfig.intent,
        vault: paypalConfig.vault,
        components: paypalConfig.components,
      }}
    >
      <PayPalScriptWrapper>{children}</PayPalScriptWrapper>
    </PayPalScriptProvider>
  );
}
