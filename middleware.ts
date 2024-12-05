import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only run middleware on admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin-token")?.value;

  // If trying to access login page
  if (pathname === "/admin/login") {
    // If already authenticated, redirect to admin dashboard
    if (token) {
      try {
        const payload = await verifyToken(token);
        if (payload?.isAdmin) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      } catch (error) {
        // Token is invalid, allow access to login page
      }
    }
    return NextResponse.next();
  }

  // For all other admin routes, require authentication
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    const payload = await verifyToken(token);
    if (!payload?.isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

// Configure the paths that should be protected by the middleware
export const config = {
  matcher: ["/admin/:path*"],
};
