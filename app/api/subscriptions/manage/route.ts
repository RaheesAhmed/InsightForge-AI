import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { getPayPalAccessToken } from "@/lib/paypal";

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's current subscription
    const subscription = await db.subscription.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        plan: true,
        documentsLimit: true,
        questionsLimit: true,
        documentsUsed: true,
        questionsUsed: true,
        validUntil: true,
        status: true,
      },
    });

    if (!subscription) {
      // Return free plan details if no subscription exists
      return NextResponse.json({
        plan: "Free",
        documentsLimit: 3,
        questionsLimit: 20,
        documentsUsed: 0,
        questionsUsed: 0,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: "ACTIVE",
        planId: null,
      });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("[SUBSCRIPTION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    const { subscriptionId, plan } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!subscriptionId || !plan) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Set plan limits based on the selected plan
    const planLimits: Record<
      string,
      { documentsLimit: number; questionsLimit: number }
    > = {
      Free: {
        documentsLimit: 3,
        questionsLimit: 20,
      },
      Professional: {
        documentsLimit: 25,
        questionsLimit: 100,
      },
      Enterprise: {
        documentsLimit: -1, // Unlimited
        questionsLimit: -1, // Unlimited
      },
    };

    if (!(plan in planLimits)) {
      return new NextResponse("Invalid plan", { status: 400 });
    }

    // Verify subscription with PayPal
    try {
      const accessToken = await getPayPalAccessToken();
      const response = await fetch(
        `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("[PAYPAL_VERIFICATION]", await response.text());
        return new NextResponse("Failed to verify subscription with PayPal", {
          status: 400,
        });
      }

      const paypalSubscription = await response.json();

      // Map PayPal status to our status
      const statusMap: Record<
        string,
        "ACTIVE" | "CANCELLED" | "SUSPENDED" | "PAYMENT_FAILED"
      > = {
        ACTIVE: "ACTIVE",
        CANCELLED: "CANCELLED",
        SUSPENDED: "SUSPENDED",
        APPROVAL_PENDING: "PAYMENT_FAILED",
        APPROVED: "ACTIVE",
        EXPIRED: "CANCELLED",
      };

      const status = statusMap[paypalSubscription.status] || "PAYMENT_FAILED";

      // Update or create subscription in database
      const updatedSubscription = await db.subscription.upsert({
        where: {
          userId,
        },
        update: {
          plan,
          subscriptionId,
          documentsLimit: planLimits[plan].documentsLimit,
          questionsLimit: planLimits[plan].questionsLimit,
          validUntil: new Date(
            paypalSubscription.billing_info.next_billing_time
          ),
          status,
        },
        create: {
          userId,
          plan,
          subscriptionId,
          documentsLimit: planLimits[plan].documentsLimit,
          questionsLimit: planLimits[plan].questionsLimit,
          documentsUsed: 0,
          questionsUsed: 0,
          validUntil: new Date(
            paypalSubscription.billing_info.next_billing_time
          ),
          status,
        },
      });

      return NextResponse.json(updatedSubscription);
    } catch (error) {
      console.error("[PAYPAL_ERROR]", error);
      return new NextResponse("PayPal verification failed", { status: 500 });
    }
  } catch (error) {
    console.error("[SUBSCRIPTION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
