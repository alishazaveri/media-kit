import axios from "axios";
import { getAccountById } from "@/db/account.db";
import { getValidInstagramToken } from "@/services/account.service";
import { saveAnalytics } from "@/services/analytics.service";
import instagramConnect from "@/lib/instagramConnect";

const GRAPH = "https://graph.instagram.com/v21.0";

const sumValues = (data: any): number =>
  data?.data?.[0]?.values?.reduce(
    (acc: number, v: any) => acc + (v.value || 0),
    0
  ) ?? 0;

export async function fetchAndSaveInstagramAnalytics(
  userId: string,
  accountId: string
) {
  const [account, token] = await Promise.all([
    getAccountById(accountId),
    getValidInstagramToken(userId),
  ]);

  if (!account) throw new Error("Account not found");

  const igUserId = account.platform_user_id;
  const since30 = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
  const now = Math.floor(Date.now() / 1000);

  const dayParams = (metric: string) => ({
    metric,
    period: "day",
    since: since30,
    until: now,
    access_token: token,
  });

  const lifetimeParams = (metric: string) => ({
    metric,
    period: "lifetime",
    access_token: token,
  });

  const [
    profileRes,
    reachRes,
    impressionsRes,
    profileViewsRes,
    followerCountRes,
    cityRes,
    countryRes,
    genderAgeRes,
    mediaRes,
  ] = await Promise.all([
    axios.get(`${GRAPH}/${igUserId}`, {
      params: { fields: instagramConnect.profileFields, access_token: token },
    }),
    axios.get(`${GRAPH}/${igUserId}/insights`, { params: dayParams("reach") }),
    axios.get(`${GRAPH}/${igUserId}/insights`, { params: dayParams("impressions") }),
    axios.get(`${GRAPH}/${igUserId}/insights`, { params: dayParams("profile_views") }),
    axios.get(`${GRAPH}/${igUserId}/insights`, { params: dayParams("follower_count") }),
    axios.get(`${GRAPH}/${igUserId}/insights`, { params: lifetimeParams("audience_city") }),
    axios.get(`${GRAPH}/${igUserId}/insights`, { params: lifetimeParams("audience_country") }),
    axios.get(`${GRAPH}/${igUserId}/insights`, { params: lifetimeParams("audience_gender_age") }),
    axios.get(`${GRAPH}/${igUserId}/media`, {
      params: {
        fields: "id,caption,media_type,timestamp,like_count,comments_count,saved_count",
        limit: 10,
        access_token: token,
      },
    }),
  ]);

  const profile = profileRes.data;

  // Follower gain over 30 days
  const followerValues = followerCountRes.data?.data?.[0]?.values ?? [];
  const followerGain =
    followerValues.length >= 2
      ? followerValues[followerValues.length - 1].value - followerValues[0].value
      : 0;

  // Audience breakdowns
  const genderAgeRaw = genderAgeRes.data?.data?.[0]?.value ?? {};
  const genderAge = Object.entries(genderAgeRaw)
    .map(([label, value]) => ({ label, value: value as number }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const citiesRaw = cityRes.data?.data?.[0]?.value ?? {};
  const topCities = Object.entries(citiesRaw)
    .map(([city, count]) => ({ city, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const countriesRaw = countryRes.data?.data?.[0]?.value ?? {};
  const topCountries = Object.entries(countriesRaw)
    .map(([country, count]) => ({ country, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Recent posts
  const posts = (mediaRes.data?.data ?? []).map((p: any) => ({
    id: p.id,
    caption: p.caption ?? "",
    media_type: p.media_type,
    timestamp: p.timestamp,
    like_count: p.like_count ?? 0,
    comments_count: p.comments_count ?? 0,
    saved_count: p.saved_count ?? 0,
  }));

  const reach30d = sumValues(reachRes.data);

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
    // 30-day insights
    reach_30d: reach30d,
    impressions_30d: sumValues(impressionsRes.data),
    profile_views_30d: sumValues(profileViewsRes.data),
    follower_gain_30d: followerGain,
    // Audience
    gender_age: genderAge,
    top_cities: topCities,
    top_countries: topCountries,
    // Posts
    posts,
    total_saved: posts.reduce((acc: number, p: any) => acc + p.saved_count, 0),
    total_likes: posts.reduce((acc: number, p: any) => acc + p.like_count, 0),
    total_comments: posts.reduce((acc: number, p: any) => acc + p.comments_count, 0),
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await saveAnalytics(userId, accountId, "instagram", today, analyticsData, reach30d);

  return analyticsData;
}
