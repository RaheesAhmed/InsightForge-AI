import { PayPalScriptOptions } from "@paypal/react-paypal-js";

export interface PlanData {
  name: string;
  description: string;
  price: number;
  interval?: "MONTH" | "YEAR";
  documentsLimit?: number;
  questionsLimit?: number;
}

if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
  throw new Error("NEXT_PUBLIC_PAYPAL_CLIENT_ID is not defined");
}

export const paypalConfig: PayPalScriptOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
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

export async function createSubscriptionPlan(planData: PlanData) {
  const accessToken = await getPayPalAccessToken();

  // Create product first
  const productResponse = await fetch(
    "https://api-m.sandbox.paypal.com/v1/catalogs/products",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: planData.name,
        description: planData.description,
        type: "SERVICE",
      }),
    }
  );

  const product = await productResponse.json();

  // Then create billing plan
  const planResponse = await fetch(
    "https://api-m.sandbox.paypal.com/v1/billing/plans",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        product_id: product.id,
        name: planData.name,
        description: planData.description,
        status: "ACTIVE",
        billing_cycles: [
          {
            frequency: {
              interval_unit: planData.interval || "MONTH",
              interval_count: 1,
            },
            tenure_type: "REGULAR",
            sequence: 1,
            total_cycles: 0,
            pricing_scheme: {
              fixed_price: {
                value: planData.price.toString(),
                currency_code: "USD",
              },
            },
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee: {
            value: "0",
            currency_code: "USD",
          },
          setup_fee_failure_action: "CONTINUE",
          payment_failure_threshold: 3,
        },
        taxes: {
          percentage: "0",
          inclusive: false,
        },
      }),
    }
  );

  return planResponse.json();
}

export async function getSubscriptionDetails(subscriptionId: string) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.json();
}

export async function cancelSubscription(
  subscriptionId: string,
  reason?: string
) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        reason: reason || "Customer requested cancellation",
      }),
    }
  );

  return response.status === 204;
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
