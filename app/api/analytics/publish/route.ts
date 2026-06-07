import { del } from "@vercel/blob";
import { getSession } from "@/lib/session";
import { publishUserData } from "@/services/user_data.service";
import { getUserData } from "@/db/user_data.db";
import { NextResponse } from "next/server";

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

    // Delete old published blob now that it's been replaced
    if (isVercelBlobUrl(oldPublishedPic) && oldPublishedPic !== newDraftPic) {
      del(oldPublishedPic).catch(() => {});
    }

    return NextResponse.json({ data: published });
  } catch (err) {
    console.error("POST /api/analytics/publish:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
