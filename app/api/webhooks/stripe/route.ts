import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-10-28.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      return NextResponse.json(
        { error: `Webhook signature verification failed` },
        { status: 400 }
      );
    }

    const session = event.data.object as Stripe.Checkout.Session;

    switch (event.type) {
      case "checkout.session.completed":
        // Update user's subscription in Clerk and database
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;

        if (userId && planId) {
          // Update Clerk metadata
          await clerkClient.users.updateUser(userId, {
            privateMetadata: {
              subscription: {
                planId,
                stripeCustomerId: session.customer as string,
                currentPeriodStart: Date.now(),
                currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
              },
            },
          });

          // Update database
          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              plan: planId.toUpperCase(),
              status: "ACTIVE",
              stripeCustomerId: session.customer as string,
              documentsLimit:
                planId === "premium" ? -1 : planId === "basic" ? 5 : 1,
              questionsLimit:
                planId === "premium" ? -1 : planId === "basic" ? 10 : 3,
              validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
            update: {
              plan: planId.toUpperCase(),
              status: "ACTIVE",
              stripeCustomerId: session.customer as string,
              documentsLimit:
                planId === "premium" ? -1 : planId === "basic" ? 5 : 1,
              questionsLimit:
                planId === "premium" ? -1 : planId === "basic" ? 10 : 3,
              validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
        }
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
