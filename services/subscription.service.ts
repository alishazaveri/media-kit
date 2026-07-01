import Razorpay from "razorpay";
import Subscription from "@/db/models/subscription";
import { getSubscriptionsByUserId } from "@/db/subscription.db";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function cancelActiveSubscriptions(
  userId: string,
  excludeSubscriptionId?: string
): Promise<void> {
  const now = new Date();
  const subs: any[] = (await getSubscriptionsByUserId(userId)) as any[];

  const subsToCancel = subs.filter((s) => {
    if (excludeSubscriptionId && s.razorpay_subscription_id === excludeSubscriptionId) return false;

    const isScheduledSubscription =
      s.status === "authenticated" &&
      s.subscription_start_at &&
      new Date(s.subscription_start_at) > now;

    const isActive =
      s.current_period_end &&
      new Date(s.current_period_end) > now &&
      !s.cancel_at_cycle_end &&
      s.status !== "cancelled";

    return isScheduledSubscription || isActive;
  });

  if (subsToCancel.length === 0) return;

  await Promise.allSettled(
    subsToCancel.map(async (sub) => {
      await razorpay.subscriptions.cancel(sub.razorpay_subscription_id, false);
      await Subscription.findOneAndUpdate(
        { razorpay_subscription_id: sub.razorpay_subscription_id },
        { $set: { status: "cancelled", cancel_at_cycle_end: true } }
      );
    })
  );
}
