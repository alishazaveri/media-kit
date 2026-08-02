import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { connectDB } from "@/db";
import Subscription from "@/db/models/subscription";
import User from "@/db/models/user";

const SORT_MAP: Record<string, string> = {
  createdAt: "created_at",
  currentPeriodEnd: "current_period_end",
};

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") ?? "25")));
  const search  = searchParams.get("search")?.trim() ?? "";
  const status  = searchParams.get("status") ?? "";
  const sort    = searchParams.get("sort") ?? "createdAt";
  const sortDir = searchParams.get("sortDir") === "asc" ? 1 : -1;
  const sortField = SORT_MAP[sort] ?? "created_at";

  await connectDB();

  const query: Record<string, unknown> = {};

  if (status && status !== "all") {
    query.status = status;
  }

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    const matchingUsers = await User.find({
      $or: [{ name: regex }, { email: regex }, { username: regex }],
    }).select("_id").lean();
    const userIds = matchingUsers.map((u) => u._id);

    query.$or = [
      { razorpay_subscription_id: regex },
      ...(userIds.length > 0 ? [{ user_id: { $in: userIds } }] : []),
    ];
  }

  const [total, subscriptions] = await Promise.all([
    Subscription.countDocuments(query),
    Subscription.find(query)
      .sort({ [sortField]: sortDir })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  const pageUserIds = [...new Set(subscriptions.map((s) => s.user_id.toString()))];
  const users = pageUserIds.length
    ? await User.find({ _id: { $in: pageUserIds } }).select("name email username").lean()
    : [];
  const userMap = new Map(users.map((u) => [(u._id as any).toString(), u]));

  const data = subscriptions.map((sub) => {
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

  return NextResponse.json({
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
