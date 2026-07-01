import { getSession } from "@/lib/session";
import { getUserById } from "@/db/user.db";
import { getSubscriptionsByUserId } from "@/db/subscription.db";
import type { ISubscription } from "@/db/models/subscription";
import isLinkActive from "@/lib/isLinkActive";
import { NextResponse } from "next/server";

type LeanSub = Pick<ISubscription, "plan_id" | "status" | "current_period_end" | "cancel_at_cycle_end" | "razorpay_subscription_id" | "subscription_start_at">;
type LeanUser = { profile_image_url?: string; trial_ends_at?: Date };

export async function GET() {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [user, subs, active] = await Promise.all([
      getUserById(session.userId) as Promise<{ profile_image_url?: string; trial_ends_at?: Date } | null>,
      getSubscriptionsByUserId(session.userId),
      isLinkActive(session.userId),
    ]);

    const now = new Date();
    const subList = subs as LeanSub[];

    const activeSub = subList.find(
      (s) => s.current_period_end && new Date(s.current_period_end) > now
    ) ?? null;

    // A scheduled sub exists when there's an authenticated sub with subscription_start_at in the
    // future. cancelAtCycleEnd is suppressed when BOTH an active and a scheduled sub exist.
    // Surface the scheduled plan's ID so the UI reflects what the user switched to.
    const scheduledSub = activeSub
      ? subList.find(
          (s) => s.status === "authenticated" &&
            s.subscription_start_at &&
            new Date(s.subscription_start_at) > now
        ) ?? null
      : null;

    // Scheduled sub when no active sub — trial user who activated billing for a future start date
    const pendingScheduledSub = !activeSub
      ? subList.find(
          (s) => s.status === "authenticated" &&
            s.subscription_start_at &&
            new Date(s.subscription_start_at) > now
        ) ?? null
      : null;

    const hasScheduledSubscription = !!scheduledSub || !!pendingScheduledSub;

    return NextResponse.json({
      userId: session.userId,
      email: session.email,
      username: session.username,
      profilePic: user?.profile_image_url ?? null,
      isLinkActive: active,
      trialEndsAt: user?.trial_ends_at?.toISOString() ?? null,
      hasScheduledSubscription,
      scheduledSubscription: pendingScheduledSub
        ? {
            planId: pendingScheduledSub.plan_id,
            startsAt: pendingScheduledSub.subscription_start_at ?? null,
          }
        : null,
      subscription: activeSub
        ? {
            planId: scheduledSub ? scheduledSub.plan_id : activeSub.plan_id,
            status: activeSub.status,
            currentPeriodEnd: activeSub.current_period_end ?? null,
            cancelAtCycleEnd: scheduledSub ? false : (activeSub.cancel_at_cycle_end ?? false),
          }
        : null,
    });
  } catch (err) {
    console.error("GET /api/me:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
