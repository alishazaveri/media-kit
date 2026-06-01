import { getSession } from "@/lib/session";
import { saveDraft } from "@/services/user_data.service";
import { getUserInstagramChannel } from "@/services/social_channel.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * PUT /api/analytics/draft
 * Merges profile customization fields into the draft analytics record.
 * Body: { name, tagline, location, niche_tags, available_for_collabs, packages, collabs }
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const channel = await getUserInstagramChannel(session.userId);
    if (!channel) return NextResponse.json({ error: "No Instagram account connected" }, { status: 400 });

    const body = await req.json();

    const allowed = [
      "display_name", "tagline", "pitch", "location", "niche_tags",
      "available_for_collabs", "packages", "collabs", "posts",
    ];
    const patch: Record<string, any> = {};
    for (const key of allowed) {
      if (key in body) patch[key] = body[key];
    }

    const updated = await saveDraft(session.userId, "instagram", patch);
    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("PUT /api/analytics/draft:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
