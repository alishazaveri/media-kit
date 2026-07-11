import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { connectDB } from "@/db";
import User from "@/db/models/user";
import SocialChannel from "@/db/models/social_channel";
import Subscription from "@/db/models/subscription";
import UserData from "@/db/models/user_data";

export type JourneyStage =
  | "signed_up"
  | "instagram_connected"
  | "trial_started"
  | "trial_expired"
  | "subscribed"
  | "cancelled"
  | "scheduled"
  | "published";

export type SubscriptionSlotStage = "subscribed" | "cancelled" | "scheduled" | null;

// Mirrors /api/me logic exactly
function resolveSubscriptionState(
  subs: any[],
  trialEndsAt: Date | null | undefined,
): { subscriptionSlotStage: SubscriptionSlotStage; trialExpired: boolean } {
  const now = new Date();

  const activeSub = subs.find(
    (s) => s.current_period_end && new Date(s.current_period_end) > now,
  ) ?? null;

  const scheduledSub = activeSub
    ? subs.find(
        (s) =>
          s.status === "authenticated" &&
          s.subscription_start_at &&
          new Date(s.subscription_start_at) > now,
      ) ?? null
    : null;

  const pendingSub = !activeSub
    ? subs.find(
        (s) =>
          s.status === "authenticated" &&
          s.subscription_start_at &&
          new Date(s.subscription_start_at) > now,
      ) ?? null
    : null;

  const hasPastSub = subs.some((s) =>
    ["active", "cancelled", "expired"].includes(s.status ?? ""),
  );

  let subscriptionSlotStage: SubscriptionSlotStage = null;
  if (activeSub) {
    subscriptionSlotStage =
      activeSub.cancel_at_cycle_end && !scheduledSub ? "cancelled" : "subscribed";
  } else if (pendingSub && trialEndsAt && new Date(trialEndsAt) > now) {
    subscriptionSlotStage = "scheduled";
  } else if (hasPastSub) {
    subscriptionSlotStage = "cancelled";
  }

  // Trial expired: has trial, trial has passed, and no active subscription access
  const trialExpired = !!trialEndsAt && new Date(trialEndsAt) <= now && !activeSub && !hasPastSub;

  return { subscriptionSlotStage, trialExpired };
}

function computeStage(
  user: any,
  social: any,
  subs: any[],
  userData: any,
): JourneyStage {
  const { subscriptionSlotStage, trialExpired } = resolveSubscriptionState(subs, user.trial_ends_at);
  const isPublished = !!userData?.published_data?.display_name;

  if (isPublished && subscriptionSlotStage === "subscribed") return "published";
  if (subscriptionSlotStage === "cancelled") return "cancelled";
  if (subscriptionSlotStage === "subscribed") return "subscribed";
  if (subscriptionSlotStage === "scheduled") return "scheduled";
  if (trialExpired) return "trial_expired";
  if (user.trial_ends_at) return "trial_started";
  if (social) return "instagram_connected";
  return "signed_up";
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const [users, socialChannels, subscriptions, userDataRecords] = await Promise.all([
    User.find().sort({ created_at: -1 }).lean(),
    SocialChannel.find({ platform: "instagram" }).lean(),
    Subscription.find().lean(),
    UserData.find({ platform: "profile" }).lean(),
  ]);

  const socialMap = new Map(socialChannels.map((s) => [s.user_id.toString(), s]));
  const userDataMap = new Map(userDataRecords.map((d) => [d.user_id.toString(), d]));

  const subscriptionMap = new Map<string, any[]>();
  for (const sub of subscriptions) {
    const uid = sub.user_id.toString();
    if (!subscriptionMap.has(uid)) subscriptionMap.set(uid, []);
    subscriptionMap.get(uid)!.push(sub);
  }

  const result = users.map((u) => {
    const uid = (u._id as any).toString();
    const social = socialMap.get(uid);
    const userSubs = subscriptionMap.get(uid) ?? [];
    const userData = userDataMap.get(uid);
    const { subscriptionSlotStage, trialExpired } = resolveSubscriptionState(
      userSubs,
      u.trial_ends_at,
    );

    return {
      id: uid,
      name: u.name,
      email: u.email,
      username: u.username,
      hasTrial: !!u.trial_ends_at,
      followers: social?.followers ?? null,
      handle: social?.platform_username ?? null,
      subscriptionSlotStage,
      trialExpired,
      stage: computeStage(u, social, userSubs, userData),
      createdAt: u.created_at,
    };
  });

  return NextResponse.json({ data: result });
}
