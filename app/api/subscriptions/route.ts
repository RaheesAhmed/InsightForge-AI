import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: "2024-10-28.acacia",
});

// Get subscription plans
export async function GET() {
  try {
    const [products, prices] = await Promise.all([
      stripe.products.list({
        active: true,
        expand: ["data.default_price"],
      }),
      stripe.prices.list({
        active: true,
        type: "recurring",
      }),
    ]);

    return NextResponse.json({
      products: products.data,
      prices: prices.data,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// Create/Update subscription
export async function POST(request: Request) {
  try {
    // Get the auth token from cookies
    const token = cookies().get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the JWT token
    const payload = await verifyJWT(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { planId } = await request.json();

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Handle free plan subscription
    if (planId === "FREE") {
      const subscription = await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {
          plan: "FREE",
          documentsLimit: 3,
          questionsLimit: 20,
          status: "ACTIVE",
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        create: {
          userId: user.id,
          plan: "FREE",
          documentsLimit: 3,
          questionsLimit: 20,
          status: "ACTIVE",
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      return NextResponse.json({ success: true, subscription });
    }

    // Get the product from Stripe
    const product = await stripe.products.retrieve(planId);
    if (!product) {
      return NextResponse.json(
        { error: "Invalid product selected" },
        { status: 400 }
      );
    }

    // Get the price for the product
    const price = await stripe.prices.retrieve(product.default_price as string);
    if (!price) {
      return NextResponse.json(
        { error: "No price found for this product" },
        { status: 400 }
      );
    }

    // Create or get Stripe customer
    let stripeCustomerId = user.subscription?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Update user's stripe customer ID
      await prisma.subscription.update({
        where: { userId: user.id },
        data: { stripeCustomerId },
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXTAUTH_URL}/chat?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/chat?canceled=true`,
      metadata: {
        userId: user.id,
        planId: planId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const token = cookies().get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: payload.userId },
      select: { stripeCustomerId: true },
    });

    if (subscription?.stripeCustomerId) {
      // Cancel the subscription in Stripe
      const stripeSubscriptions = await stripe.subscriptions.list({
        customer: subscription.stripeCustomerId,
      });

      // Cancel all active subscriptions for this customer
      for (const sub of stripeSubscriptions.data) {
        if (sub.status === "active") {
          await stripe.subscriptions.update(sub.id, {
            cancel_at_period_end: true,
          });
        }
      }
    }

    // Update subscription in database to FREE plan at the end of the period
    await prisma.subscription.update({
      where: { userId: payload.userId },
      data: {
        status: "CANCELING",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
