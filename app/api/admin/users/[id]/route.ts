import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAdminSession } from "@/lib/admin-session";
import { connectDB } from "@/db";
import User from "@/db/models/user";
import SocialChannel from "@/db/models/social_channel";
import Subscription from "@/db/models/subscription";
import UserData from "@/db/models/user_data";
import Invoice from "@/db/models/invoice";
import type { JourneyStage, SubscriptionSlotStage } from "@/app/api/admin/users/route";
import type { ISubscription } from "@/db/models/subscription";
import type { IUser } from "@/db/models/user";

type LeanSub = Pick<ISubscription, "status" | "current_period_end" | "cancel_at_cycle_end" | "subscription_start_at" | "plan_id" | "razorpay_subscription_id" | "current_period_start" | "cancelled_at" | "created_at"> & { _id: unknown };
type LeanUser = Pick<IUser, "trial_ends_at" | "name" | "email" | "username" | "phone" | "phone_country_code" | "profile_image_url" | "last_data_refreshed_at" | "created_at"> & { _id: unknown };
type LeanSocial = { platform_username: string; followers: number; following: number; media_count: number; created_at: Date } | null;
type LeanUserData = { published_data?: { display_name?: string }; draft_data?: { display_name?: string; tagline?: string }; updated_at?: Date } | null;

function resolveSubscriptionState(
  subs: LeanSub[],
  trialEndsAt: Date | null | undefined,
): { subscriptionSlotStage: SubscriptionSlotStage; trialExpired: boolean } {
  const now = new Date();

  const activeSub = subs.find(
    (s) => s.current_period_end && new Date(s.current_period_end) > now,
  ) ?? null;

  const scheduledSub = activeSub
    ? subs.find(
        (s) =>
          s.status === "authenticated" &&
          s.subscription_start_at &&
          new Date(s.subscription_start_at) > now,
      ) ?? null
    : null;

  const pendingSub = !activeSub
    ? subs.find(
        (s) =>
          s.status === "authenticated" &&
          s.subscription_start_at &&
          new Date(s.subscription_start_at) > now,
      ) ?? null
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

  const trialExpired = !!trialEndsAt && new Date(trialEndsAt) <= now && !activeSub && !hasPastSub;

  return { subscriptionSlotStage, trialExpired };
}

function computeStage(user: LeanUser, social: LeanSocial, subs: LeanSub[], userData: LeanUserData): JourneyStage {
  const { subscriptionSlotStage, trialExpired } = resolveSubscriptionState(subs, user.trial_ends_at);

  if (userData?.published_data?.display_name) return "published";
  if (subscriptionSlotStage === "cancelled") return "cancelled";
  if (subscriptionSlotStage === "subscribed") return "subscribed";
  if (subscriptionSlotStage === "scheduled") return "scheduled";
  if (trialExpired) return "trial_expired";
  if (user.trial_ends_at) return "trial_started";
  if (social) return "instagram_connected";
  return "signed_up";
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  await connectDB();

  const [user, social, subscriptions, userData, invoices] = await Promise.all([
    User.findById(id).lean(),
    SocialChannel.findOne({ user_id: id, platform: "instagram" }).lean(),
    Subscription.find({ user_id: id }).sort({ created_at: -1 }).lean(),
    UserData.findOne({ user_id: id, platform: "profile" }).lean(),
    Invoice.find({ user_id: id }).sort({ created_at: -1 }).limit(10).lean(),
  ]);

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const subscription = subscriptions[0] ?? null;
  const { subscriptionSlotStage, trialExpired } = resolveSubscriptionState(
    subscriptions,
    user.trial_ends_at,
  );

  return NextResponse.json({
    data: {
      user: {
        id: (user._id as any).toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.phone ?? null,
        phoneCountryCode: user.phone_country_code ?? null,
        profileImageUrl: user.profile_image_url ?? null,
        trialEndsAt: user.trial_ends_at ?? null,
        lastDataRefreshedAt: user.last_data_refreshed_at ?? null,
        createdAt: user.created_at,
      },
      social: social
        ? {
            handle: social.platform_username,
            followers: social.followers,
            following: social.following,
            mediaCount: social.media_count,
            connectedAt: social.created_at,
          }
        : null,
      subscription: subscription
        ? {
            id: String(subscription._id),
            status: subscription.status,
            planId: subscription.plan_id,
            razorpaySubscriptionId: subscription.razorpay_subscription_id,
            currentPeriodStart: subscription.current_period_start ?? null,
            currentPeriodEnd: subscription.current_period_end ?? null,
            subscriptionStartAt: subscription.subscription_start_at ?? null,
            cancelAtCycleEnd: subscription.cancel_at_cycle_end ?? false,
            cancelledAt: subscription.cancelled_at ?? null,
            createdAt: subscription.created_at,
          }
        : null,
      kit: {
        hasPublished: !!userData?.published_data?.display_name,
        publishedName: userData?.published_data?.display_name ?? null,
        hasDraft: !!userData?.draft_data?.display_name,
        draftName: userData?.draft_data?.display_name ?? null,
        draftTagline: userData?.draft_data?.tagline ?? null,
        updatedAt: userData?.updated_at ?? null,
      },
      invoices: invoices.map((inv) => ({
        id: (inv._id as any).toString(),
        invoiceNumber: inv.invoice_number,
        planName: inv.plan_name,
        totalAmount: inv.total_amount,
        status: inv.status,
        invoiceDate: inv.invoice_date,
        pdfUrl: inv.pdf_url ?? null,
      })),
      stage: computeStage(user, social, subscriptions, userData),
      subscriptionSlotStage,
      trialExpired,
    },
  });
}
