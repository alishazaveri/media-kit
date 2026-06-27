import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSubscriptionsByUserId } from "@/db/subscription.db";
import Subscription from "@/db/models/subscription";
import { connectDB } from "@/db";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function POST() {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const subs: any[] = (await getSubscriptionsByUserId(session.userId)) as any[];

    // Collect all subs eligible for cancellation:
    // 1. authenticated subs with a future subscription_start_at (pending resumes)
    // 2. active subs with current_period_end > now that aren't already cancelled
    const subsToCancel = subs.filter((s) => {
      const isPendingResume =
        s.status === "authenticated" &&
        s.subscription_start_at &&
        new Date(s.subscription_start_at) > now;

      const isActive =
        s.current_period_end &&
        new Date(s.current_period_end) > now &&
        !s.cancel_at_cycle_end &&
        s.status !== "cancelled";

      return isPendingResume || isActive;
    });

    if (subsToCancel.length === 0) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    await connectDB();

    await Promise.all(
      subsToCancel.map(async (sub) => {
        await razorpay.subscriptions.cancel(sub.razorpay_subscription_id, false);
        await Subscription.findOneAndUpdate(
          { razorpay_subscription_id: sub.razorpay_subscription_id },
          { $set: { status: "cancelled", cancel_at_cycle_end: true } }
        );
      })
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const message = err?.error?.description || err?.message || "Failed to cancel subscription";
    console.error("POST /api/payments/cancel-subscription:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
