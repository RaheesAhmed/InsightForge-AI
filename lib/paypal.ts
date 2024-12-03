import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const PAYPAL_CLIENT_ID =
  "Acar9M8VnF7LN0pdMUVqIGdklZBLMcZpGat7ZkXy4WcBm3szNqWGKpwVZHYTekJDWsTIi07gLTYb_JRM";
const PAYPAL_SECRET_KEY =
  "EPaLKruwlKgiDNJPzq6Qjuqb34aQLcitCv7zwiMpHfNClNvSDIv93x2D63_nSrL2Xy9jb6MDe4pUWPqQ";

export const paypalConfig = {
  clientId: PAYPAL_CLIENT_ID,
  currency: "USD",
  intent: "subscription",
};

export const createSubscriptionPlan = async (planData: {
  name: string;
  description: string;
  price: number;
  interval: "MONTH" | "YEAR";
}) => {
  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v1/billing/plans",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          product_id: await getOrCreateProduct(),
          name: planData.name,
          description: planData.description,
          status: "ACTIVE",
          billing_cycles: [
            {
              frequency: {
                interval_unit: planData.interval,
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
        }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    throw error;
  }
};

export const getPayPalAccessToken = async () => {
  try {
    const auth = Buffer.from(
      `${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`
    ).toString("base64");
    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
        },
        body: "grant_type=client_credentials",
      }
    );

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting PayPal access token:", error);
    throw error;
  }
};

export const getOrCreateProduct = async () => {
  try {
    const accessToken = await getPayPalAccessToken();

    // First try to get existing product
    const productsResponse = await fetch(
      "https://api-m.sandbox.paypal.com/v1/catalogs/products",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const products = await productsResponse.json();

    if (products.products && products.products.length > 0) {
      return products.products[0].id;
    }

    // If no product exists, create one
    const createResponse = await fetch(
      "https://api-m.sandbox.paypal.com/v1/catalogs/products",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: "HealthAI Subscription",
          type: "SERVICE",
          description: "HealthAI Subscription Service",
        }),
      }
    );

    const newProduct = await createResponse.json();
    return newProduct.id;
  } catch (error) {
    console.error("Error managing PayPal product:", error);
    throw error;
  }
};

export const cancelSubscription = async (subscriptionId: string) => {
  try {
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
          reason: "Cancelled by user",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to cancel subscription");
    }

    return true;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
};

export const getSubscriptionDetails = async (subscriptionId: string) => {
  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(
      `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting subscription details:", error);
    throw error;
  }
};

export const updateSubscription = async (
  subscriptionId: string,
  planId: string
) => {
  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(
      `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}/revise`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          plan_id: planId,
        }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
};

export const createWebhookEndpoint = async (url: string) => {
  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v1/notifications/webhooks",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          url,
          event_types: [
            { name: "BILLING.SUBSCRIPTION.CREATED" },
            { name: "BILLING.SUBSCRIPTION.CANCELLED" },
            { name: "BILLING.SUBSCRIPTION.SUSPENDED" },
            { name: "BILLING.SUBSCRIPTION.PAYMENT.FAILED" },
            { name: "BILLING.SUBSCRIPTION.UPDATED" },
          ],
        }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating webhook endpoint:", error);
    throw error;
  }
};
