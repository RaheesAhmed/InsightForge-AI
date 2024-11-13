import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-10-28.acacia",
});

const ADMIN_USER_IDS = ["user_2NNEqL2nrXwHBP4TCGx6nGxfXPX"]; // Replace with your admin user IDs

// Helper to check if user is admin
const isAdmin = (userId: string | null) => {
  return ADMIN_USER_IDS.includes(userId || "");
};

export async function GET() {
  const { userId } = auth();

  if (!isAdmin(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await stripe.products.list({
    expand: ["data.default_price"],
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const { userId } = auth();

  if (!isAdmin(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      name,
      description,
      price,
      interval = "month",
    } = await request.json();

    // Create product
    const product = await stripe.products.create({
      name,
      description,
    });

    // Create price for the product
    const productPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(price * 100), // Convert to cents
      currency: "usd",
      recurring: {
        interval,
      },
    });

    return NextResponse.json({ product, price: productPrice });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
