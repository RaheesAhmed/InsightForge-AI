import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      id,
      email_addresses,
      username,
      first_name,
      last_name,
      theme_preference,
    } = await req.json();

    // Basic validation
    if (!id || !email_addresses || !email_addresses.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Verify the user exists in Clerk
    const clerkUser = await clerkClient.users.getUser(id);
    if (!clerkUser) {
      return NextResponse.json(
        { error: "User not found in Clerk" },
        { status: 404 }
      );
    }

    // Create user with theme preferences
    const user = await prisma.user.create({
      data: {
        id: id,
        email: email_addresses[0].email_address,
        name: `${first_name || ""} ${last_name || ""}`.trim() || username || "",
        theme_preferences: theme_preference
          ? JSON.stringify(theme_preference)
          : null,
        subscription: {
          create: {
            plan: "FREE",
            status: "ACTIVE",
            documentsLimit: 3,
            questionsLimit: 20,
            questionsUsed: 0,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      include: {
        subscription: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
