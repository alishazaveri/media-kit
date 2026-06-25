import { getSession } from "@/lib/session";
import {
  getValidInstagramToken,
  getUserInstagramChannel,
} from "@/services/social_channel.service";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const GRAPH = "https://graph.instagram.com/v21.0";
const FIELDS =
  "id,caption,media_type,media_product_type,thumbnail_url,media_url,permalink,timestamp,like_count,comments_count";
// Base metrics supported by all post types
const BASE_METRICS = "reach,saved,shares,total_interactions";

const getMetric = (data: any[], name: string): number =>
  data.find((m: any) => m.name === name)?.values?.[0]?.value ?? 0;

async function fetchInsights(
  mediaId: string,
  isReel: boolean,
  token: string,
): Promise<Record<string, number>> {
  // Primary view metric differs by type — reels use `views`, feed posts use `impressions`.
  // Some post types (IGTV, older video formats) don't support either; we fall back to base
  // metrics only so reach/interactions still come through.
  const viewMetric = isReel ? "views" : "impressions";

  const parse = (ins: any[], viewKey: string) => ({
    impressions: getMetric(ins, viewKey),
    reach: getMetric(ins, "reach"),
    saved: getMetric(ins, "saved"),
    shares: getMetric(ins, "shares"),
    total_interactions: getMetric(ins, "total_interactions"),
  });

  try {
    const res = await axios.get(`${GRAPH}/${mediaId}/insights`, {
      params: { metric: `${viewMetric},${BASE_METRICS}`, access_token: token },
    });
    return parse(res.data.data ?? [], viewMetric);
  } catch (err) {
    // If the view metric isn't supported for this post type, retry with base metrics only
    if (axios.isAxiosError(err) && err.response?.status === 400) {
      try {
        const res = await axios.get(`${GRAPH}/${mediaId}/insights`, {
          params: { metric: BASE_METRICS, access_token: token },
        });
        return parse(res.data.data ?? [], viewMetric);
      } catch (retryErr) {
        console.warn(
          `[posts/insights] ${mediaId} retry failed:`,
          axios.isAxiosError(retryErr) ? retryErr.response?.data : retryErr,
        );
      }
    } else {
      console.warn(
        `[posts/insights] ${mediaId} failed:`,
        axios.isAxiosError(err) ? err.response?.data : err,
      );
    }
    return {};
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const channel = await getUserInstagramChannel(session.userId);
    if (!channel)
      return NextResponse.json(
        { error: "No Instagram account connected" },
        { status: 400 },
      );

    const igUserId = (channel as any).platform_user_id;
    const token = await getValidInstagramToken(session.userId);

    const after = req.nextUrl.searchParams.get("after") ?? undefined;
    const limit = Math.min(
      Number(req.nextUrl.searchParams.get("limit") ?? 20),
      50,
    );

    const params: Record<string, any> = {
      fields: FIELDS,
      limit,
      access_token: token,
    };
    if (after) params.after = after;

    const res = await axios.get(`${GRAPH}/${igUserId}/media`, { params });

    const posts: any[] = res.data.data ?? [];
    const nextCursor: string | null = res.data.paging?.next
      ? (res.data.paging.cursors?.after ?? null)
      : null;

    const insightsResults = await Promise.allSettled(
      posts.map((p) =>
        fetchInsights(p.id, p.media_product_type === "REELS", token),
      ),
    );

    const enrichedPosts = posts.map((post: any, i) => {
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
