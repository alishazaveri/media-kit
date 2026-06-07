import { notFound } from "next/navigation";
import { getUserByUsername } from "@/db/user.db";
import { getSocialChannelByPlatform } from "@/db/social_channel.db";
import { getUserData } from "@/db/user_data.db";
import { getInsightBySocialChannel } from "@/db/insight.db";
import { getCustomization } from "@/db/customization.db";
import { getThemeByIdentifier } from "@/constants/themes";
import { CreatorProfile } from "@/components/CreatorProfile";

export default async function PublishedProfilePage(props: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await props.params;

  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  const userId = (user as any)._id.toString();

  const channel = await getSocialChannelByPlatform(userId, "instagram");

  if (!channel) {
    return <WipPage username={username} />;
  }

  const [userData, insight, customization] = await Promise.all([
    getUserData(userId, "profile"),
    getInsightBySocialChannel((channel as any)._id.toString()),
    getCustomization(userId, "published"),
  ]);

  const themeIdentifier = (customization as any)?.theme_identifier;
  const resolved = themeIdentifier ? getThemeByIdentifier(themeIdentifier) : undefined;
  const theme = resolved
    ? { accent_color: resolved.accent_color, base_color: resolved.base_color, contrast_color: resolved.contrast_color }
    : undefined;

  const published: Record<string, any> =
    (userData as any)?.published_data ?? {};

  if (!Object.keys(published).length) {
    return <WipPage username={username} />;
  }

  const ig: Record<string, any> = (insight as any)?.data ?? {};

  const postCount = ig.post_count || (Array.isArray(ig.posts) ? ig.posts.length : 0);
  const engagementRate =
    ig.followers_count && postCount
      ? +(
          (((ig.total_likes ?? 0) + (ig.total_comments ?? 0)) /
            (ig.followers_count * postCount)) *
          100
        ).toFixed(1)
      : null;

  console.log({ userData });

  return (
    <main className="min-h-screen ">
      <CreatorProfile
        name={published.display_name ?? ig.name}
        handle={ig.username ?? username}
        tagline={published.tagline ?? ig.biography}
        location={published.location}
        profilePic={published.profile_pic ?? (user as any).profile_image_url ?? ig.profile_pic ?? null}
        stats={{
          followers: ig.followers_count ?? null,
          avgViews: ig.impressions_30d || null,
          engagement: engagementRate,
          avgReach: ig.reach_30d || null,
          growth: ig.follower_gain_30d || null,
        }}
        insights={{
          gender_age: Array.isArray(ig.gender_age) ? ig.gender_age : [],
          top_countries: Array.isArray(ig.top_countries)
            ? ig.top_countries
            : [],
          top_cities: Array.isArray(ig.top_cities) ? ig.top_cities : [],
        }}
        posts={
          Array.isArray(published.posts) && published.posts.length > 0
            ? published.posts
            : Array.isArray(ig.posts)
              ? ig.posts.slice(0, 4)
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
      />
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
