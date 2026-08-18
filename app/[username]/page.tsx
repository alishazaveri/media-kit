import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { getUserByUsername } from "@/db/user.db";
import { getSocialChannelByPlatform } from "@/db/social_channel.db";
import { getUserData } from "@/db/user_data.db";
import { getInsightBySocialChannel } from "@/db/insight.db";
import { getCustomization } from "@/db/customization.db";
import { getSubscriptionsByUserId } from "@/db/subscription.db";
import { getThemeByIdentifier } from "@/constants/themes";
import { CreatorProfile } from "@/components/CreatorProfile";
import isLinkActive from "@/lib/isLinkActive";

function fmtFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export async function generateMetadata(
  props: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username } = await props.params;
  const headersList = await headers();
  const host = headersList.get("host") ?? "kloot.io";
  const metadataBase = new URL(host.startsWith("localhost") ? `http://${host}` : `https://${host}`);

  const fallback = (title: string): Metadata => ({
    metadataBase,
    title,
    robots: { index: false },
  });

  const user = await getUserByUsername(username);
  if (!user) return fallback("Creator Not Found | Kloot");

  const userId = (user as any)._id.toString();
  const active = await isLinkActive(userId);
  if (!active) return fallback(`@${username} | Kloot`);

  const [channel, userData] = await Promise.all([
    getSocialChannelByPlatform(userId, "instagram"),
    getUserData(userId, "profile"),
  ]);

  const published: Record<string, any> = (userData as any)?.published_data ?? {};
  if (!Object.keys(published).length) return fallback(`@${username} | Kloot`);

  const channelId = channel ? (channel as any)._id.toString() : null;
  const insight = channelId ? await getInsightBySocialChannel(channelId) : null;
  const ig: Record<string, any> = (insight as any)?.data ?? {};

  const name     = published.display_name ?? ig.name ?? username;
  const handle   = ig.username ?? username;
  const tagline  = published.tagline ?? null;
  const location = published.location ?? null;
  const niches   = (Array.isArray(published.niche_tags) ? published.niche_tags : []).slice(0, 2);
  const followers = ig.followers_count ? fmtFollowers(ig.followers_count) : null;

  const title = `${name} (@${handle}) — Creator Media Kit | Kloot`;

  const parts: string[] = [];
  if (niches.length)  parts.push(niches.join(" & ") + " creator");
  else                parts.push("creator");
  if (location)       parts.push(`based in ${location}`);
  if (followers)      parts.push(`${followers} Instagram followers`);

  let description = `${name} is a ${parts.join(", ")}.`;
  if (tagline)        description += ` ${tagline}.`;
  description += " View their media kit on Kloot.";

  if (description.length > 160) description = description.slice(0, 157) + "…";

  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://kloot.io"}/${username}`;

  return {
    metadataBase,
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      siteName: "Kloot",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PublishedProfilePage(props: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await props.params;

  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  const userId = (user as any)._id.toString();

  const active = await isLinkActive(userId);
  if (!active) return <WipPage username={username} />;

  const channel = await getSocialChannelByPlatform(userId, "instagram");

  if (!channel) {
    return <WipPage username={username} />;
  }

  const [userData, insight, customization, subs] = await Promise.all([
    getUserData(userId, "profile"),
    getInsightBySocialChannel((channel as any)._id.toString()),
    getCustomization(userId, "published"),
    getSubscriptionsByUserId(userId),
  ]);

  const now = new Date();
  const trialEndsAt = (user as any).trial_ends_at ?? null;
  const activeSub = (subs as any[]).find(
    (s) => s.current_period_end && new Date(s.current_period_end) > now
  ) ?? null;
  const isPaidPlan = !!activeSub || !!(trialEndsAt && new Date(trialEndsAt) > now);

  const themeIdentifier = (customization as any)?.theme_identifier;
  const savedTheme = themeIdentifier ? getThemeByIdentifier(themeIdentifier) : undefined;
  const effectiveTheme = (!isPaidPlan && savedTheme?.is_premium)
    ? getThemeByIdentifier("default")
    : savedTheme;
  const theme = effectiveTheme
    ? {
        accent_color: effectiveTheme.accent_color,
        base_color: effectiveTheme.base_color,
        contrast_color: effectiveTheme.contrast_color,
        dark_mode: isPaidPlan ? ((customization as any)?.dark_mode ?? false) : false,
      }
    : undefined;

  const published: Record<string, any> =
    (userData as any)?.published_data ?? {};

  if (!Object.keys(published).length) {
    return <WipPage username={username} />;
  }

  const ig: Record<string, any> = (insight as any)?.data ?? {};

  const postCount =
    ig.post_count || (Array.isArray(ig.posts) ? ig.posts.length : 0);
  const engagementRate =
    ig.followers_count && postCount
      ? +(
          (((ig.total_likes ?? 0) + (ig.total_comments ?? 0)) /
            (ig.followers_count * postCount)) *
          100
        ).toFixed(1)
      : null;

  return (
    <main className="min-h-screen ">
      <CreatorProfile
        name={published.display_name ?? ig.name}
        handle={ig.username ?? username}
        tagline={published.tagline ?? ig.biography}
        location={published.location}
        profilePic={
          published.profile_pic ??
          (user as any).profile_image_url ??
          ig.profile_pic ??
          null
        }
        stats={{
          followers: ig.followers_count ?? null,
          avgViews: ig.impressions_30d || null,
          engagement: engagementRate,
          avgReach: ig.reach_30d || null,
          growth: ig.follower_gain_30d || null,
          reach_daily_30d: ig.reach_daily_30d && typeof ig.reach_daily_30d === "object" ? ig.reach_daily_30d : null,
        }}
        insights={{
          gender_age: Array.isArray(ig.gender_age) ? ig.gender_age : [],
          gender_breakdown: Array.isArray(ig.gender_breakdown) ? ig.gender_breakdown : [],
          age_breakdown: Array.isArray(ig.age_breakdown) ? ig.age_breakdown : [],
          top_countries: Array.isArray(ig.top_countries) ? ig.top_countries : [],
          top_cities: Array.isArray(ig.top_cities) ? ig.top_cities : [],
        }}
        posts={
          Array.isArray(published.posts) && published.posts.length > 0
            ? published.posts
            : Array.isArray(ig.top_content_by_views) && ig.top_content_by_views.length > 0
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
              : []
        }
        availableForCollabs={published.available_for_collabs ?? true}
        nicheTags={
          Array.isArray(published.niche_tags) ? published.niche_tags : []
        }
        packages={Array.isArray(published.packages) ? published.packages : []}
        collabs={Array.isArray(published.collabs) ? published.collabs : []}
        prefIndustries={
          Array.isArray(published.pref_industries)
            ? published.pref_industries
            : []
        }
        restrictedIndustries={
          Array.isArray(published.restricted_industries)
            ? published.restricted_industries
            : []
        }
        deliverables={
          Array.isArray(published.deliverables) ? published.deliverables : []
        }
        turnaround={published.turnaround ?? "7-10 days"}
        theme={theme}
        email={published.display_email ?? ""}
        servicesVisible={published.services_visible !== false}
        receiptsVisible={published.receipts_visible !== false}
        isPaidPlan={isPaidPlan}
      />
      {!isPaidPlan && (
        <a
          href="https://kloot.io"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 sm:bottom-10 sm:right-10 z-50 flex items-center gap-2 bg-white/40 backdrop-blur-md border border-white/30 shadow-md rounded-full px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-semibold text-gray-800 hover:bg-white transition-colors"
        >
          Made with
          <img src="/assets/images/logo/logo-transparent-slim.png" alt="Kloot" className="h-3.5 object-contain" />
        </a>
      )}
    </main>
  );
}

function WipPage({ username }: { username: string }) {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mb-6">
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="18" cy="18" r="14" stroke="#0D9488" strokeWidth="2.5" />
          <path
            d="M18 10v8l5 3"
            stroke="#0D9488"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        @{username}&apos;s profile is coming soon
      </h1>
      <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
        This creator is still setting up their Kloot profile. Check back soon!
      </p>
    </main>
  );
}
