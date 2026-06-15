import { NextRequest, NextResponse } from "next/server";
import { getUsersDueForRefresh, updateUser } from "@/db/user.db";
import { getSocialChannelByPlatform } from "@/db/social_channel.db";
import { fetchAndSaveInstagramAnalytics } from "@/services/instagram.service";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await getUsersDueForRefresh();
  console.log(`[Cron] Refreshing Instagram data for ${users.length} user(s)`);

  const results = await Promise.allSettled(
    users.map(async (user) => {
      const userId = user._id.toString();
      const channel = await getSocialChannelByPlatform(userId, "instagram");
      if (!channel) {
        console.log(`[Cron] No Instagram channel for user ${userId}, skipping`);
        return { userId, skipped: true };
      }
      await fetchAndSaveInstagramAnalytics(userId, channel._id.toString());
      await updateUser(userId, { last_data_refreshed_at: new Date() });
      console.log(`[Cron] Refreshed data for user ${userId}`);
      return { userId, success: true };
    }),
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[Cron] Failed for user ${users[i]?._id}:`, r.reason);
    }
  });

  return NextResponse.json({
    total: users.length,
    succeeded,
    failed,
  });
}
