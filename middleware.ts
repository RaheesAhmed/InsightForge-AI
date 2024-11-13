import { NextResponse } from "next/server";
import { verifyJWT } from "./lib/jwt";
import type { NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

interface JWTPayload {
  userId: string;
  email: string;
  name?: string;
  role?: string;
}

const middleware = clerkMiddleware();

export default middleware;

export const config = {
  matcher: ["/api/:path*", "/chat/:path*"],
};
