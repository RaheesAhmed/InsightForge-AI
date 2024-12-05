import { ReactPayPalScriptOptions } from "@paypal/react-paypal-js";

export interface PlanData {
  name: string;
  description: string;
  price: number;
  interval?: "MONTH" | "YEAR";
  documentsLimit?: number;
  questionsLimit?: number;
}

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

if (!PAYPAL_CLIENT_ID) {
  throw new Error(
    "NEXT_PUBLIC_PAYPAL_CLIENT_ID is not defined in environment variables"
  );
}

export const paypalConfig: ReactPayPalScriptOptions = {
  "client-id": PAYPAL_CLIENT_ID,
  currency: "USD",
  intent: "subscription",
  vault: true,
  components: "buttons",
};

export async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET_KEY;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are not configured");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(
    "https://api-m.sandbox.paypal.com/v1/oauth2/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get PayPal access token");
  }

  const data = await response.json();
  return data.access_token;
}

export async function activateSubscription(subscriptionId: string) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}/activate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to activate subscription");
  }

  return response.json();
}

export async function cancelSubscription(subscriptionId: string) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        reason: "Requested by customer",
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to cancel subscription");
  }

  return true;
}
