import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { getJwtSecretKey } from "@/lib/jwt";

// Admin credentials - in production, use environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@virtuhelp.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin@123@";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Verify admin credentials
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate admin token with explicit timestamps
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 24 * 60 * 60; // 24 hours from now

    const token = await new SignJWT({ 
      isAdmin: true,
      email: ADMIN_EMAIL,
      iat,
      exp 
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt(iat)
      .setExpirationTime(exp)
      .sign(getJwtSecretKey());

    // Set admin token in cookie with secure settings
    const cookieStore = cookies();
    cookieStore.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return NextResponse.json({ 
      success: true,
      token,
      user: {
        email: ADMIN_EMAIL,
        isAdmin: true
      }
    });
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

// Verify admin session
export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token" },
        { status: 401 }
      );
    }

    // Verify the token
    const verified = await new SignJWT({}).verify(token, getJwtSecretKey());
    
    if (!verified || !verified.payload.isAdmin) {
      return NextResponse.json(
        { error: "Invalid admin token" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        email: ADMIN_EMAIL,
        isAdmin: true
      }
    });
  } catch (error) {
    console.error("Admin session error:", error);
    return NextResponse.json(
      { error: "Session validation failed" },
      { status: 401 }
    );
  }
}
