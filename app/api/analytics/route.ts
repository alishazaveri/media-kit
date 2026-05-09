import { getSession } from "@/lib/session";
import { getInsight } from "@/services/insight.service";
import { getDraft } from "@/services/user_data.service";
import { getUserInstagramChannel } from "@/services/social_channel.service";
import { NextResponse } from "next/server";

/** GET /api/analytics — returns raw insight + user_data draft for the authenticated user. */
export async function GET() {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const channel = await getUserInstagramChannel(session.userId);
    if (!channel) return NextResponse.json({ data: null, draft: {} }, { status: 200 });

    const [insight, userData] = await Promise.all([
      getInsight(session.userId),
      getDraft(session.userId, "instagram"),
    ]);

    return NextResponse.json({
      data: insight,
      draft: (userData as any)?.draft_data ?? {},
      published: (userData as any)?.published_data ?? {},
      username: session.username,
      email: session.email,
    });
  } catch (err) {
    console.error("GET /api/analytics:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
