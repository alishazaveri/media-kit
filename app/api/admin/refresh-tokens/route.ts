import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db";
import SocialChannel from "@/db/models/social_channel";
import { refreshInstagramToken } from "@/services/social_channel.service";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { userIds } = body || {};

  await connectDB();

  let targetUserIds: string[];

  if (Array.isArray(userIds) && userIds.length > 0) {
    targetUserIds = userIds;
  } else {
    const channels = await SocialChannel.find({ platform: "instagram" }, { user_id: 1 }).lean();
    targetUserIds = [...new Set(channels.map((c: any) => c.user_id.toString()))];
  }

  const results = await Promise.allSettled(
    targetUserIds.map(async (userId) => {
      await refreshInstagramToken(userId, true);
      return { userId, success: true };
    })
  );

  const succeeded: string[] = [];
  const failed: { userId: string; error: string }[] = [];

  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      succeeded.push(targetUserIds[i]);
    } else {
      failed.push({ userId: targetUserIds[i], error: r.reason?.message ?? String(r.reason) });
    }
  });

  return NextResponse.json({
    total: targetUserIds.length,
    succeeded: succeeded.length,
    failed: failed.length,
    failures: failed,
  });
}
