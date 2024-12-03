import { NextResponse } from "next/server";
import { getPayPalAccessToken } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";
import { Plan, Status } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const eventType = payload.event_type;
    const resource = payload.resource;

    // Verify webhook signature
    const accessToken = await getPayPalAccessToken();
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    // Handle different webhook events
    switch (eventType) {
      case "BILLING.SUBSCRIPTION.CREATED":
        await handleSubscriptionCreated(resource);
        break;
      case "BILLING.SUBSCRIPTION.CANCELLED":
        await handleSubscriptionCancelled(resource);
        break;
      case "BILLING.SUBSCRIPTION.SUSPENDED":
        await handleSubscriptionSuspended(resource);
        break;
      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
        await handlePaymentFailed(resource);
        break;
      case "BILLING.SUBSCRIPTION.UPDATED":
        await handleSubscriptionUpdated(resource);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(resource: any) {
  const userId = resource.custom_id;
  const subscriptionId = resource.id;
  const planId = resource.plan_id;

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      paypalSubscriptionId: subscriptionId,
      plan: getPlanFromPayPalPlanId(planId),
      status: Status.ACTIVE,
      validUntil: new Date(resource.billing_info.next_billing_time),
    },
    update: {
      paypalSubscriptionId: subscriptionId,
      plan: getPlanFromPayPalPlanId(planId),
      status: Status.ACTIVE,
      validUntil: new Date(resource.billing_info.next_billing_time),
    },
  });
}

// Helper function to convert PayPal plan ID to our Plan enum
function getPlanFromPayPalPlanId(planId: string): Plan {
  // You'll need to map your PayPal plan IDs to your Plan enum values
  const planMap: Record<string, Plan> = {
    BASIC_PLAN_ID: Plan.BASIC,
    PREMIUM_PLAN_ID: Plan.PREMIUM,
    ENTERPRISE_PLAN_ID: Plan.ENTERPRISE,
  };
  return planMap[planId] || Plan.FREE;
}

async function handleSubscriptionCancelled(resource: any) {
  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: resource.id },
  });

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: Status.CANCELLED,
        validUntil: new Date(),
      },
    });
  }
}

async function handleSubscriptionSuspended(resource: any) {
  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: resource.id },
  });

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: Status.SUSPENDED,
      },
    });
  }
}

async function handlePaymentFailed(resource: any) {
  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: resource.id },
  });

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: Status.PAYMENT_FAILED,
      },
    });

    // You might want to send an email to the user here
  }
}

async function handleSubscriptionUpdated(resource: any) {
  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: resource.id },
  });

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        planId: resource.plan_id,
        validUntil: new Date(resource.billing_info.next_billing_time),
      },
    });
  }
}
