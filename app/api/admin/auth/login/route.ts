import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createToken, verifyToken } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Verify admin credentials
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate admin token using our centralized JWT utility
    const token = await createToken({
      email,
      role: "ADMIN",
    });

    // Create response with token included
    const response = NextResponse.json({
      success: true,
      message: "Admin logged in successfully",
      token, // Include token in response for client-side storage
    });

    // Set cookie with response
    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Verify admin token middleware using our centralized JWT utility
export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const payload = await verifyToken(token);
    return payload?.role === "ADMIN";
  } catch {
    return false;
  }
}
