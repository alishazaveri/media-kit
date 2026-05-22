import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import { createSubscriptionRecord } from "@/db/subscription.db";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan_id, user_id } = body || {};

    if (!plan_id || typeof plan_id !== "string") {
      return NextResponse.json({ error: "plan_id is required" }, { status: 400 });
    }

    if (!user_id || typeof user_id !== "string") {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    }

    try {
      // keep total_count static at 240 as requested and attach notes with user id
      const payload: any = {
        plan_id,
        customer_notify: true,
        total_count: 240,
        notes: { user_id },
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
    } catch (err: any) {
      const status = err?.statusCode === 401 ? 401 : 500;
      const message = err?.error?.description || err?.message || "Razorpay error";
      return NextResponse.json({ error: message }, { status });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
