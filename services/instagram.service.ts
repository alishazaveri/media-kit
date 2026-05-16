import axios from "axios";
import { getSocialChannelById } from "@/db/social_channel.db";
import { getValidInstagramToken } from "@/services/social_channel.service";
import { saveInsight } from "@/services/insight.service";
import { linkInsightToUserData } from "@/services/user_data.service";
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
  console.log(
    "[Instagram Analytics] Starting fetch for userId:",
    userId,
    "accountId:",
    accountId,
  );

  const [account, token] = await Promise.all([
    getSocialChannelById(accountId),
    getValidInstagramToken(userId),
  ]);

  if (!account) throw new Error("Social channel not found");

  const igUserId = account.platform_user_id;
  console.log("[Instagram Analytics] igUserId:", igUserId);

  const now = Math.floor(Date.now() / 1000);
  const since30 = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
  const since60 = Math.floor((Date.now() - 60 * 24 * 60 * 60 * 1000) / 1000);

  const dayParams = (metric: string) => ({
    metric,
    period: "day",
    since: since30,
    until: now,
    access_token: token,
  });

  // previous 30-day window for % change calculations
  const prevPeriodParams = (metric: string) => ({
    metric,
    period: "day",
    since: since60,
    until: since30,
    access_token: token,
  });

  const lifetimeParams = (metric: string) => ({
    metric,
    period: "lifetime",
    access_token: token,
  });

  console.log("[Instagram Analytics] Firing all API requests...");

  const [
    profileResult,
    reachResult,
    impressionsResult,
    profileViewsResult,
    followerCountResult,
    totalInteractionsResult,
    reachPrevResult,
    profileViewsPrevResult,
    followerCountPrevResult,
    cityResult,
    countryResult,
    genderAgeResult,
    mediaResult,
  ] = await Promise.allSettled([
    axios.get(`${GRAPH}/${igUserId}`, {
      params: { fields: instagramConnect.profileFields, access_token: token },
    }),
    // Current 30-day window
    axios.get(`${GRAPH}/${igUserId}/insights`, { params: dayParams("reach") }),
    axios.get(`${GRAPH}/${igUserId}/insights`, {
      params: dayParams("impressions"),
    }),
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
    // Lifetime audience (API limitation: no time-window support)
    axios.get(`${GRAPH}/${igUserId}/insights`, {
      params: lifetimeParams("audience_city"),
    }),
    axios.get(`${GRAPH}/${igUserId}/insights`, {
      params: lifetimeParams("audience_country"),
    }),
    axios.get(`${GRAPH}/${igUserId}/insights`, {
      params: lifetimeParams("audience_gender_age"),
    }),
    // Media list — increased to 25 for better top-content ranking
    axios.get(`${GRAPH}/${igUserId}/media`, {
      params: {
        fields:
          "id,caption,media_type,media_product_type,thumbnail_url,media_url,permalink,timestamp,like_count,comments_count",
        limit: 25,
        access_token: token,
      },
    }),
  ]);

  console.log({
    profileResult,
    reachResult,
    impressionsResult,
    profileViewsResult,
    followerCountResult,
    cityResult,
    countryResult,
    genderAgeResult,
    mediaResult,
  });

  // Profile is required — throw if it failed
  const profileRes = settled(profileResult, "profile");
  if (!profileRes) throw new Error("Failed to fetch Instagram profile");

  const reachRes = settled(reachResult, "reach");
  const impressionsRes = settled(impressionsResult, "impressions");
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
  const cityRes = settled(cityResult, "audience_city");
  const countryRes = settled(countryResult, "audience_country");
  const genderAgeRes = settled(genderAgeResult, "audience_gender_age");
  const mediaRes = settled(mediaResult, "media");

  // console.log(
  //   "[Instagram Analytics] Raw profile:",
  //   JSON.stringify(profileRes.data, null, 2),
  // );
  // console.log(
  //   "[Instagram Analytics] reach data:",
  //   JSON.stringify(reachRes?.data, null, 2),
  // );
  // console.log(
  //   "[Instagram Analytics] impressions data:",
  //   JSON.stringify(impressionsRes?.data, null, 2),
  // );
  // console.log(
  //   "[Instagram Analytics] profile_views data:",
  //   JSON.stringify(profileViewsRes?.data, null, 2),
  // );
  // console.log(
  //   "[Instagram Analytics] follower_count data:",
  //   JSON.stringify(followerCountRes?.data, null, 2),
  // );
  // console.log(
  //   "[Instagram Analytics] audience_city data:",
  //   JSON.stringify(cityRes?.data, null, 2),
  // );
  // console.log(
  //   "[Instagram Analytics] audience_country data:",
  //   JSON.stringify(countryRes?.data, null, 2),
  // );
  // console.log(
  //   "[Instagram Analytics] audience_gender_age data:",
  //   JSON.stringify(genderAgeRes?.data, null, 2),
  // );
  // console.log(
  //   "[Instagram Analytics] media data:",
  //   JSON.stringify(mediaRes?.data, null, 2),
  // );

  const profile = profileRes.data;

  // ── Current-period totals ─────────────────────────────────────────────────
  const reach30d = reachRes ? sumValues(reachRes.data) : 0;
  const impressions30d = impressionsRes ? sumValues(impressionsRes.data) : 0;
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

  // ── Audience demographics (lifetime — no time-window available in API) ────
  const citiesRaw: Record<string, number> =
    cityRes?.data?.data?.[0]?.value ?? {};
  const topCities = Object.entries(citiesRaw)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const countriesRaw: Record<string, number> =
    countryRes?.data?.data?.[0]?.value ?? {};
  const topCountries = Object.entries(countriesRaw)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Split "M.18-24" keys into separate gender and age-range distributions
  const genderAgeRaw: Record<string, number> =
    genderAgeRes?.data?.data?.[0]?.value ?? {};
  const genderTotals: Record<string, number> = {};
  const ageTotals: Record<string, number> = {};
  for (const [key, val] of Object.entries(genderAgeRaw)) {
    const dot = key.indexOf(".");
    const gender = dot === -1 ? key : key.slice(0, dot);
    const age = dot === -1 ? "Unknown" : key.slice(dot + 1);
    genderTotals[gender] = (genderTotals[gender] ?? 0) + val;
    ageTotals[age] = (ageTotals[age] ?? 0) + val;
  }
  const genderBreakdown = Object.entries(genderTotals)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
  const ageBreakdown = Object.entries(ageTotals)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  // ── Per-media insights (shares, reposts, plays, impressions per post) ─────
  const mediaList: any[] = mediaRes?.data?.data ?? [];

  const mediaInsightsResults = await Promise.allSettled(
    mediaList.map((post: any) => {
      // Reels support `plays` but NOT `impressions`.
      // Images/Carousels/Videos support `impressions` but NOT `plays`.
      const isReel = post.media_product_type === "REEL";
      return axios.get(`${GRAPH}/${post.id}/insights`, {
        params: {
          metric: [
            isReel ? "plays" : "impressions",
            "reach",
            "saved",
            "shares",
            "total_interactions",
          ].join(","),
          access_token: token,
        },
      });
    }),
  );

  const getMetric = (insightData: any[], name: string): number =>
    insightData.find((m: any) => m.name === name)?.values?.[0]?.value ?? 0;

  const posts = mediaList.map((post: any, i) => {
    const isReel = post.media_product_type === "REEL";
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
      // `impressions` holds the primary view metric for the post type:
      // plays for Reels, impressions for everything else.
      impressions: getMetric(ins, isReel ? "plays" : "impressions"),
      reach: getMetric(ins, "reach"),
      saved: getMetric(ins, "saved"),
      shares: getMetric(ins, "shares"),
      total_interactions: getMetric(ins, "total_interactions"),
    };
  });

  // Top content by reach; top reels by engagement
  const topContentByViews = [...posts]
    .sort((a, b) => b.reach - a.reach)
    .slice(0, 5);
  const topReelsByEngagement = [...posts]
    .filter((p) => p.media_type === "VIDEO" || p.media_product_type === "REEL")
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
    impressions_30d: impressions30d,
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
    // Audience (lifetime snapshot — same for views/interactions/followers)
    top_cities: topCities,
    top_countries: topCountries,
    // Combined "M.18-24" format kept for ProfilePreview audience rendering
    gender_age: Object.entries(genderAgeRaw)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10),
    gender_breakdown: genderBreakdown,
    age_breakdown: ageBreakdown,
    // All posts (for any additional client-side ranking)
    posts,
  };

  console.log(
    "[Instagram Analytics] Final analyticsData:",
    JSON.stringify(analyticsData, null, 2),
  );

  const insight = await saveInsight(
    userId,
    accountId,
    "instagram",
    analyticsData,
    reach30d,
  );
  await linkInsightToUserData(userId, "instagram", insight._id.toString());
  console.log("[Instagram Analytics] Saved insight successfully.");

  return analyticsData;
}
