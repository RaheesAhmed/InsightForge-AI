import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken } from "./app/api/admin/auth/login/route";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for login endpoint
  if (pathname === "/api/admin/auth/login") {
    return NextResponse.next();
  }

  // Skip auth check for login page
  if (pathname === "/admin/login" || pathname === "/admin-login") {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get("admin-token")?.value;

  // For API routes, return 401 instead of redirecting
  if (pathname.startsWith("/api/admin/")) {
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // We can't await here, so we'll let the API route handle the verification
    return NextResponse.next();
  }

  // For admin pages, redirect to login if not authenticated
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
