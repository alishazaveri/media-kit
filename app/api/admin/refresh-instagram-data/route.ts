import { NextRequest, NextResponse } from "next/server";
import { getAllUsers } from "@/db/user.db";
import { refreshInstagramDataForUser } from "@/services/instagram.service";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { userIds } = body || {};

  let targetUserIds: string[];
  if (Array.isArray(userIds) && userIds.length > 0) {
    targetUserIds = userIds;
  } else {
    const users = await getAllUsers();
    targetUserIds = users.map((u) => u._id.toString());
  }

  const results = await Promise.allSettled(targetUserIds.map(refreshInstagramDataForUser));

  const failures: { userId: string; error: string }[] = [];
  const skips: string[] = [];
  let succeeded = 0;
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      if (r.value.skipped) skips.push(targetUserIds[i]);
      else succeeded++;
    } else {
      const err = r.reason instanceof Error ? r.reason.message : String(r.reason);
      failures.push({ userId: targetUserIds[i], error: err });
    }
  });

  return NextResponse.json({ total: targetUserIds.length, succeeded, skipped: skips.length, skips, failed: failures.length, failures });
}
