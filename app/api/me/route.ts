import { getSession } from "@/lib/session";
import { getUserById } from "@/db/user.db";
import { getSubscriptionsByUserId } from "@/db/subscription.db";
import type { ISubscription } from "@/db/models/subscription";
import isLinkActive from "@/lib/isLinkActive";
import { NextResponse } from "next/server";

type LeanSub = Pick<ISubscription, "plan_id" | "status" | "current_period_end" | "cancel_at_cycle_end" | "razorpay_subscription_id" | "subscription_start_at">;
type LeanUser = { profile_image_url?: string };

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

    const now = new Date();
    const subList = subs as LeanSub[];

    const activeSub = subList.find(
      (s) => s.current_period_end && new Date(s.current_period_end) > now
    ) ?? null;

    // A pending resume/plan-change exists when there's an authenticated sub with a
    // subscription_start_at in the future. cancelAtCycleEnd is only suppressed when BOTH
    // conditions are true: the user still has an active sub AND a pending one.
    // When pending, surface the incoming plan's ID so the UI reflects what the user switched to.
    const pendingResumeSub = activeSub
      ? subList.find(
          (s) => s.status === "authenticated" &&
            s.subscription_start_at &&
            new Date(s.subscription_start_at) > now
        ) ?? null
      : null;

    return NextResponse.json({
      userId: session.userId,
      email: session.email,
      username: session.username,
      profilePic: (user as LeanUser)?.profile_image_url ?? null,
      isLinkActive: active,
      subscription: activeSub
        ? {
            planId: pendingResumeSub ? pendingResumeSub.plan_id : activeSub.plan_id,
            status: activeSub.status,
            currentPeriodEnd: activeSub.current_period_end ?? null,
            cancelAtCycleEnd: pendingResumeSub ? false : (activeSub.cancel_at_cycle_end ?? false),
          }
        : null,
    });
  } catch (err) {
    console.error("GET /api/me:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
