import { getSession } from "@/lib/session";
import { getValidInstagramToken, getUserInstagramChannel } from "@/services/social_channel.service";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const GRAPH = "https://graph.instagram.com/v21.0";
const FIELDS =
  "id,caption,media_type,media_product_type,thumbnail_url,media_url,permalink,timestamp,like_count,comments_count";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const channel = await getUserInstagramChannel(session.userId);
    if (!channel) return NextResponse.json({ error: "No Instagram account connected" }, { status: 400 });

    const igUserId = (channel as any).platform_user_id;
    const token = await getValidInstagramToken(session.userId);

    const after = req.nextUrl.searchParams.get("after") ?? undefined;
    const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 20), 50);

    const params: Record<string, any> = { fields: FIELDS, limit, access_token: token };
    if (after) params.after = after;

    const res = await axios.get(`${GRAPH}/${igUserId}/media`, { params });

    const posts: any[] = res.data.data ?? [];
    const nextCursor: string | null =
      res.data.paging?.next ? (res.data.paging.cursors?.after ?? null) : null;

    return NextResponse.json({ posts, nextCursor });
  } catch (err) {
    console.error("GET /api/instagram/posts:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
