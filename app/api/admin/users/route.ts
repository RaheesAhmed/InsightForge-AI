import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Get auth token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify token and check admin role
    const payload = await verifyJWT(token);
    if (!payload || payload.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Fetch all users with their details
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            questionsUsed: true,
            documentsLimit: true,
            validUntil: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format user data for response
    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionPlan: user.subscription?.plan || "FREE",
      subscriptionStatus: user.subscription?.status || "INACTIVE",
      questionsUsed: user.subscription?.questionsUsed || 0,
      documentsUploaded: user.subscription?.documentsLimit || 0,
      createdAt: user.createdAt,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("[ADMIN_USERS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Get auth token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify token and check admin role
    const payload = await verifyJWT(token);
    if (!payload || payload.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { action, targetUserId, data } = body;

    switch (action) {
      case "update":
        const updatedUser = await prisma.user.update({
          where: { id: targetUserId },
          data: {
            ...data,
            updatedAt: new Date(),
          },
        });
        return NextResponse.json(updatedUser);

      case "delete":
        await prisma.user.delete({
          where: { id: targetUserId },
        });
        return new NextResponse("User deleted", { status: 200 });

      default:
        return new NextResponse("Invalid action", { status: 400 });
    }
  } catch (error) {
    console.error("[ADMIN_USERS_ACTION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
