import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getJwtSecretKey } from "@/lib/jwt";

// Verify admin authentication middleware
async function verifyAdmin() {
  try {
    const cookieStore = cookies();
    const adminToken = cookieStore.get("admin-token")?.value;

    if (!adminToken) {
      return false;
    }

    const { payload } = await jwtVerify(
      adminToken,
      getJwtSecretKey()
    );
    
    return payload?.isAdmin === true;
  } catch (error) {
    console.error("Admin verification error:", error);
    return false;
  }
}

// GET all users with their details
export async function GET() {
  try {
    // Verify admin authentication
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin authentication required" },
        { status: 401 }
      );
    }

    // Fetch users with their details
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        createdAt: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            validUntil: true,
            documentsLimit: true,
            questionsLimit: true,
            questionsUsed: true,
            documentsUsed: true
          }
        },
        _count: {
          select: {
            questions: true,
            documents: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Format user data for response
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      subscription: user.subscription ? {
        plan: user.subscription.plan,
        status: user.subscription.status,
        validUntil: user.subscription.validUntil,
        documentsPerMonth: user.subscription.documentsLimit,
        questionsPerMonth: user.subscription.questionsLimit,
        questionsUsed: user.subscription.questionsUsed,
        documentsUsed: user.subscription.documentsUsed
      } : null,
      stats: {
        questions: user._count.questions,
        documents: user._count.documents,
      },
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// DELETE a user
export async function DELETE(request: Request) {
  try {
    // Verify admin authentication
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin authentication required" },
        { status: 401 }
      );
    }

    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Delete user and related data
    await prisma.$transaction([
      // Delete user's questions
      prisma.question.deleteMany({
        where: { userId },
      }),
      // Delete user's documents
      prisma.document.deleteMany({
        where: { userId },
      }),
      // Delete user's subscription
      prisma.subscription.deleteMany({
        where: { userId },
      }),
      // Finally, delete the user
      prisma.user.delete({
        where: { id: userId },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
