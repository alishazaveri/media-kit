import { getSubscriptionsByUserId } from "@/db/subscription.db";
import { getUserById } from "@/db/user.db";
import type { ISubscription } from "@/db/models/subscription";
import type { IUser } from "@/db/models/user";

export default async function isLinkActive(userId?: string) {
  if (!userId) return false;

  try {
    const now = new Date();

    const [subs, user] = await Promise.all([
      getSubscriptionsByUserId(userId),
      getUserById(userId),
    ]);

    // Active paid subscription
    for (const s of (subs as Pick<ISubscription, "current_period_end">[]) ?? []) {
      if (s?.current_period_end && new Date(s.current_period_end) > now) return true;
    }

    // Active free trial
    const trialEndsAt = (user as Pick<IUser, "trial_ends_at"> | null)?.trial_ends_at;
    if (trialEndsAt && new Date(trialEndsAt) > now) return true;

    return false;
  } catch (err) {
    console.error("isLinkActive error", err);
    return false;
  }
}
