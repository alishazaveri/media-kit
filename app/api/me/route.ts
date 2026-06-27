import { getSession } from "@/lib/session";
import { getUserById } from "@/db/user.db";
import { getSubscriptionsByUserId } from "@/db/subscription.db";
import isLinkActive from "@/lib/isLinkActive";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [user, subs, active] = await Promise.all([
      getUserById(session.userId),
      getSubscriptionsByUserId(session.userId),
      isLinkActive(session.userId),
    ]);

    const latestSub: any = (subs as any[])?.[0] ?? null;

    return NextResponse.json({
      userId: session.userId,
      email: session.email,
      username: session.username,
      profilePic: (user as any)?.profile_image_url ?? null,
      isLinkActive: active,
      subscription: latestSub
        ? {
            planId: latestSub.plan_id,
            status: latestSub.status,
            currentPeriodEnd: latestSub.current_period_end ?? null,
            cancelAtCycleEnd: latestSub.cancel_at_cycle_end ?? false,
          }
        : null,
    });
  } catch (err) {
    console.error("GET /api/me:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
