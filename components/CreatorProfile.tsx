"use client";

import { useState } from "react";

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

const COUNTRY_NAMES: Record<string, string> = {
  IN: "India",
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  BR: "Brazil",
  JP: "Japan",
  SG: "Singapore",
  AE: "UAE",
  PK: "Pakistan",
  NZ: "New Zealand",
  ZA: "South Africa",
  MX: "Mexico",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  SE: "Sweden",
  NO: "Norway",
};

/* ── Pie chart ───────────────────────────────────────────────────────────── */

function PieChart({
  segments,
}: {
  segments: { color: string; pct: number }[];
}) {
  const r = 36,
    cx = 40,
    cy = 40;
  let angle = -Math.PI / 2;
  const arcs = segments
    .filter((s) => s.pct > 0)
    .map((seg) => {
      const sweep = (seg.pct / 100) * 2 * Math.PI;
      const x1 = cx + r * Math.cos(angle);
      const y1 = cy + r * Math.sin(angle);
      angle += sweep;
      const x2 = cx + r * Math.cos(angle);
      const y2 = cy + r * Math.sin(angle);
      const large = sweep > Math.PI ? 1 : 0;
      return {
        color: seg.color,
        path: `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`,
      };
    });
  return (
    <svg viewBox="0 0 80 80" className="w-24 h-24 shrink-0">
      {arcs.map((a, i) => (
        <path key={i} d={a.path} fill={a.color} />
      ))}
    </svg>
  );
}

const TAG_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-green-100 text-green-700",
  "bg-pink-100 text-pink-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-teal-100 text-teal-700",
];

/* ── Prop types ──────────────────────────────────────────────────────────── */

export interface Package {
  id: number;
  title: string;
  description: string;
  price: string;
  popular: boolean;
}

export interface Collaboration {
  id: number;
  brand: string;
  campaign: string;
  featured: boolean;
  contribution?: string;
  views?: string;
  engagement?: string;
  reach?: string;
  conversions?: string;
}

export interface Stats {
  followers?: number | null;
  avgViews?: number | null;
  engagement?: number | null;
  avgReach?: number | null;
  growth?: number | null;
}

export interface AudienceInsights {
  gender_age?: { label: string; value: number }[];
  top_countries?: { country: string; count: number }[];
  top_cities?: { city: string; count: number }[];
}

export interface PostItem {
  id: string;
  caption?: string;
  media_type?: string;
  like_count?: number;
  comments_count?: number;
  thumbnail_url?: string | null;
  media_url?: string | null;
}

export interface CreatorProfileProps {
  name?: string;
  handle?: string;
  tagline?: string;
  location?: string;
  profilePic?: string | null;
  stats?: Stats;
  insights?: AudienceInsights;
  posts?: PostItem[];
  availableForCollabs?: boolean;
  nicheTags?: string[];
  packages?: Package[];
  collabs?: Collaboration[];
  prefIndustries?: string[];
  restrictedIndustries?: string[];
  deliverables?: string[];
  turnaround?: string;
}

/* ── Component ───────────────────────────────────────────────────────────── */

export function CreatorProfile({
  name = "Sarah Johnson",
  handle = "sarahjcreates",
  tagline = "Lifestyle & Wellness Creator | Inspiring authentic living through mindful content",
  location = "India",
  profilePic,
  stats = {},
  insights = {},
  posts,
  availableForCollabs = true,
  nicheTags = ["Lifestyle", "Wellness", "Beauty", "Travel"],
  packages = [
    {
      id: 1,
      title: "Instagram Reel",
      description: "Single Instagram Reel with full rights",
      price: "$2,500",
      popular: false,
    },
    {
      id: 2,
      title: "Instagram Story",
      description: "Story series (3–5 frames)",
      price: "$800",
      popular: false,
    },
    {
      id: 3,
      title: "YouTube Video",
      description: "Dedicated or integrated video",
      price: "$5,000",
      popular: true,
    },
    {
      id: 4,
      title: "Campaign Bundle",
      description: "Multi-platform package",
      price: "Request Price",
      popular: false,
    },
  ],
  collabs = [
    {
      id: 1,
      brand: "GlowBeauty Co.",
      campaign: "Product Launch — New Skincare Line",
      featured: true,
      contribution:
        "Created 3 Instagram Reels and 1 YouTube review showcasing the complete skincare routine with before/after results over 30 days",
      views: "2.1M",
      engagement: "12.4%",
      reach: "1.8M",
      conversions: "15K+",
    },
    {
      id: 2,
      brand: "FitLife Nutrition",
      campaign: "Brand Awareness Campaign",
      featured: false,
      contribution:
        "Developed 5-part series on wellness journey including workout routines and nutrition tips featuring brand products",
      views: "1.5M",
      engagement: "9.8%",
      reach: "1.2M",
    },
    {
      id: 3,
      brand: "TravelEase Luggage",
      campaign: "Holiday Sales Campaign",
      featured: false,
      contribution:
        "Travel vlogs featuring luggage across 3 destinations, highlighting durability and features",
      views: "980K",
      engagement: "11.2%",
      conversions: "8K+",
    },
    {
      id: 4,
      brand: "EcoHome Essentials",
      campaign: "Sustainable Living Awareness",
      featured: true,
      contribution:
        "Home transformation series showcasing eco-friendly products and sustainable lifestyle changes",
      views: "720K",
      engagement: "10.5%",
      reach: "650K",
    },
  ],
  prefIndustries = [
    "Beauty & Cosmetics",
    "Health & Wellness",
    "Fashion",
    "Travel",
    "Home & Lifestyle",
    "Food & Beverage",
  ],
  restrictedIndustries = ["Alcohol", "Tobacco", "Gambling", "Political"],
  deliverables = [
    "Instagram Reels",
    "Instagram Posts",
    "Instagram Stories",
    "YouTube Videos",
    "UGC Content",
    "Product Photography",
  ],
  turnaround = "7-10 days",
}: CreatorProfileProps) {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const initial = name.trim() ? name.trim()[0].toUpperCase() : "?";
  const sortedCollabs = [...collabs].sort(
    (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0),
  );
  const visiblePackages = packages.slice(0, 4);

  return (
    <div className="text-sm font-sans max-w-5xl p-6">
      {/* Profile header */}
      <div className="flex items-center gap-5 mb-6">
        {profilePic ? (
          <img
            src={profilePic}
            alt={name}
            className="w-28 h-28 rounded-full object-cover border-2 border-violet-300 shrink-0"
          />
        ) : (
          <div className="w-28 h-28 rounded-full border-2 border-violet-300 flex items-center justify-center bg-white text-violet-600 font-bold text-2xl shrink-0">
            {initial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className="font-bold text-gray-900 text-base block">
            {name || "Your name"}
          </span>
          <p className="text-primary text-sm">@{handle || "yourhandle"}</p>
          <p className="text-gray-500 text-sm leading-snug mt-1">
            {tagline
              ? tagline.split("\n").map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))
              : "Your tagline will appear here"}
          </p>
        </div>
      </div>

      {/* Niche tags */}
      {nicheTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {nicheTags.map((label, i) => (
            <span
              key={label}
              className={`text-xs px-3 py-1 rounded-full font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Location + collab status */}
      <div className="flex items-center gap-3 text-sm text-gray-500 mb-5 flex-wrap">
        {location && <span>📍 {location}</span>}
        {availableForCollabs && (
          <span className="text-green-600 font-medium flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path
                d="M2.5 6L5 8.5L9.5 3.5"
                stroke="#16A34A"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Available for collaborations
          </span>
        )}
      </div>

      {/* Analytics grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: "Total Followers", value: fmt(stats.followers), icon: "👥" },
          { label: "Avg Views", value: fmt(stats.avgViews), icon: "👁" },
          {
            label: "Engagement",
            value: stats.engagement != null ? `${stats.engagement}%` : "—",
            icon: "💬",
          },
          { label: "Avg Reach", value: fmt(stats.avgReach), icon: "📊" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="border border-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <span>{icon}</span> {label}
            </p>
            <p className="font-bold text-gray-900 text-xl leading-tight mt-1">
              {value}
            </p>
          </div>
        ))}
        <div className="col-span-2 border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <span>🚀</span> Growth Rate (30d)
          </p>
          <p className="font-bold text-gray-900 text-xl mt-1">
            {stats.growth != null ? `+${fmt(stats.growth)}` : "—"}
          </p>
        </div>
      </div>

      {/* Audience Insights */}
      {(() => {
        const genderAgeData = insights.gender_age ?? [];
        const countriesData = insights.top_countries ?? [];

        // Aggregate gender totals from combined "M.18-24" labels
        const gTotals: Record<string, number> = { F: 0, M: 0, U: 0 };
        for (const item of genderAgeData) {
          const g = item.label.split(".")[0];
          gTotals[g] = (gTotals[g] ?? 0) + item.value;
        }
        const gTotal = gTotals.F + gTotals.M + (gTotals.U ?? 0);
        const genderSegments =
          gTotal > 0
            ? [
                {
                  color: "#7C3AED",
                  label: "Female",
                  pct: Math.round((gTotals.F / gTotal) * 100),
                },
                {
                  color: "#EC4899",
                  label: "Male",
                  pct: Math.round((gTotals.M / gTotal) * 100),
                },
                {
                  color: "#D1D5DB",
                  label: "Other",
                  pct: Math.round(((gTotals.U ?? 0) / gTotal) * 100),
                },
              ].filter((s) => s.pct > 0)
            : [];

        // Aggregate age groups
        const ageTotals: Record<string, number> = {};
        for (const item of genderAgeData) {
          const age = item.label.split(".")[1];
          if (age) ageTotals[age] = (ageTotals[age] ?? 0) + item.value;
        }
        const ageTotal = Object.values(ageTotals).reduce((a, b) => a + b, 0);
        const ageGroups = Object.entries(ageTotals)
          .sort((a, b) => (parseInt(a[0]) || 0) - (parseInt(b[0]) || 0))
          .map(([age, count]) => ({
            age,
            pct: ageTotal ? Math.round((count / ageTotal) * 100) : 0,
          }));

        // Countries with percentages
        const countryTotal = countriesData.reduce((a, c) => a + c.count, 0);
        const countryRows = countriesData.map((c) => ({
          name: COUNTRY_NAMES[c.country] ?? c.country,
          pct: countryTotal ? Math.round((c.count / countryTotal) * 100) : 0,
        }));

        const hasData = genderAgeData.length > 0 || countriesData.length > 0;

        const displayGender = hasData
          ? genderSegments
          : [
              { color: "#7C3AED", label: "Female", pct: 68 },
              { color: "#EC4899", label: "Male", pct: 30 },
              { color: "#D1D5DB", label: "Other", pct: 2 },
            ];
        const displayAgeGroups = hasData
          ? ageGroups
          : [
              { age: "18-24", pct: 33 },
              { age: "25-34", pct: 40 },
              { age: "35-44", pct: 18 },
              { age: "45+", pct: 9 },
            ];
        const displayCountryRows = hasData
          ? countryRows
          : [
              { name: "India", pct: 45 },
              { name: "United States", pct: 20 },
              { name: "United Kingdom", pct: 12 },
              { name: "Canada", pct: 8 },
            ];
        const displayMaxAgePct = Math.max(
          ...displayAgeGroups.map((g) => g.pct),
          1,
        );

        return (
          <div className="mb-6">
            <p className="font-semibold text-gray-900 text-base mb-4">
              Audience Insights
            </p>
            <>
              {/* Row 1: Gender + Age */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-3">
                    👥 Gender
                  </p>
                  <div className="flex items-center gap-3">
                    <PieChart segments={displayGender} />
                    <div className="space-y-1.5">
                      {displayGender.map((s) => (
                        <div
                          key={s.label}
                          className="flex items-center gap-1.5"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ background: s.color }}
                          />
                          <span className="text-xs text-gray-600">
                            {s.label} {s.pct}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-3">
                    📊 Age Groups
                  </p>
                  <div className="flex items-end gap-1.5 h-16">
                    {displayAgeGroups.map(({ age, pct }) => (
                      <div
                        key={age}
                        className="flex flex-col items-center gap-1 flex-1"
                      >
                        <div
                          className="w-full bg-violet-500 rounded-t-sm min-h-[2px]"
                          style={{
                            height: `${Math.round((pct / displayMaxAgePct) * 48)}px`,
                          }}
                        />
                        <span className="text-[9px] text-gray-400 leading-none">
                          {age}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Locations + Interests */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-3">
                    📍 Top Locations
                  </p>
                  <div className="space-y-2">
                    {displayCountryRows.map((c) => (
                      <div key={c.name}>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span className="truncate">{c.name}</span>
                          <span className="shrink-0 ml-1">{c.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-1.5 bg-violet-500 rounded-full"
                            style={{ width: `${c.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-3">
                    ✨ Interests
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {nicheTags.length > 0 ? (
                      nicheTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">No tags</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          </div>
        );
      })()}

      {/* Content Showcase */}
      {(() => {
        const displayPosts = posts && posts.length > 0 ? posts.slice(0, 3) : [];

        const typeLabel = (t?: string) => {
          if (t === "REELS") return "Reel";
          if (t === "VIDEO") return "Video";
          if (t === "CAROUSEL_ALBUM") return "Album";
          return "Post";
        };

        if (displayPosts.length === 0) return null;

        return (
          <div className="mb-6">
            <p className="font-semibold text-gray-900 text-base mb-1">
              Content Showcase
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Best performing content
            </p>
            <div className="grid grid-cols-3 gap-3">
              {displayPosts.map((post) => {
                const thumb =
                  post.thumbnail_url ??
                  (post.media_type === "IMAGE" ||
                  post.media_type === "CAROUSEL_ALBUM"
                    ? post.media_url
                    : null);
                return (
                  <div key={post.id} className="flex flex-col gap-1.5">
                    <div className="rounded-xl overflow-hidden aspect-square bg-gradient-to-br from-violet-100 to-pink-100 relative">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <rect
                              x="2"
                              y="2"
                              width="20"
                              height="20"
                              rx="5"
                              stroke="#C4B5FD"
                              strokeWidth="1.5"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="4"
                              stroke="#C4B5FD"
                              strokeWidth="1.5"
                            />
                            <circle cx="17.5" cy="6.5" r="1" fill="#C4B5FD" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      {typeLabel(post.media_type)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="flex items-center gap-0.5">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                            stroke="#9CA3AF"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {fmt(post.like_count)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                            stroke="#9CA3AF"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {fmt(post.comments_count)}
                      </span>
                    </div>
                    {post.caption && (
                      <p className="text-xs text-gray-500 leading-tight line-clamp-2">
                        {post.caption}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Past Collaborations */}
      {sortedCollabs.length > 0 && (
        <div className="mb-6">
          <p className="font-semibold text-gray-900 text-base mb-1">
            Past Collaborations
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Proven results with top brands
          </p>
          <div className="grid grid-cols-2 gap-3">
            {sortedCollabs.map(
              ({
                id,
                brand,
                campaign,
                featured,
                contribution,
                views,
                engagement,
                reach,
                conversions,
              }) => (
                <div
                  key={id}
                  className={`rounded-xl p-4 flex flex-col gap-2.5 ${featured ? "border-2 border-violet-500" : "border border-gray-100"}`}
                >
                  {featured && (
                    <div className="flex items-center gap-1 text-violet-600">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
                          stroke="#7C3AED"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-xs font-semibold">
                        Featured Campaign
                      </span>
                    </div>
                  )}
                  <div className="flex items-start gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center text-violet-600 text-sm font-bold shrink-0 border border-violet-100">
                      {brand ? brand[0].toUpperCase() : "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm leading-tight truncate">
                        {brand || "Brand"}
                      </p>
                      <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="#9CA3AF"
                            strokeWidth="2"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="#9CA3AF"
                            strokeWidth="2"
                          />
                        </svg>
                        {campaign}
                      </p>
                    </div>
                  </div>
                  {contribution && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-0.5">
                        Contribution:
                      </p>
                      <p className="text-xs text-gray-500 leading-snug line-clamp-3">
                        {contribution}
                      </p>
                    </div>
                  )}
                  {(views || engagement || reach || conversions) && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {views && (
                        <div className="bg-blue-50 rounded-lg p-2">
                          <p className="text-[10px] text-blue-500 font-medium">
                            Views
                          </p>
                          <p className="text-xs font-bold text-gray-900">
                            {views}
                          </p>
                        </div>
                      )}
                      {engagement && (
                        <div className="bg-pink-50 rounded-lg p-2">
                          <p className="text-[10px] text-pink-500 font-medium">
                            Engagement
                          </p>
                          <p className="text-xs font-bold text-gray-900">
                            {engagement}
                          </p>
                        </div>
                      )}
                      {reach && (
                        <div className="bg-blue-50 rounded-lg p-2">
                          <p className="text-[10px] text-blue-500 font-medium">
                            Reach
                          </p>
                          <p className="text-xs font-bold text-gray-900">
                            {reach}
                          </p>
                        </div>
                      )}
                      {conversions && (
                        <div className="bg-green-50 rounded-lg p-2">
                          <p className="text-[10px] text-green-600 font-medium">
                            Conversions
                          </p>
                          <p className="text-xs font-bold text-gray-900">
                            {conversions}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* Collaboration Preferences */}
      {(prefIndustries.length > 0 ||
        restrictedIndustries.length > 0 ||
        deliverables.length > 0 ||
        turnaround) && (
        <div className="border border-gray-100 rounded-xl p-4 mb-6">
          <p className="font-semibold text-gray-900 text-sm mb-4">
            Collaboration Preferences
          </p>
          {(prefIndustries.length > 0 || restrictedIndustries.length > 0) && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {prefIndustries.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="#16A34A"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="text-xs font-semibold text-gray-700">
                      Preferred Industries
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {prefIndustries.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] border border-green-300 text-green-700 px-2 py-0.5 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {restrictedIndustries.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M18 6L6 18M6 6l12 12"
                        stroke="#DC2626"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <p className="text-xs font-semibold text-gray-700">
                      Restricted Industries
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {restrictedIndustries.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] border border-red-200 text-red-500 px-2 py-0.5 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {(deliverables.length > 0 || turnaround) && (
            <div className="grid grid-cols-2 gap-4">
              {deliverables.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
                        stroke="#7C3AED"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <p className="text-xs font-semibold text-gray-700">
                      Deliverables Offered
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-1.5 gap-y-1.5">
                    {deliverables.map((d) => (
                      <div
                        key={d}
                        className="flex items-center gap-1.5 bg-violet-50 rounded-lg px-2 py-1.5"
                      >
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M20 6L9 17l-5-5"
                            stroke="#7C3AED"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="text-[10px] text-gray-600 truncate">
                          {d}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {turnaround && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="#3B82F6"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M12 6v6l4 2"
                        stroke="#3B82F6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <p className="text-xs font-semibold text-gray-700">
                      Turnaround Time
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="font-bold text-gray-900 text-base">
                      {turnaround}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Average delivery time
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Client Testimonials */}
      {(() => {
        const TESTIMONIALS = [
          {
            brand: "GlowBeauty Co.",
            role: "Emily Chen · Marketing Director",
            quote:
              "Working with this creator was an absolute dream! Their content exceeded our expectations and drove incredible engagement. The authenticity they bring to every collaboration is unmatched.",
            stars: 5,
          },
          {
            brand: "FitLife Nutrition",
            role: "James Park · Brand Manager",
            quote:
              "Incredible ROI on our campaign. The content was authentic, on-brand, and drove real conversions. Would collaborate again without hesitation.",
            stars: 5,
          },
          {
            brand: "TravelEase Luggage",
            role: "Sofia Reyes · CMO",
            quote:
              "One of the most professional creators we've worked with. Delivered ahead of schedule and the storytelling was genuinely compelling.",
            stars: 5,
          },
        ];
        const t = TESTIMONIALS[testimonialIdx];
        const prev = () =>
          setTestimonialIdx(
            (i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length,
          );
        const next = () =>
          setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length);
        return (
          <div className="mb-6">
            <p className="font-semibold text-gray-900 text-base mb-1">
              Client Testimonials
            </p>
            <p className="text-xs text-gray-400 mb-4">
              What brands say about working together
            </p>
            <div className="border border-gray-100 rounded-xl p-5 bg-gradient-to-b from-white to-violet-50/30">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white font-bold text-base mb-2">
                  {t.brand[0]}
                </div>
                <p className="text-sm font-semibold text-gray-900">{t.brand}</p>
                <p className="text-xs text-gray-400 mb-2">{t.role}</p>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <svg
                      key={i}
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="#F59E0B"
                    >
                      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  onClick={prev}
                  className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:border-violet-400 transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M15 18l-6-6 6-6"
                      stroke="#6B7280"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="flex gap-1.5">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTestimonialIdx(i)}
                      className={`rounded-full transition-all ${i === testimonialIdx ? "w-4 h-1.5 bg-violet-500" : "w-1.5 h-1.5 bg-gray-200"}`}
                    />
                  ))}
                </div>
                <button
                  onClick={next}
                  className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:border-violet-400 transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 18l6-6-6-6"
                      stroke="#6B7280"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Packages */}
      {visiblePackages.length > 0 && (
        <>
          <p className="font-semibold text-gray-900 text-base mb-4">
            Packages &amp; Pricing
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {visiblePackages.map(
              ({ id, title, description, price, popular }) => (
                <div
                  key={id}
                  className="border border-gray-100 rounded-xl p-4 relative"
                >
                  {popular && (
                    <span className="absolute -top-2 left-3 text-[10px] font-semibold bg-amber-400 text-white px-2 py-0.5 rounded-full">
                      POPULAR
                    </span>
                  )}
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {title || "Package"}
                  </p>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">
                    {description}
                  </p>
                  <p className="font-bold text-primary text-base mt-2">
                    {price || "—"}
                  </p>
                </div>
              ),
            )}
          </div>
        </>
      )}

      {/* CTA footer */}
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}
      >
        <p className="font-bold text-white text-base">
          Ready to Start Collaborating?
        </p>
        <p className="text-white/80 text-xs mt-1 mb-4">
          Let&apos;s create something amazing together. Send an offer or get in
          touch right now.
        </p>
        <div className="flex gap-2 justify-center">
          <button className="bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg">
            Send Collaboration Offer
          </button>
          <button className="bg-white text-violet-700 text-sm font-medium px-4 py-2 rounded-lg">
            Contact Creator
          </button>
        </div>
      </div>
    </div>
  );
}
