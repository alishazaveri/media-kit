import { NextRequest, NextResponse } from "next/server";
import {
  getSubscriptionByRazorpayId,
  upsertSubscriptionFromRazorpayData,
  clearCancelAtCycleEnd,
} from "@/db/subscription.db";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || req.headers.get("X-Razorpay-Signature");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    console.error("Razorpay webhook secret not configured");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  if (!signature) {
    console.warn("Missing razorpay signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Verify signature
  try {
    validateWebhookSignature(raw, signature, secret);
  } catch (err) {
    console.warn("Razorpay webhook signature mismatch");
    return NextResponse.json({ error: "Signature mismatch" }, { status: 400 });
  }

  // Parse body
  let payload: any = null;
  try {
    payload = JSON.parse(raw);
  } catch (err) {
    console.error("Malformed webhook payload", err);
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  const event: string = payload?.event || "unknown";

  // Reject non-subscription events immediately
  if (!event.startsWith("subscription.")) {
    console.info("Ignoring non-subscription webhook event:", event);
    return NextResponse.json({ success: true, note: "event ignored" });
  }

  // Derive an idempotency key from the event
  const eventId: string | null =
    req.headers.get("x-razorpay-event-id") ||
    (payload?.created_at ? `${event}:${payload.created_at}` : null);

  try {
    const subscriptionEntity = payload?.payload?.subscription?.entity ?? null;
    const razorId: string | null =
      subscriptionEntity?.id || subscriptionEntity?.subscription_id || null;

    if (!razorId) {
      console.warn("Subscription event missing subscription id", event);
      return NextResponse.json({ success: true });
    }

    // Idempotency check — guard against null if subscription doesn't exist locally yet
    const local = await getSubscriptionByRazorpayId(razorId);
    if (local && eventId) {
      // Exact duplicate — same event delivered twice
      if (local.webhook_last_event_id === eventId) {
        return NextResponse.json({ success: true, note: "event already processed" });
      }
      // Stale event — a newer event was already processed, don't overwrite with older data
      if (
        local.webhook_last_processed_at &&
        payload.created_at &&
        new Date(local.webhook_last_processed_at).getTime() > payload.created_at * 1000
      ) {
        return NextResponse.json({ success: true, note: "stale event ignored" });
      }
    }

    // Per Razorpay docs, subscription.charged (and some others) also include a payment entity.
    // Persist it whenever present.
    const paymentEntity = payload?.payload?.payment?.entity ?? null;

    switch (event) {
      case "subscription.activated":
      case "subscription.updated": {
        // Persist authoritative subscription data and clear any pending cancel flag
        await upsertSubscriptionFromRazorpayData(subscriptionEntity, eventId ?? undefined);
        await clearCancelAtCycleEnd(razorId, eventId ?? undefined).catch((e) =>
          console.error("failed to clear cancel flag", e)
        );
        break;
      }

      case "subscription.charged": {
        // Pass paymentEntity so last_payment_id is persisted in the same DB write
        await upsertSubscriptionFromRazorpayData(subscriptionEntity, eventId ?? undefined, paymentEntity);
        break;
      }

      case "subscription.cancelled": {
        // Mark cancel_at_cycle_end; do NOT revoke access immediately — access continues
        // until current_period_end (handled in isLinkActive via current_period_end > now).
        // Also upsert so status field reflects "cancelled" from Razorpay
        await upsertSubscriptionFromRazorpayData(subscriptionEntity, eventId ?? undefined);
        break;
      }

      case "subscription.authenticated":
      case "subscription.completed":
      case "subscription.pending":
      case "subscription.paused":
      case "subscription.resumed":
      case "subscription.halted": {
        // For all other subscription lifecycle events, persist whatever metadata Razorpay sends
        await upsertSubscriptionFromRazorpayData(subscriptionEntity, eventId ?? undefined);
        break;
      }

      default: {
        // Unknown subscription.* event — persist defensively
        console.info("Unhandled subscription webhook event:", event);
        if (subscriptionEntity) {
          await upsertSubscriptionFromRazorpayData(subscriptionEntity, eventId ?? undefined);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Webhook processing error", err);
    return NextResponse.json({ error: "processing_error" }, { status: 500 });
  }
}
