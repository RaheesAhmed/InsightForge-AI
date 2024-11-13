import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    // Verify the user exists in Clerk
    const clerkUser = await clerkClient.users.getUser(id);
    if (!clerkUser) {
      return NextResponse.json(
        { error: "User not found in Clerk" },
        { status: 404 }
      );
    }

    // Find or create user in our database
    const user = await prisma.user.upsert({
      where: { id },
      update: {}, // No updates needed on login
      create: {
        id,
        email: clerkUser.emailAddresses[0].emailAddress,
        name:
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          clerkUser.username ||
          "",
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
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to process login" },
      { status: 500 }
    );
  }
}
