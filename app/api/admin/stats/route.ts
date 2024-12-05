import { NextResponse } from "next/server";

// Mock data for development
const mockStats = {
  overview: {
    totalUsers: 150,
    activeUsers: 89,
    totalRevenue: 12500, // in cents
    monthlyRevenue: 2500, // in cents
  },
  usageStats: {
    totalQuestions: 1250,
    totalDocuments: 450,
    averageQuestionsPerUser: 8.33,
    averageDocumentsPerUser: 3,
  },
  subscriptions: {
    free: 100,
    pro: 40,
    enterprise: 10,
  },
  revenueHistory: [
    { date: "2024-01", revenue: 2200, subscriptions: 45 },
    { date: "2024-02", revenue: 2350, subscriptions: 48 },
    { date: "2024-03", revenue: 2500, subscriptions: 50 },
  ],
  userGrowth: [
    { date: "2024-01", totalUsers: 120, activeUsers: 70 },
    { date: "2024-02", totalUsers: 135, activeUsers: 82 },
    { date: "2024-03", totalUsers: 150, activeUsers: 89 },
  ],
};

export async function GET(request: Request) {
  try {
    // TODO: Replace with actual database queries
    return NextResponse.json(mockStats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 }
    );
  }
}
