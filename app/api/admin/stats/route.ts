import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Verify admin authentication
    const token = cookies().get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get statistics
    const [totalUsers, subscriptionStats, questionsStats, documentsStats] =
      await Promise.all([
        prisma.user.count(),
        prisma.subscription.groupBy({
          by: ["plan"],
          _count: true,
        }),
        prisma.question.aggregate({
          _count: true,
        }),
        prisma.document.aggregate({
          _count: true,
        }),
      ]);

    // Calculate subscription distribution
    const subscriptionDistribution = subscriptionStats.reduce((acc, curr) => {
      acc[curr.plan] = curr._count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      users: {
        total: totalUsers,
      },
      subscriptions: subscriptionDistribution,
      activity: {
        totalQuestions: questionsStats._count,
        totalDocuments: documentsStats._count,
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
