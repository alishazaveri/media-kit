import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { updateSubscriptionOnVerify } from "@/db/subscription.db";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_payment_id, subscription_id, razorpay_signature } = body || {};

    if (!razorpay_payment_id || !subscription_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const generated = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_payment_id}|${subscription_id}`)
      .digest("hex");

    if (generated === razorpay_signature) {
      try {
        // fetch latest subscription from Razorpay to get authoritative status
        let razorSub: any = null;
        try {
          razorSub = await razorpay.subscriptions.fetch(subscription_id);
        } catch (fetchErr) {
          return NextResponse.json({ error: "Failed to fetch subscription from payment provider" }, { status: 502 });
        }

        if (!razorSub || !razorSub.status) {
          return NextResponse.json({ error: "Could not retrieve subscription status from payment provider" }, { status: 502 });
        }

        const statusFromRazor = razorSub.status;

        // extract razorpay customer id if present and persist verification details + full meta
        const razorpayCustomerId = razorSub.customer_id;

        const updated = await updateSubscriptionOnVerify(
          subscription_id,
          razorpay_payment_id,
          statusFromRazor,
          razorpayCustomerId,
          razorSub.current_start,
          razorSub.current_end,
          razorSub.start_at,
          { ...razorSub }
        );

        return NextResponse.json({ success: true, subscription: updated });
      } catch (dbErr: any) {
        return NextResponse.json({ error: "Verified but failed to persist subscription" }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: "Signature mismatch" }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
