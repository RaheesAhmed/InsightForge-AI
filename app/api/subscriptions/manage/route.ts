import { NextResponse } from "next/server";
import { SubscriptionManager } from "@/lib/subscription-manager";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const manager = new SubscriptionManager(userId);
    const info = await manager.getSubscriptionInfo();

    return NextResponse.json(info);
  } catch (error) {
    console.error("Error getting subscription info:", error);
    return NextResponse.json(
      { error: "Failed to get subscription info" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { action, userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const manager = new SubscriptionManager(userId);

    switch (action) {
      case "cancel":
        const cancelled = await manager.cancelCurrentSubscription();
        return NextResponse.json({ success: cancelled });

      case "reactivate":
        const reactivated = await manager.reactivateSubscription();
        return NextResponse.json({ success: reactivated });

      case "reset_limits":
        await manager.resetUsageLimits();
        return NextResponse.json({ success: true });

      case "check_limits":
        await manager.checkAndResetMonthlyLimits();
        const updatedInfo = await manager.getSubscriptionInfo();
        return NextResponse.json(updatedInfo);

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error managing subscription:", error);
    return NextResponse.json(
      { error: "Failed to manage subscription" },
      { status: 500 }
    );
  }
}
