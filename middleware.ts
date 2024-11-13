import { clerkMiddleware, auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Clerk admin user ID
const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(",") || [];

export default clerkMiddleware((auth, req) => {
  // Check if the request is for the admin route
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const userId = auth().userId;

    // If user is not logged in or not an admin, redirect to home
    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
