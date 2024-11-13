import { clerkClient, auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { SubscriptionPlan } from "@/types/subscription";
import Stripe from "stripe";

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: "2024-10-28.acacia",
});

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    tier: "free",
    price: 0,
    documentsPerMonth: 1,
    questionsPerDocument: 3,
    features: ["Basic document analysis", "Limited questions"],
    stripePriceId: null,
  },
  {
    id: "basic",
    name: "Basic",
    tier: "basic",
    price: 9.99,
    documentsPerMonth: 5,
    questionsPerDocument: 10,
    features: [
      "Advanced document analysis",
      "More questions per document",
      "Priority support",
    ],
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
  },
  {
    id: "premium",
    name: "Premium",
    tier: "premium",
    price: 29.99,
    documentsPerMonth: -1,
    questionsPerDocument: -1,
    features: [
      "Unlimited documents",
      "Unlimited questions",
      "Premium support",
      "Custom features",
    ],
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? null,
  },
];

// Get subscription plans
export async function GET() {
  try {
    const products = await stripe.products.list({
      active: true,
      expand: ["data.default_price"],
    });

    const prices = await stripe.prices.list({
      active: true,
      type: "recurring",
    });

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

// Update user's subscription
export async function POST(request: Request) {
  try {
    const { userId, planId } = await request.json();

    // Verify the user exists and has permission
    const { userId: authenticatedUserId } = auth();
    const user = await clerkClient.users.getUser(userId);

    if (!authenticatedUserId || authenticatedUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
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
      customer_email: user.emailAddresses[0].emailAddress,
      metadata: {
        userId: userId,
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
