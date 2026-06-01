import { getSubscriptionsByUserId } from "@/db/subscription.db";

// Returns whether the user has any active (paid) subscription at this moment.
// Primary source of truth: current_period_end > now()
export default async function isLinkActive(userId?: string) {
  if (!userId) return false;

  console.log("Checking active link for userId", userId);

  try {
    const subs: any[] = await getSubscriptionsByUserId(userId);
    if (!subs || subs.length === 0) return false;

    console.log(`Found ${subs.length} subscriptions for userId ${userId}`);

    const now = new Date();
    for (const s of subs) {
      // If current_period_end exists and is in the future, link is active
      if (s && s.current_period_end) {
        const end = new Date(s.current_period_end);
        console.log(`Subscription ${s.razorpay_subscription_id} current_period_end: ${end}, now: ${now}`);
        if (end > now) return true; // active while paid period remains
        continue;
      }
    }

    console.log(`No active subscriptions found for userId ${userId}`);

    return false;
  } catch (err) {
    console.error("isLinkActive error", err);
    return false;
  }
}
