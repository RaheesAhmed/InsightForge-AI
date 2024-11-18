import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getJwtSecretKey } from "./lib/jwt";
import type { NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

// Admin routes that require authentication
const ADMIN_PROTECTED_ROUTES = [
  "/admin/dashboard",
  "/admin/stats",
  "/admin/users",
  "/admin/settings",
];

// Admin API routes that require authentication
const ADMIN_PROTECTED_API_ROUTES = [
  "/api/admin/stats",
  "/api/admin/reset-password",
];

async function handleAdminRoutes(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to admin login page and auth API
  if (pathname === "/admin" || pathname === "/api/admin/auth") {
    return NextResponse.next();
  }

  // Check if the route requires admin authentication
  const isProtectedRoute = ADMIN_PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  ) || ADMIN_PROTECTED_API_ROUTES.some(route => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  try {
    const adminToken = request.cookies.get("admin-token")?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    const { payload } = await jwtVerify(adminToken, getJwtSecretKey());
    
    if (!payload.isAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Admin authentication error:", error);
    return NextResponse.redirect(new URL("/admin", request.url));
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle admin routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    return handleAdminRoutes(request);
  }

  // Use Clerk middleware for other routes
  return clerkMiddleware()(request);
}

export const config = {
  matcher: [
    "/api/:path*", 
    "/chat/:path*",
    "/admin/:path*",
  ],
};
