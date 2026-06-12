import { getSession } from "@/lib/session";
import { getValidInstagramToken, getUserInstagramChannel } from "@/services/social_channel.service";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const GRAPH = "https://graph.instagram.com/v21.0";
const FIELDS =
  "id,caption,media_type,media_product_type,thumbnail_url,media_url,permalink,timestamp,like_count,comments_count";

// Valid metrics per Instagram Graph API error response
const REEL_METRICS = "views,reach,saved,shares,total_interactions";
const FEED_METRICS = "impressions,reach,saved,shares,total_interactions";

const getMetric = (data: any[], name: string): number =>
  data.find((m: any) => m.name === name)?.values?.[0]?.value ?? 0;

async function fetchInsights(
  mediaId: string,
  isReel: boolean,
  token: string,
): Promise<Record<string, number>> {
  try {
    const res = await axios.get(`${GRAPH}/${mediaId}/insights`, {
      params: {
        metric: isReel ? REEL_METRICS : FEED_METRICS,
        access_token: token,
      },
    });
    const ins: any[] = res.data.data ?? [];
    return {
      // `impressions` holds the primary view metric: plays for reels, impressions for feed
      impressions: getMetric(ins, isReel ? "views" : "impressions"),
      reach: getMetric(ins, "reach"),
      saved: getMetric(ins, "saved"),
      shares: getMetric(ins, "shares"),
      total_interactions: getMetric(ins, "total_interactions"),
    };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.warn(`[posts/insights] ${mediaId} failed:`, {
        status: err.response?.status,
        data: err.response?.data,
      });
    }
    return {};
  }
}

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

    // Fetch insights for all posts in parallel; per-post failures are logged but don't block
    const insightsResults = await Promise.allSettled(
      posts.map((p) =>
        // media_product_type is "REELS" (with S) from the API
        fetchInsights(p.id, p.media_product_type === "REELS", token),
      ),
    );

    const enrichedPosts = posts.map((post, i) => {
      const insights =
        insightsResults[i].status === "fulfilled"
          ? (insightsResults[i] as PromiseFulfilledResult<Record<string, number>>).value
          : {};
      return { ...post, ...insights };
    });

    return NextResponse.json({ posts: enrichedPosts, nextCursor });
  } catch (err) {
    console.error("GET /api/instagram/posts:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
