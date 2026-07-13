import { getDefaultPackages } from "@/lib/default-packages";
import type { CreatorProfileProps } from "@/components/CreatorProfile";

export function buildProfilePreviewProps(
  ig: Record<string, any>,
  draft: Record<string, any>,
  appUsername?: string,
): CreatorProfileProps {
  const engagementRate =
    ig.followers_count && ig.post_count
      ? +(
          (((ig.total_likes ?? 0) + (ig.total_comments ?? 0)) /
            (ig.followers_count * ig.post_count)) *
          100
        ).toFixed(1)
      : null;

  return {
    name: draft.display_name || ig.name || "",
    handle: ig.username ?? appUsername ?? "",
    tagline: draft.tagline || ig.biography || "",
    location: draft.location ?? "",
    email: draft.display_email ?? "",
    profilePic: draft.profile_pic ?? ig.profile_pic ?? null,
    availableForCollabs: draft.available_for_collabs ?? true,
    nicheTags: Array.isArray(draft.niche_tags) ? draft.niche_tags : [],
    collabs: Array.isArray(draft.collabs) ? draft.collabs : [],
    prefIndustries: Array.isArray(draft.pref_industries)
      ? draft.pref_industries
      : [],
    restrictedIndustries: Array.isArray(draft.restricted_industries)
      ? draft.restricted_industries
      : [],
    deliverables: Array.isArray(draft.deliverables) ? draft.deliverables : [],
    turnaround: draft.turnaround ?? "",
    servicesVisible: draft.services_visible ?? true,
    receiptsVisible: draft.receipts_visible ?? true,
    theme: draft.theme ?? null,
    stats: {
      followers: ig.followers_count ?? null,
      avgViews: ig.impressions_30d || null,
      engagement: engagementRate,
      avgReach: ig.reach_30d || null,
      growth: ig.follower_gain_30d || null,
      reach_daily_30d:
        ig.reach_daily_30d && typeof ig.reach_daily_30d === "object"
          ? ig.reach_daily_30d
          : null,
    },
    insights: {
      gender_age: Array.isArray(ig.gender_age) ? ig.gender_age : [],
      top_countries: Array.isArray(ig.top_countries) ? ig.top_countries : [],
      top_cities: Array.isArray(ig.top_cities) ? ig.top_cities : [],
      age_breakdown: Array.isArray(ig.age_breakdown) ? ig.age_breakdown : [],
      gender_breakdown: Array.isArray(ig.gender_breakdown)
        ? ig.gender_breakdown
        : [],
    },
    posts:
      Array.isArray(draft.featured_posts) && draft.featured_posts.length > 0
        ? draft.featured_posts
        : Array.isArray(ig.top_content_by_views) &&
            ig.top_content_by_views.length > 0
          ? ig.top_content_by_views.slice(0, 4).map((p: any) => ({
              id: p.id,
              caption: p.caption,
              media_type: p.media_type,
              thumbnail_url: p.thumbnail_url ?? null,
              media_url: p.media_url ?? null,
              permalink: p.permalink ?? null,
              like_count: p.like_count,
              comments_count: p.comments_count,
              view_count: p.impressions,
            }))
          : Array.isArray(draft.posts) && draft.posts.length > 0
            ? draft.posts
            : [],
    packages:
      Array.isArray(draft.packages) && draft.packages.length
        ? draft.packages
        : getDefaultPackages(ig.followers_count ?? 0),
  };
}
