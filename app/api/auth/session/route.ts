import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt"; // Make sure you have this utility

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate your JWT token and get user data
    const token = verifyJWT(userId);
    const user = {
      id: userId,
      // Add other user properties as needed
    };

    return NextResponse.json({ token, user });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
