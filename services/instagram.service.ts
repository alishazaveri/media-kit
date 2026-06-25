import axios from "axios";
import { getSocialChannelById } from "@/db/social_channel.db";
import { getValidInstagramToken } from "@/services/social_channel.service";
import { saveInsight } from "@/services/insight.service";
import {
  linkInsightToUserData,
  getDraft,
  saveDraft,
  refreshPostMediaUrls,
} from "@/services/user_data.service";
import { getUserById, updateUser } from "@/db/user.db";
import instagramConnect from "@/lib/instagramConnect";

const GRAPH = "https://graph.instagram.com/v21.0";

const sumValues = (data: any): number =>
  data?.data?.[0]?.values?.reduce(
    (acc: number, v: any) => acc + (v.value || 0),
    0,
  ) ?? 0;

function settled<T>(result: PromiseSettledResult<T>, label: string): T | null {
  if (result.status === "fulfilled") {
    return result.value;
  }
  const err = result.reason;
  // Silently skip posts created before account was converted to professional
  if (
    axios.isAxiosError(err) &&
    err.response?.data?.error?.error_subcode === 2108006
  ) {
    return null;
  }
  console.warn(
    `[Instagram Analytics] "${label}" failed:`,
    axios.isAxiosError(err)
      ? { status: err.response?.status, data: err.response?.data }
      : (err?.message ?? err),
  );
  return null;
}

export async function fetchAndSaveInstagramAnalytics(
  userId: string,
  accountId: string,
) {
  const [account, token] = await Promise.all([
    getSocialChannelById(accountId),
    getValidInstagramToken(userId),
  ]);

  if (!account) throw new Error("Social channel not found");

  const igUserId = account.platform_user_id;

  const DAY = 24 * 60 * 60;
  // Align to midnight UTC so "today" is never included — range is [May 25 … Jun 23] when today is Jun 24
  const startOfToday = Math.floor(Date.now() / 1000 / DAY) * DAY;
  const now = startOfToday; // "until" is midnight today = end of yesterday
  const since30 = startOfToday - 30 * DAY;
  const since60 = startOfToday - 60 * DAY;

  const dayParams = (metric: string) => ({
    metric,
    period: "day",
    since: since30,
    until: now,
    access_token: token,
  });

  // Previous 30-day window for % change calculations
  const prevPeriodParams = (metric: string) => ({
    metric,
    period: "day",
    since: since60,
    until: since30,
    access_token: token,
  });

  const [
    profileResult,
    reachResult,
    viewsResult,
    profileViewsResult,
    followerCountResult,
    totalInteractionsResult,
    reachPrevResult,
    profileViewsPrevResult,
    followerCountPrevResult,
    demoCityResult,
    demoCountryResult,
    demoAgeResult,
    demoGenderResult,
    mediaResult,
  ] = await Promise.allSettled([
    axios.get(`${GRAPH}/${igUserId}`, {
      params: { fields: instagramConnect.profileFields, access_token: token },
    }),
    // Current 30-day window
    axios.get(`${GRAPH}/${igUserId}/insights`, { params: dayParams("reach") }),
    axios.get(`${GRAPH}/${igUserId}/insights`, { params: dayParams("views") }),
    axios.get(`${GRAPH}/${igUserId}/insights`, {
      params: dayParams("profile_views"),
    }),
    axios.get(`${GRAPH}/${igUserId}/insights`, {
      params: dayParams("follower_count"),
    }),
    axios.get(`${GRAPH}/${igUserId}/insights`, {
      params: dayParams("total_interactions"),
    }),
    // Previous 30-day window for % change
    axios.get(`${GRAPH}/${igUserId}/insights`, {
      params: prevPeriodParams("reach"),
    }),
    axios.get(`${GRAPH}/${igUserId}/insights`, {
      params: prevPeriodParams("profile_views"),
    }),
    axios.get(`${GRAPH}/${igUserId}/insights`, {
      params: prevPeriodParams("follower_count"),
    }),
    // Lifetime follower demographics — metric_type and timeframe are required by Meta's API
    // Without them the endpoint silently returns data:[] instead of an error
    axios.get(`${GRAPH}/${igUserId}/insights`, {
      params: {
        metric: "follower_demographics",
        period: "lifetime",
        metric_type: "total_value",
        timeframe: "last_30_days",
        breakdown: "city",
        access_token: token,
      },
    }),
    axios.get(`${GRAPH}/${igUserId}/insights`, {
      params: {
        metric: "follower_demographics",
        period: "lifetime",
        metric_type: "total_value",
        timeframe: "last_30_days",
        breakdown: "country",
        access_token: token,
      },
    }),
    axios.get(`${GRAPH}/${igUserId}/insights`, {
      params: {
        metric: "follower_demographics",
        period: "lifetime",
        metric_type: "total_value",
        timeframe: "last_30_days",
        breakdown: "age",
        access_token: token,
      },
    }),
    axios.get(`${GRAPH}/${igUserId}/insights`, {
      params: {
        metric: "follower_demographics",
        period: "lifetime",
        metric_type: "total_value",
        timeframe: "last_30_days",
        breakdown: "gender",
        access_token: token,
      },
    }),
    // Media list — 25 posts for better top-content ranking
    axios.get(`${GRAPH}/${igUserId}/media`, {
      params: {
        fields:
          "id,caption,media_type,media_product_type,thumbnail_url,media_url,permalink,timestamp,like_count,comments_count",
        limit: 25,
        access_token: token,
      },
    }),
  ]);

  // Profile is required — throw if it failed
  const profileRes = settled(profileResult, "profile");
  if (!profileRes) throw new Error("Failed to fetch Instagram profile");

  const reachRes = settled(reachResult, "reach");
  const viewsRes = settled(viewsResult, "views");
  const profileViewsRes = settled(profileViewsResult, "profile_views");
  const followerCountRes = settled(followerCountResult, "follower_count");
  const totalInteractionsRes = settled(
    totalInteractionsResult,
    "total_interactions",
  );
  const reachPrevRes = settled(reachPrevResult, "reach_prev");
  const profileViewsPrevRes = settled(
    profileViewsPrevResult,
    "profile_views_prev",
  );
  const followerCountPrevRes = settled(
    followerCountPrevResult,
    "follower_count_prev",
  );
  const demoCityRes = settled(demoCityResult, "follower_demographics_city");
  const demoCountryRes = settled(
    demoCountryResult,
    "follower_demographics_country",
  );
  const demoAgeRes = settled(demoAgeResult, "follower_demographics_age");
  const demoGenderRes = settled(
    demoGenderResult,
    "follower_demographics_gender",
  );
  const mediaRes = settled(mediaResult, "media");

  const profile = profileRes.data;

  // ── Current-period totals ─────────────────────────────────────────────────
  const reach30d = reachRes ? sumValues(reachRes.data) : 0;
  const reachDailyValues: { value: number; end_time: string }[] =
    reachRes?.data?.data?.[0]?.values ?? [];
  const reach_daily_30d: Record<string, number> = Object.fromEntries(
    reachDailyValues.map(({ end_time, value }) => [
      end_time.slice(0, 10),
      value,
    ]),
  );

  console.log("Reach Daily 30 days", { reach_daily_30d });

  const views30d = viewsRes ? sumValues(viewsRes.data) : 0;
  const profileViews30d = profileViewsRes ? sumValues(profileViewsRes.data) : 0;
  const totalInteractions30d = totalInteractionsRes
    ? sumValues(totalInteractionsRes.data)
    : 0;

  // ── Follower gain (sum of daily deltas) ───────────────────────────────────
  const followerValues: any[] = followerCountRes?.data?.data?.[0]?.values ?? [];
  const followerGain30d = followerValues.reduce(
    (acc: number, v: any) => acc + (v.value ?? 0),
    0,
  );

  // ── Previous-period totals for % change ──────────────────────────────────
  const reachPrev = reachPrevRes ? sumValues(reachPrevRes.data) : 0;
  const profileViewsPrev = profileViewsPrevRes
    ? sumValues(profileViewsPrevRes.data)
    : 0;
  const followerPrevValues: any[] =
    followerCountPrevRes?.data?.data?.[0]?.values ?? [];
  const followerGainPrev = followerPrevValues.reduce(
    (acc: number, v: any) => acc + (v.value ?? 0),
    0,
  );

  const calcGrowth = (current: number, previous: number): number | null =>
    previous === 0
      ? null
      : parseFloat((((current - previous) / previous) * 100).toFixed(1));

  const reachGrowthPct = calcGrowth(reach30d, reachPrev);
  const profileViewsGrowthPct = calcGrowth(profileViews30d, profileViewsPrev);
  const followerGrowthPct = calcGrowth(followerGain30d, followerGainPrev);

  // ── Audience demographics (follower_demographics breakdown format) ────────
  // Response shape: data[0].total_value.breakdowns[0].results[]
  //   where each result = { dimension_values: [string], value: number }
  type DemoResult = { dimension_values: string[]; value: number };
  const parseDemoResults = (res: any): DemoResult[] =>
    res?.data?.data?.[0]?.total_value?.breakdowns?.[0]?.results ?? [];

  const cityResults = parseDemoResults(demoCityRes);
  const countryResults = parseDemoResults(demoCountryRes);
  const ageResults = parseDemoResults(demoAgeRes);
  const genderResults = parseDemoResults(demoGenderRes);

  const topCities = cityResults
    .map((r) => ({ city: r.dimension_values[0], count: r.value }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topCountries = countryResults
    .map((r) => ({ country: r.dimension_values[0], count: r.value }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const genderBreakdown = genderResults
    .map((r) => ({ label: r.dimension_values[0], value: r.value }))
    .sort((a, b) => b.value - a.value);

  const ageBreakdown = ageResults
    .map((r) => ({ label: r.dimension_values[0], value: r.value }))
    .sort((a, b) => b.value - a.value);

  // ── Per-media insights ────────────────────────────────────────────────────
  const mediaList: any[] = mediaRes?.data?.data ?? [];

  const mediaInsightsResults = await Promise.allSettled(
    mediaList.map((post: any) =>
      axios.get(`${GRAPH}/${post.id}/insights`, {
        params: {
          metric: [
            "views",
            "reach",
            "saved",
            "shares",
            "total_interactions",
          ].join(","),
          access_token: token,
        },
      }),
    ),
  );

  const getMetric = (
    insightData: { name: string; values?: { value?: number }[] }[],
    name: string,
  ): number =>
    insightData.find((m) => m.name === name)?.values?.[0]?.value ?? 0;

  const posts = mediaList.map((post: any, i) => {
    const insightRes = settled(
      mediaInsightsResults[i],
      `media_insights_${post.id}`,
    );
    const ins: any[] = insightRes?.data?.data ?? [];

    return {
      id: post.id,
      caption: post.caption ?? "",
      media_type: post.media_type,
      media_product_type: post.media_product_type ?? "POST",
      thumbnail_url: post.thumbnail_url ?? null,
      media_url: post.media_url ?? null,
      permalink: post.permalink ?? null,
      timestamp: post.timestamp,
      like_count: post.like_count ?? 0,
      comments_count: post.comments_count ?? 0,
      impressions: getMetric(ins, "views"),
      reach: getMetric(ins, "reach"),
      saved: getMetric(ins, "saved"),
      shares: getMetric(ins, "shares"),
      total_interactions: getMetric(ins, "total_interactions"),
    };
  });

  // Top content by views (impressions); top reels by engagement
  const topContentByViews = [...posts]
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 5);
  const topReelsByEngagement = [...posts]
    .filter((p) => p.media_type === "VIDEO" || p.media_product_type === "REELS")
    .sort((a, b) => b.total_interactions - a.total_interactions)
    .slice(0, 5);

  const analyticsData = {
    // Profile snapshot
    name: profile.name,
    username: profile.username,
    account_type: profile.account_type,
    biography: profile.biography ?? "",
    website: profile.website ?? "",
    profile_pic: profile.profile_picture_url ?? "",
    followers_count: profile.followers_count,
    follows_count: profile.follows_count,
    media_count: profile.media_count,
    // Views analytics
    reach_30d: reach30d,
    impressions_30d: views30d,
    reach_growth_pct: reachGrowthPct,
    profile_views_30d: profileViews30d,
    profile_views_growth_pct: profileViewsGrowthPct,
    top_content_by_views: topContentByViews,
    // Interaction analytics
    total_interactions_30d: totalInteractions30d,
    total_likes: posts.reduce((acc, p) => acc + p.like_count, 0),
    total_comments: posts.reduce((acc, p) => acc + p.comments_count, 0),
    total_saved: posts.reduce((acc, p) => acc + p.saved, 0),
    total_shares: posts.reduce((acc, p) => acc + p.shares, 0),
    top_reels_by_engagement: topReelsByEngagement,
    // Followers analytics
    follower_gain_30d: followerGain30d,
    follower_growth_pct: followerGrowthPct,
    // Audience (lifetime snapshot)
    top_cities: topCities,
    top_countries: topCountries,
    gender_breakdown: genderBreakdown,
    age_breakdown: ageBreakdown,
    post_count: posts.length,
    reach_daily_30d,
  };

  const insight = await saveInsight(
    userId,
    accountId,
    "instagram",
    analyticsData,
    reach30d,
  );
  await linkInsightToUserData(userId, "instagram", insight._id.toString());

  // Refresh time-sensitive media URLs in stored draft/published posts
  const urlMap = new Map(
    posts.map((p) => [
      p.id,
      { media_url: p.media_url, thumbnail_url: p.thumbnail_url },
    ]),
  );
  await refreshPostMediaUrls(userId, "profile", urlMap);

  // Refresh profile_image_url if it's an Instagram CDN URL (not a user-uploaded Vercel Blob)
  const freshProfilePic = profile.profile_picture_url as string | undefined;
  if (freshProfilePic) {
    const user = await getUserById(userId);
    const current = (user as any)?.profile_image_url as string | undefined;
    if (current && !current.includes(".public.blob.vercel-storage.com")) {
      await updateUser(userId, { profile_image_url: freshProfilePic });
    }
  }

  // Seed draft_data on first-time setup (display_name not yet set by user)
  const existingDraft = (await getDraft(userId, "instagram")) as any;
  if (!existingDraft?.draft_data?.display_name) {
    const seedSource =
      topContentByViews.length > 0 ? topContentByViews : posts.slice(0, 4);
    const seedPosts = seedSource.slice(0, 4).map((p) => ({
      id: p.id,
      caption: p.caption,
      media_type: p.media_type,
      media_product_type: p.media_product_type,
      thumbnail_url: p.thumbnail_url,
      media_url: p.media_url,
      permalink: p.permalink,
      timestamp: p.timestamp,
      like_count: p.like_count,
      comments_count: p.comments_count,
      view_count: p.impressions || null,
    }));
    await saveDraft(userId, "instagram", {
      display_name: profile.name ?? "",
      tagline: profile.biography ?? "",
      posts: seedPosts,
      niche_tags: [],
      location: "",
      available_for_collabs: true,
    });
  }

  return analyticsData;
}
