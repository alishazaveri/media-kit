import { NextRequest, NextResponse } from "next/server";
import { getUsersDueForRefresh } from "@/db/user.db";
import { refreshInstagramDataForUser } from "@/services/instagram.service";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await getUsersDueForRefresh();
  console.log(`[Cron] Refreshing Instagram data for ${users.length} user(s)`);

  const results = await Promise.allSettled(
    users.map((user) => refreshInstagramDataForUser(user._id.toString()))
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[Cron] Failed for user ${users[i]?._id}:`, r.reason);
    }
  });

  return NextResponse.json({ total: users.length, succeeded, failed });
}
