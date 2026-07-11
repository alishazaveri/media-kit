import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { connectDB } from "@/db";
import Subscription from "@/db/models/subscription";
import User from "@/db/models/user";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const [subscriptions, users] = await Promise.all([
    Subscription.find().sort({ created_at: -1 }).lean(),
    User.find().select("name email username").lean(),
  ]);

  const userMap = new Map(users.map((u) => [(u._id as any).toString(), u]));

  const result = subscriptions.map((sub) => {
    const user = userMap.get(sub.user_id.toString()) ?? null;
    return {
      id: (sub._id as any).toString(),
      razorpaySubscriptionId: sub.razorpay_subscription_id,
      planId: sub.plan_id,
      status: sub.status ?? "created",
      currentPeriodStart: sub.current_period_start ?? null,
      currentPeriodEnd: sub.current_period_end ?? null,
      subscriptionStartAt: sub.subscription_start_at ?? null,
      cancelAtCycleEnd: sub.cancel_at_cycle_end ?? false,
      cancelledAt: sub.cancelled_at ?? null,
      createdAt: sub.created_at,
      user: user
        ? {
            id: (user._id as any).toString(),
            name: user.name,
            email: user.email,
            username: user.username,
          }
        : null,
    };
  });

  return NextResponse.json({ data: result });
}
