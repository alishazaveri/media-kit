import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import { createSubscriptionRecord } from "@/db/subscription.db";
import { PLANS } from "@/lib/plans";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan_id, user_id, start_at } = body || {};

    if (!plan_id || typeof plan_id !== "string") {
      return NextResponse.json({ error: "plan_id is required" }, { status: 400 });
    }

    if (!user_id || typeof user_id !== "string") {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    }

    try {
      // Use maxBillingCycles from plan config; fall back to 240 (monthly) or 20 (yearly)
      const matchedVariant = PLANS.flatMap((p) =>
        Object.entries(p.pricing).map(([freq, v]) => ({ freq, ...v }))
      ).find((x) => x.id === plan_id);
      const maxBillingCycles =
        matchedVariant?.maxBillingCycles ??
        (matchedVariant?.freq === "yearly" ? 20 : 240);

      const payload: Record<string, unknown> = {
        plan_id,
        customer_notify: true,
        total_count: maxBillingCycles,
        notes: { user_id },
        ...(typeof start_at === "number" && { start_at }),
      };

      const subscription = await razorpay.subscriptions.create(payload);

      // persist subscription record in DB using status from Razorpay's subscription object
      const statusFromRazor = subscription?.status || "created";
      const saved = await createSubscriptionRecord(
        user_id,
        plan_id,
        subscription.id,
        undefined,
        statusFromRazor,
        { ...subscription }
      );

      return NextResponse.json({ subscription_id: subscription.id, subscription, record: saved });
    } catch (err: unknown) {
      const e = err as { statusCode?: number; error?: { description?: string }; message?: string };
      const status = e?.statusCode === 401 ? 401 : 500;
      const message = e?.error?.description || e?.message || "Razorpay error";
      return NextResponse.json({ error: message }, { status });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
