import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getJwtSecretKey } from "@/lib/jwt";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const planPrices = {
  FREE: 0,
  BASIC: 9.99,
  PREMIUM: 19.99,
  ENTERPRISE: 49.99,
} as const;

interface AdminStats {
  users: { 
    total: number 
  };
  subscriptions: Record<string, number>;
  activity: {
    totalQuestions: number;
    totalDocuments: number;
  };
  subscriptionDetails: {
    userId: string;
    email: string;
    plan: string;
    questionsUsed: number;
    documentsUsed: number;
    validUntil: string;
    status: string;
  }[];
  usageMetrics: {
    plan: string;
    avgQuestionsPerUser: number;
    avgDocumentsPerUser: number;
    totalRevenue: number;
  }[];
}

export async function GET() {
  try {
    // Verify admin token
    const cookieStore = cookies();
    const adminToken = cookieStore.get("admin-token")?.value;

    if (!adminToken) {
      return NextResponse.json(
        { error: "Admin authentication required" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(adminToken, getJwtSecretKey());
    if (!payload.isAdmin) {
      return NextResponse.json(
        { error: "Admin authentication required" },
        { status: 401 }
      );
    }

    // Get statistics
    const [
      totalUsers,
      subscriptionStats,
      activeSubscriptions,
      questionsStats,
      documentsStats
    ] = await Promise.all([
      // Total user count
      prisma.user.count(),
      
      // Subscription grouping by plan
      prisma.subscription.groupBy({
        by: ["plan"],
        _count: true,
        where: {
          status: "ACTIVE"
        }
      }),

      // Detailed subscription info with user data
      prisma.subscription.findMany({
        where: {
          status: "ACTIVE"
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              _count: {
                select: {
                  questions: true,
                  documents: true
                }
              }
            }
          }
        },
        orderBy: {
          validUntil: 'desc'
        }
      }),

      // Question aggregates
      prisma.question.count(),

      // Document aggregates
      prisma.document.count()
    ]);

    // Calculate subscription distribution
    const subscriptionDistribution = subscriptionStats.reduce((acc, curr) => {
      acc[curr.plan] = curr._count;
      return acc;
    }, {} as Record<string, number>);

    // Process subscription details
    const subscriptionDetails = activeSubscriptions.map(sub => ({
      userId: sub.user.id,
      email: sub.user.email,
      plan: sub.plan,
      questionsUsed: sub.user._count.questions,
      documentsUsed: sub.user._count.documents,
      validUntil: sub.validUntil.toISOString(),
      status: sub.status
    }));

    // Calculate usage metrics per plan
    const usageMetricsByPlan = new Map<string, {
      users: number;
      questions: number;
      documents: number;
    }>();

    activeSubscriptions.forEach(sub => {
      const plan = sub.plan;
      const current = usageMetricsByPlan.get(plan) || { users: 0, questions: 0, documents: 0 };
      usageMetricsByPlan.set(plan, {
        users: current.users + 1,
        questions: current.questions + sub.user._count.questions,
        documents: current.documents + sub.user._count.documents
      });
    });

    const usageMetrics = Array.from(usageMetricsByPlan.entries()).map(([plan, metrics]) => ({
      plan,
      avgQuestionsPerUser: metrics.users > 0 ? metrics.questions / metrics.users : 0,
      avgDocumentsPerUser: metrics.users > 0 ? metrics.documents / metrics.users : 0,
      totalRevenue: metrics.users * (planPrices[plan as keyof typeof planPrices] || 0)
    }));

    const response: AdminStats = {
      users: {
        total: totalUsers,
      },
      subscriptions: subscriptionDistribution,
      activity: {
        totalQuestions: questionsStats,
        totalDocuments: documentsStats,
      },
      subscriptionDetails,
      usageMetrics
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
