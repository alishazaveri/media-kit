import { connectDB } from "@/db";
import Subscription from "@/db/models/subscription";

export async function createSubscriptionRecord(
  userId: string,
  planId: string,
  razorpaySubscriptionId: string,
  razorpayPaymentId?: string,
  status?: string,
  meta?: any
) {
  await connectDB();
  return Subscription.create({
    user_id: userId,
    plan_id: planId,
    razorpay_subscription_id: razorpaySubscriptionId,
    ...(razorpayPaymentId && { last_payment_id: razorpayPaymentId }),
    ...(status && { status }),
    ...(meta && { meta }),
  });
}

export async function updateSubscriptionOnVerify(
  razorpaySubscriptionId: string,
  razorpayPaymentId: string,
  status = "active",
  razorpayCustomerId?: string,
  current_period_start?: number,
  current_period_end?: number,
  subscription_start_at?: number,
  meta?: any
) {
  await connectDB();
  const updateObj: any = { last_payment_id: razorpayPaymentId, status };
  if (razorpayCustomerId) updateObj.razorpay_customer_id = razorpayCustomerId;
  if (current_period_start) updateObj.current_period_start = new Date(current_period_start * 1000);
  if (current_period_end) updateObj.current_period_end = new Date(current_period_end * 1000);
  if (subscription_start_at) updateObj.subscription_start_at = new Date(subscription_start_at * 1000);
  if (meta) updateObj.meta = meta;

  return Subscription.findOneAndUpdate(
    { razorpay_subscription_id: razorpaySubscriptionId },
    { $set: updateObj },
    { new: true }
  ).lean();
}

export async function getSubscriptionByRazorpayId(razorpayId: string) {
  await connectDB();
  return Subscription.findOne({ razorpay_subscription_id: razorpayId }).lean();
}

// paymentEntity is optional — pass it when the webhook event includes a payment alongside
// the subscription (e.g. subscription.charged). It will be merged into the same update.
export async function upsertSubscriptionFromRazorpayData(
  razorSub: any,
  eventId?: string,
  paymentEntity?: any
) {
  await connectDB();
  if (!razorSub || !razorSub.id) return null;

  const updateObj: any = {};
  if (razorSub.status) updateObj.status = razorSub.status;
  if (razorSub.customer_id) updateObj.razorpay_customer_id = razorSub.customer_id;
  if (razorSub.current_start) updateObj.current_period_start = new Date(razorSub.current_start * 1000);
  if (razorSub.current_end) updateObj.current_period_end = new Date(razorSub.current_end * 1000);
  if (razorSub.status === "cancelled") {
    updateObj.cancel_at_cycle_end = true;
    if (razorSub.ended_at) updateObj.cancelled_at = new Date(razorSub.ended_at * 1000);
  }
  updateObj.razorpay_subscription_id = razorSub.id;
  updateObj.meta = { ...(razorSub || {}) };

  // If a payment entity was provided (e.g. from subscription.charged), persist it in the same write
  if (paymentEntity?.id) {
    updateObj.last_payment_id = paymentEntity.id;
  }

  if (eventId) {
    updateObj.webhook_last_event_id = eventId;
    updateObj.webhook_last_processed_at = new Date();
  }

  return Subscription.findOneAndUpdate(
    { razorpay_subscription_id: razorSub.id },
    { $set: updateObj },
    { new: true }
  ).lean();
}

export async function clearCancelAtCycleEnd(razorpaySubscriptionId: string, eventId?: string) {
  await connectDB();
  const updateObj: any = { cancel_at_cycle_end: false, cancelled_at: null };
  if (eventId) {
    updateObj.webhook_last_event_id = eventId;
    updateObj.webhook_last_processed_at = new Date();
  }
  return Subscription.findOneAndUpdate(
    { razorpay_subscription_id: razorpaySubscriptionId },
    { $set: updateObj },
    { new: true }
  ).lean();
}

export async function markExpiredIfPastEnd(razorpaySubscriptionId: string) {
  await connectDB();
  const sub: any = await Subscription.findOne({ razorpay_subscription_id: razorpaySubscriptionId });
  if (!sub) return null;
  if (sub.current_period_end && sub.current_period_end < new Date()) {
    sub.status = "completed";
    await sub.save();
    return sub.toObject();
  }
  return sub.toObject();
}

export async function getSubscriptionsByUserId(userId: string) {
  await connectDB();
  return Subscription.find({ user_id: userId }).sort({ created_at: -1 }).lean();
}

export async function getSubscriptionByCustomerId(customerId: string) {
  await connectDB();
  if (!customerId) return null;
  return Subscription.findOne({ razorpay_customer_id: customerId }).lean();
}

export async function getActiveSubscriptionUserIds(): Promise<string[]> {
  await connectDB();
  const subs = await Subscription.find(
    { current_period_end: { $gt: new Date() } },
    { user_id: 1 }
  ).lean();
  return (subs as { user_id: { toString(): string } }[]).map(s => s.user_id.toString());
}