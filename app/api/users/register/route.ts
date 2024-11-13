import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signJWT } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, username, firstName, lastName } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword: await bcrypt.hash(password, 10),
        name:
          [firstName, lastName].filter(Boolean).join(" ").trim() ||
          username ||
          "",
        username,
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
      select: {
        id: true,
        email: true,
        name: true,

        role: true,
        subscription: true,
      },
    });

    // Generate JWT token
    const token = signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,

        role: user.role,
      },
      token,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
