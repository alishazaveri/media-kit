import { del } from "@vercel/blob";
import { getSession } from "@/lib/session";
import { publishUserData } from "@/services/user_data.service";
import { getUserData } from "@/db/user_data.db";
import { updateUser, getUserById } from "@/db/user.db";
import { NextResponse } from "next/server";

const REFERRAL_REWARD_MONTHS = 3;

function isVercelBlobUrl(url: unknown): url is string {
  return typeof url === "string" && url.includes(".public.blob.vercel-storage.com");
}

/** POST /api/analytics/publish — copies draft profile data to the published entry. */
export async function POST() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Capture old published pic before overwriting
    const userData = await getUserData(session.userId, "profile");
    const record = userData as { draft_data?: Record<string, unknown>; published_data?: Record<string, unknown> } | null;
    const oldPublishedPic = record?.published_data?.profile_pic;
    const newDraftPic = record?.draft_data?.profile_pic;

    const published = await publishUserData(session.userId, "profile");

    // Sync profile_image_url only when the user has an actual custom pic.
    // When newDraftPic is null (no custom pic uploaded), leave profile_image_url
    // untouched so the Instagram CDN URL from onboarding/cron refresh is preserved.
    if (newDraftPic) {
      await updateUser(session.userId, { profile_image_url: newDraftPic as string });
    }

    // Delete old published blob now that it's been replaced
    if (isVercelBlobUrl(oldPublishedPic) && oldPublishedPic !== newDraftPic) {
      del(oldPublishedPic).catch(() => {});
    }

    // Reward referrer on first successful publish (idempotent — only fires once per referral)
    const currentUser = await getUserById(session.userId);
    const referredBy = (currentUser as any)?.referred_by;
    const referralRewardedAt = (currentUser as any)?.referral_rewarded_at;
    if (referredBy && !referralRewardedAt) {
      const referrer = await getUserById(referredBy.toString());
      if (referrer) {
        const now = new Date();
        const existingTrial = (referrer as any).trial_ends_at;
        const base = existingTrial instanceof Date && existingTrial > now ? existingTrial : now;
        const newTrialEndsAt = new Date(base);
        newTrialEndsAt.setMonth(newTrialEndsAt.getMonth() + REFERRAL_REWARD_MONTHS);
        await Promise.all([
          updateUser(referredBy.toString(), { trial_ends_at: newTrialEndsAt }),
          updateUser(session.userId, { referral_rewarded_at: now }),
        ]);
      }
    }

    return NextResponse.json({ data: published });
  } catch (err) {
    console.error("POST /api/analytics/publish:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
