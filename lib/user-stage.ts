/*
 * Stage derivation logic for users admin panel.
 * These functions mirror /api/me subscription resolution exactly.
 *
 * Definitions
 * -----------
 * activeSub     – subscription where current_period_end > now
 * scheduledSub  – (only when activeSub exists) authenticated sub where subscription_start_at > now
 * pendingSub    – (only when no activeSub) authenticated sub where subscription_start_at > now
 * hasPastSub    – any sub with status in { active, cancelled, expired }
 *
 * subscriptionSlotStage
 * ---------------------
 * activeSub AND cancel_at_cycle_end AND !scheduledSub  → "cancelled"
 * activeSub (otherwise)                                → "subscribed"
 * !activeSub AND pendingSub AND trial_ends_at > now    → "scheduled"
 * !activeSub AND hasPastSub                            → "cancelled"
 * else                                                 → null
 *
 * Journey stage (evaluated in priority order)
 * --------------------------------------------
 * published           published_data.display_name AND subscriptionSlotStage === "subscribed"
 * cancelled           subscriptionSlotStage === "cancelled"
 * subscribed          subscriptionSlotStage === "subscribed" (not published)
 * scheduled           subscriptionSlotStage === "scheduled"
 * trial_expired       trial_ends_at <= now AND !activeSub AND !hasPastSub
 * trial_started       has trial_ends_at (catch-all for any user with a trial)
 * instagram_connected has instagram SocialChannel AND !trial_ends_at AND subscriptionSlotStage === null
 * signed_up           none of the above
 */

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

type LeanSub = {
  status?: string | null;
  current_period_end?: Date | string | null;
  subscription_start_at?: Date | string | null;
  cancel_at_cycle_end?: boolean | null;
};

type LeanUser = { trial_ends_at?: Date | null; [key: string]: unknown };
type LeanSocial = { followers?: number; platform_username?: string } | null;
type LeanUserData = { published_data?: { display_name?: string } } | null;

export function resolveSubscriptionState(
  subs: LeanSub[],
  trialEndsAt: Date | null | undefined,
): { subscriptionSlotStage: SubscriptionSlotStage; trialExpired: boolean } {
  const now = new Date();

  const activeSub =
    subs.find((s) => s.current_period_end && new Date(s.current_period_end) > now) ?? null;

  const scheduledSub = activeSub
    ? (subs.find(
        (s) =>
          s.status === "authenticated" &&
          s.subscription_start_at &&
          new Date(s.subscription_start_at) > now,
      ) ?? null)
    : null;

  const pendingSub = !activeSub
    ? (subs.find(
        (s) =>
          s.status === "authenticated" &&
          s.subscription_start_at &&
          new Date(s.subscription_start_at) > now,
      ) ?? null)
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

  const trialExpired =
    !!trialEndsAt && new Date(trialEndsAt) <= now && !activeSub && !hasPastSub;

  return { subscriptionSlotStage, trialExpired };
}

export function computeStage(
  user: LeanUser,
  social: LeanSocial,
  subs: LeanSub[],
  userData: LeanUserData,
): JourneyStage {
  const { subscriptionSlotStage, trialExpired } = resolveSubscriptionState(
    subs,
    user.trial_ends_at,
  );
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
