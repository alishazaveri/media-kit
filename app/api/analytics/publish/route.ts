import { getSession } from "@/lib/session";
import { publishUserData } from "@/services/user_data.service";
import { getUserInstagramChannel } from "@/services/social_channel.service";
import { NextResponse } from "next/server";

/** POST /api/analytics/publish — copies draft analytics to the publish entry. */
export async function POST() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const channel = await getUserInstagramChannel(session.userId);
    if (!channel) return NextResponse.json({ error: "No Instagram account connected" }, { status: 400 });

    const published = await publishUserData(session.userId, "instagram");
    return NextResponse.json({ data: published });
  } catch (err) {
    console.error("POST /api/analytics/publish:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
