import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Plan, Status } from "@prisma/client";
import { PLAN_LIMITS } from "@/lib/subscription";

// Map PayPal plan IDs to our Plan enum
const PLAN_MAP = {
  [process.env.NEXT_PUBLIC_PAYPAL_BASIC_PLAN_ID!]: Plan.BASIC,
  [process.env.NEXT_PUBLIC_PAYPAL_PREMIUM_PLAN_ID!]: Plan.PREMIUM,
  [process.env.NEXT_PUBLIC_PAYPAL_ENTERPRISE_PLAN_ID!]: Plan.ENTERPRISE,
};

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const eventType = payload.event_type;
    const resource = payload.resource;

    console.log("Received PayPal webhook:", eventType);

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
  const plan = PLAN_MAP[planId] || Plan.FREE;

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      paypalSubscriptionId: subscriptionId,
      plan,
      status: Status.ACTIVE,
      documentsLimit: PLAN_LIMITS[plan].documentsLimit,
      questionsLimit: PLAN_LIMITS[plan].questionsLimit,
      validUntil: new Date(resource.billing_info.next_billing_time),
    },
    update: {
      paypalSubscriptionId: subscriptionId,
      plan,
      status: Status.ACTIVE,
      documentsLimit: PLAN_LIMITS[plan].documentsLimit,
      questionsLimit: PLAN_LIMITS[plan].questionsLimit,
      validUntil: new Date(resource.billing_info.next_billing_time),
    },
  });
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
        plan: Plan.FREE,
        documentsLimit: PLAN_LIMITS.FREE.documentsLimit,
        questionsLimit: PLAN_LIMITS.FREE.questionsLimit,
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

    // Create failed payment record
    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: parseFloat(resource.amount.value),
        currency: resource.amount.currency_code,
        status: "FAILED",
        paypalOrderId: resource.id,
      },
    });
  }
}

async function handleSubscriptionUpdated(resource: any) {
  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: resource.id },
  });

  if (subscription) {
    const plan = PLAN_MAP[resource.plan_id] || subscription.plan;

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        plan,
        documentsLimit: PLAN_LIMITS[plan].documentsLimit,
        questionsLimit: PLAN_LIMITS[plan].questionsLimit,
        validUntil: new Date(resource.billing_info.next_billing_time),
      },
    });
  }
}
