"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { AppLogo } from "@/components/AppLogo";
import { ProfilePreview } from "@/components/ProfilePreview";

/* ─── Types ─── */
type Tab = "customize" | "plan" | "account";

interface Package {
  id: number;
  title: string;
  description: string;
  price: string;
  popular: boolean;
}

interface Collaboration {
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

/* ─── Nav icons ─── */
function CustomizeIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M3 9H15M9 3V15M5 5L13 13M13 5L5 13"
        stroke={active ? "#0D9488" : "#9CA3AF"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BillingIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect
        x="2"
        y="4"
        width="14"
        height="10"
        rx="2"
        stroke={active ? "#0D9488" : "#9CA3AF"}
        strokeWidth="1.5"
      />
      <path
        d="M2 8H16"
        stroke={active ? "#0D9488" : "#9CA3AF"}
        strokeWidth="1.5"
      />
    </svg>
  );
}

function AccountIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle
        cx="9"
        cy="6"
        r="3"
        stroke={active ? "#0D9488" : "#9CA3AF"}
        strokeWidth="1.5"
      />
      <path
        d="M2 16C2 13 5 11 9 11C13 11 16 13 16 16"
        stroke={active ? "#0D9488" : "#9CA3AF"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Tag pill ─── */
function TagPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-primary-hover ml-0.5">
        ×
      </button>
    </span>
  );
}

function RestrictedTagPill({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 bg-red-50 text-red-500 text-xs font-medium px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-red-700 ml-0.5">
        ×
      </button>
    </span>
  );
}

const ALL_NICHE_TAGS = [
  "Fashion",
  "Fitness",
  "Food",
  "Gaming",
  "Tech",
  "Finance",
];
const ALL_INDUSTRIES = [
  "Fitness",
  "Tech",
  "Finance",
  "Education",
  "Automotive",
  "Alcohol",
];
const ALL_DELIVERABLES = [
  "YouTube Shorts",
  "TikTok Videos",
  "Blog Posts",
  "Podcast Mentions",
];

function formatCount(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

const NAV_ITEMS = [
  { id: "customize" as Tab, label: "Customize", Icon: CustomizeIcon },
  // { id: "plan" as Tab, label: "Plan & billing", Icon: BillingIcon },
  { id: "account" as Tab, label: "Account", Icon: AccountIcon },
];

/* ─── Dashboard ─── */
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("customize");
  const [showPreview, setShowPreview] = useState(false);
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);
  const [igStats, setIgStats] = useState<Record<string, any>>({});
  const [igInsights, setIgInsights] = useState<{
    gender_age: any[];
    top_countries: any[];
    top_cities: any[];
  }>({ gender_age: [], top_countries: [], top_cities: [] });
  const [igPosts, setIgPosts] = useState<any[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [publishedData, setPublishedData] = useState<Record<string, any>>({});

  /* Profile state */
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [appUsername, setAppUsername] = useState("");
  const [tagline, setTagline] = useState("");
  const [location, setLocation] = useState("India");
  const [availableForCollabs, setAvailableForCollabs] = useState(true);
  const [nicheTags, setNicheTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [newPrefIndustry, setNewPrefIndustry] = useState("");
  const [newRestrictedIndustry, setNewRestrictedIndustry] = useState("");
  const [newDeliverable, setNewDeliverable] = useState("");

  /* Packages */
  const [packages, setPackages] = useState<Package[]>([
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
  ]);

  /* Collaboration prefs */
  const [prefIndustries, setPrefIndustries] = useState([
    "Beauty & Cosmetics",
    "Health & Wellness",
    "Fashion",
    "Travel",
    "Home & Lifestyle",
    "Food & Beverage",
  ]);
  const [restrictedIndustries, setRestrictedIndustries] = useState([
    "Alcohol",
    "Tobacco",
    "Gambling",
    "Political",
  ]);
  const [deliverables, setDeliverables] = useState([
    "Instagram Reels",
    "Instagram Posts",
    "Instagram Stories",
    "YouTube Videos",
    "UGC Content",
    "Product Photography",
  ]);
  const [turnaround] = useState("7-10 days");

  /* Past collaborations */
  const [collabs, setCollabs] = useState<Collaboration[]>([
    {
      id: 1,
      brand: "GlowBeauty Co.",
      campaign: "Product Launch — New Skincare Line",
      featured: true,
    },
    {
      id: 2,
      brand: "FitLife Nutrition",
      campaign: "Brand Awareness Campaign",
      featured: false,
    },
    {
      id: 3,
      brand: "TravelEase Luggage",
      campaign: "Holiday Sales Campaign",
      featured: false,
    },
    {
      id: 4,
      brand: "EcoHome Essentials",
      campaign: "Sustainable Living Awareness",
      featured: true,
    },
  ]);

  /* ── Logout ── */
  const handleLogout = async () => {
    await axios.post("/api/auth/logout").catch(() => {});
    window.location.href = "/login";
  };

  /* ── Load draft analytics on mount ── */
  useEffect(() => {
    axios
      .get("/api/analytics")
      .then((res) => {
        const ig: Record<string, any> = res.data?.data?.data ?? {};
        const draft: Record<string, any> = res.data?.draft ?? {};

        // Engagement rate: avg per-post (likes + comments) / followers × 100
        const engagementRate =
          ig.followers_count && Array.isArray(ig.posts) && ig.posts.length
            ? +(
                (((ig.total_likes ?? 0) + (ig.total_comments ?? 0)) /
                  (ig.followers_count * ig.posts.length)) *
                100
              ).toFixed(1)
            : null;

        setIgStats({
          followers: ig.followers_count ?? null,
          avgViews: ig.impressions_30d || null,
          engagement: engagementRate,
          avgReach: ig.reach_30d || null,
          growth: ig.follower_gain_30d || null,
        });

        // Audience insights (read-only from platform)
        setIgInsights({
          gender_age: Array.isArray(ig.gender_age) ? ig.gender_age : [],
          top_countries: Array.isArray(ig.top_countries)
            ? ig.top_countries
            : [],
          top_cities: Array.isArray(ig.top_cities) ? ig.top_cities : [],
        });

        if (Array.isArray(ig.posts)) setIgPosts(ig.posts);

        // Profile pic comes from IG analytics (read-only)
        if (ig.profile_pic) setProfilePic(ig.profile_pic);

        // Handle (IG username, read-only)
        if (ig.username) setHandle(ig.username);

        // App username (used in public profile URL)
        if (res.data?.username) setAppUsername(res.data.username);

        // Editable fields: draft first, fallback to analytics
        setDisplayName(draft.display_name ?? ig.name ?? "");
        setTagline(draft.tagline ?? ig.tagline ?? ig.biography ?? "");
        setLocation(draft.location ?? "India");
        if (Array.isArray(draft.niche_tags) && draft.niche_tags.length)
          setNicheTags(draft.niche_tags);
        if (typeof draft.available_for_collabs === "boolean")
          setAvailableForCollabs(draft.available_for_collabs);
        if (Array.isArray(draft.packages) && draft.packages.length)
          setPackages(draft.packages);
        if (Array.isArray(draft.collabs) && draft.collabs.length)
          setCollabs(draft.collabs);

        setPublishedData(res.data?.published ?? {});
      })
      .catch(() => {})
      .finally(() => setAnalyticsLoaded(true));
  }, []);

  /* ── Auto-save profile edits to draft (debounced 1.5 s) ── */
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!analyticsLoaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      axios
        .put("/api/analytics/draft", {
          display_name: displayName,
          tagline,
          location,
          niche_tags: nicheTags,
          available_for_collabs: availableForCollabs,
          packages,
          collabs,
        })
        .catch(() => {});
    }, 1500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [
    displayName,
    tagline,
    location,
    nicheTags,
    availableForCollabs,
    packages,
    collabs,
    analyticsLoaded,
  ]);

  /* ── Publish ── */
  const handlePublish = async () => {
    setPublishing(true);
    try {
      await axios.post("/api/analytics/publish");
      setPublishedData({
        display_name: displayName,
        tagline,
        location,
        niche_tags: nicheTags,
        available_for_collabs: availableForCollabs,
        packages,
        collabs,
      });
    } catch {
      /* silent */
    } finally {
      setPublishing(false);
    }
  };

  const addPackage = () =>
    setPackages((p) => [
      ...p,
      { id: Date.now(), title: "", description: "", price: "", popular: false },
    ]);
  const removePackage = (id: number) =>
    setPackages((p) => p.filter((x) => x.id !== id));
  const updatePackage = (
    id: number,
    field: keyof Package,
    value: string | boolean,
  ) =>
    setPackages((p) =>
      p.map((x) => (x.id === id ? { ...x, [field]: value } : x)),
    );

  const addCollab = () =>
    setCollabs((c) => [
      ...c,
      { id: Date.now(), brand: "", campaign: "", featured: false },
    ]);
  const removeCollab = (id: number) =>
    setCollabs((c) => c.filter((x) => x.id !== id));
  const updateCollab = (
    id: number,
    field: keyof Collaboration,
    value: string | boolean,
  ) =>
    setCollabs((c) =>
      c.map((x) => (x.id === id ? { ...x, [field]: value } : x)),
    );

  const currentDraft = {
    display_name: displayName,
    tagline,
    location,
    niche_tags: nicheTags,
    available_for_collabs: availableForCollabs,
    packages,
    collabs,
  };
  const hasUnpublishedChanges =
    analyticsLoaded &&
    Object.keys(currentDraft).some(
      (k) =>
        JSON.stringify(currentDraft[k as keyof typeof currentDraft]) !==
        JSON.stringify(publishedData[k]),
    );

  return (
    <div className="h-[100dvh] flex overflow-hidden bg-gray-50">
      {/* ── Sidebar — desktop only ── */}
      <aside className="hidden lg:flex w-52 shrink-0 bg-white border-r border-gray-100 flex-col">
        <div className="px-5 py-5 border-b border-gray-100">
          <AppLogo size="sm" />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === id
                  ? "bg-primary/8 text-primary"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Icon active={activeTab === id} />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-5 space-y-1 border-t border-gray-100 pt-4">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-50 transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 1V3M9 15V17M1 9H3M15 9H17M3.2 3.2L4.6 4.6M13.4 13.4L14.8 14.8M3.2 14.8L4.6 13.4M13.4 4.6L14.8 3.2"
                stroke="#9CA3AF"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="9" cy="9" r="3" stroke="#9CA3AF" strokeWidth="1.5" />
            </svg>
            Dark mode
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M7 3H4a1 1 0 00-1 1v10a1 1 0 001 1h3M12 13l4-4-4-4M16 9H7"
                stroke="#9CA3AF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Log out
          </button>
        </div>
      </aside>

      {/* ── Mobile full-screen preview modal ── */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col lg:hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shrink-0">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase">
              Live Preview
            </p>
            <button
              onClick={() => setShowPreview(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 1L13 13M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <ProfilePreview
              name={displayName}
              handle={handle}
              tagline={tagline}
              location={location}
              profilePic={profilePic}
              stats={igStats}
              insights={igInsights}
              posts={igPosts}
              availableForCollabs={availableForCollabs}
              nicheTags={nicheTags}
              packages={packages}
              collabs={collabs}
              prefIndustries={prefIndustries}
              restrictedIndustries={restrictedIndustries}
              deliverables={deliverables}
              turnaround={turnaround}
            />
          </div>
        </div>
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0">
          {/* Mobile: logo */}
          <div className="lg:hidden">
            <AppLogo size="sm" />
          </div>

          {/* Desktop: URL + conditional draft badge */}
          <div className="hidden lg:flex items-center gap-3">
            {activeTab === "customize" && hasUnpublishedChanges && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs font-medium text-amber-700">
                  Draft — needs to be published
                </span>
              </div>
            )}
            <a
              href={`/${appUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-primary transition-colors"
            >
              kloot.io/{appUsername}
            </a>
          </div>

          {activeTab === "customize" && hasUnpublishedChanges && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="bg-primary hover:bg-primary-hover disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
            >
              <span>{publishing ? "Publishing…" : "Publish now"}</span>
            </button>
          )}
        </div>

        {/* Mobile: conditional draft strip */}
        {activeTab === "customize" && hasUnpublishedChanges && (
          <div className="lg:hidden bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <span className="text-xs text-amber-700">
              Draft ·{" "}
              <a
                href={`/${appUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                kloot.io/{appUsername}
              </a>
            </span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* ── Customize: form + preview side-by-side, centered at max-w-5xl ── */}
          {activeTab === "customize" && (
            <div className="h-full flex justify-center overflow-hidden">
              <div className="flex w-full max-w-5xl overflow-hidden">
                {/* Form panel */}
                <div className="w-full lg:w-[440px] shrink-0 overflow-y-auto px-4 lg:px-6 py-5 space-y-5 pb-24 lg:pb-5">
                  {/* Mobile preview button */}
                  <button
                    onClick={() => setShowPreview(true)}
                    className="lg:hidden w-full bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="8"
                        cy="8"
                        r="2"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                    </svg>
                    Preview my page
                  </button>

                  {/* Profile basics */}
                  <section className="bg-white rounded-2xl p-5 border border-gray-100">
                    <p className="font-semibold text-gray-900 text-sm mb-0.5">
                      Profile basics
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      The first thing brands see
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Display name
                        </label>
                        <input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Handle
                        </label>
                        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
                          <span className="text-gray-400">@</span>
                          <span>{handle || "—"}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                          Synced from Instagram · not editable
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Pitch / tagline
                        </label>
                        <textarea
                          value={tagline}
                          onChange={(e) => setTagline(e.target.value)}
                          rows={2}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none resize-none"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          Keep it under 140 characters for best fit.
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Location
                        </label>
                        <input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-2">
                          Niche tags
                        </label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {nicheTags.map((tag) => (
                            <TagPill
                              key={tag}
                              label={tag}
                              onRemove={() =>
                                setNicheTags(nicheTags.filter((t) => t !== tag))
                              }
                            />
                          ))}
                          <input
                            value={newTag}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val.endsWith(",")) {
                                const trimmed = val.slice(0, -1).trim();
                                if (trimmed && !nicheTags.includes(trimmed))
                                  setNicheTags([...nicheTags, trimmed]);
                                setNewTag("");
                              } else {
                                setNewTag(val);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const trimmed = newTag.trim();
                                if (trimmed && !nicheTags.includes(trimmed))
                                  setNicheTags([...nicheTags, trimmed]);
                                setNewTag("");
                              }
                            }}
                            onBlur={() => {
                              const trimmed = newTag.trim();
                              if (trimmed && !nicheTags.includes(trimmed))
                                setNicheTags([...nicheTags, trimmed]);
                              setNewTag("");
                            }}
                            placeholder="Add tag…"
                            className="text-xs text-gray-700 placeholder:text-gray-300 bg-transparent outline-none w-20 py-0.5"
                          />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {ALL_NICHE_TAGS.filter(
                            (t) => !nicheTags.includes(t),
                          ).map((tag) => (
                            <button
                              key={tag}
                              onClick={() => setNicheTags([...nicheTags, tag])}
                              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              + {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={availableForCollabs}
                          onChange={(e) =>
                            setAvailableForCollabs(e.target.checked)
                          }
                          className="w-4 h-4 rounded accent-primary"
                        />
                        <span className="text-sm text-gray-600">
                          Available for collaborations
                        </span>
                      </label>
                    </div>
                  </section>

                  {/* Analytics */}
                  <section className="bg-white rounded-2xl p-5 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          Analytics
                        </p>
                        <p className="text-xs text-gray-400">
                          Auto-pulled from your connected accounts
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded-full uppercase tracking-wide">
                        Auto-Pulled
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        {
                          label: "Total Followers",
                          value:
                            igStats.followers != null
                              ? formatCount(igStats.followers)
                              : "—",
                        },
                        {
                          label: "Avg Views",
                          value:
                            igStats.avgViews != null
                              ? formatCount(igStats.avgViews)
                              : "—",
                        },
                        {
                          label: "Engagement",
                          value:
                            igStats.engagement != null
                              ? `${igStats.engagement}%`
                              : "—",
                        },
                        {
                          label: "Avg Reach",
                          value:
                            igStats.avgReach != null
                              ? formatCount(igStats.avgReach)
                              : "—",
                        },
                        {
                          label: "Growth Rate",
                          value:
                            igStats.growth != null
                              ? `+${formatCount(igStats.growth)}`
                              : "—",
                        },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-[10px] text-gray-400">{label}</p>
                          <p className="font-bold text-gray-900 text-sm">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400">
                      ↻ Analytics refresh automatically every 24 hours from
                      Instagram. They cannot be edited.
                    </p>
                  </section>

                  {/* Packages & pricing */}
                  <section className="bg-white rounded-2xl p-5 border border-gray-100">
                    <p className="font-semibold text-gray-900 text-sm mb-0.5">
                      Packages &amp; pricing
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      What brands can book from you
                    </p>
                    <div className="space-y-3">
                      {packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className="border border-gray-100 rounded-xl p-3 space-y-2"
                        >
                          <div className="flex gap-2">
                            <input
                              value={pkg.title}
                              onChange={(e) =>
                                updatePackage(pkg.id, "title", e.target.value)
                              }
                              placeholder="Package name"
                              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                            />
                            <input
                              value={pkg.price}
                              onChange={(e) =>
                                updatePackage(pkg.id, "price", e.target.value)
                              }
                              placeholder="$0"
                              className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                            />
                          </div>
                          <input
                            value={pkg.description}
                            onChange={(e) =>
                              updatePackage(
                                pkg.id,
                                "description",
                                e.target.value,
                              )
                            }
                            placeholder="Short description"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                          />
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={pkg.popular}
                                onChange={(e) =>
                                  updatePackage(
                                    pkg.id,
                                    "popular",
                                    e.target.checked,
                                  )
                                }
                                className="w-3.5 h-3.5 accent-primary"
                              />
                              Mark as popular
                            </label>
                            <button
                              onClick={() => removePackage(pkg.id)}
                              className="text-xs text-red-400 hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addPackage}
                      className="w-full mt-3 border border-dashed border-gray-200 rounded-xl py-2.5 text-xs text-gray-400 hover:border-primary hover:text-primary transition-colors"
                    >
                      + Add a package
                    </button>
                  </section>

                  {/* Collaboration preferences */}
                  <section className="bg-white rounded-2xl p-5 border border-gray-100">
                    <p className="font-semibold text-gray-900 text-sm mb-0.5">
                      Collaboration preferences
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      Tell brands what you&apos;re open to
                    </p>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          Preferred industries
                          <span className="text-red-400 ml-1 font-normal text-[10px]">
                            (at least 1 required)
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {prefIndustries.map((tag) => (
                            <TagPill
                              key={tag}
                              label={tag}
                              onRemove={() => {
                                if (prefIndustries.length > 1)
                                  setPrefIndustries(
                                    prefIndustries.filter((t) => t !== tag),
                                  );
                              }}
                            />
                          ))}
                          <input
                            value={newPrefIndustry}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val.endsWith(",")) {
                                const trimmed = val.slice(0, -1).trim();
                                if (
                                  trimmed &&
                                  !prefIndustries.includes(trimmed)
                                )
                                  setPrefIndustries([
                                    ...prefIndustries,
                                    trimmed,
                                  ]);
                                setNewPrefIndustry("");
                              } else {
                                setNewPrefIndustry(val);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const trimmed = newPrefIndustry.trim();
                                if (
                                  trimmed &&
                                  !prefIndustries.includes(trimmed)
                                )
                                  setPrefIndustries([
                                    ...prefIndustries,
                                    trimmed,
                                  ]);
                                setNewPrefIndustry("");
                              }
                            }}
                            onBlur={() => {
                              const trimmed = newPrefIndustry.trim();
                              if (trimmed && !prefIndustries.includes(trimmed))
                                setPrefIndustries([...prefIndustries, trimmed]);
                              setNewPrefIndustry("");
                            }}
                            placeholder="Add industry…"
                            className="text-xs text-gray-700 placeholder:text-gray-300 bg-transparent outline-none w-28 py-0.5"
                          />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {ALL_INDUSTRIES.filter(
                            (t) => !prefIndustries.includes(t),
                          ).map((tag) => (
                            <button
                              key={tag}
                              onClick={() =>
                                setPrefIndustries([...prefIndustries, tag])
                              }
                              className="text-xs text-gray-400 hover:text-gray-600"
                            >
                              + {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          Restricted industries
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {restrictedIndustries.map((tag) => (
                            <RestrictedTagPill
                              key={tag}
                              label={tag}
                              onRemove={() =>
                                setRestrictedIndustries(
                                  restrictedIndustries.filter((t) => t !== tag),
                                )
                              }
                            />
                          ))}
                          <input
                            value={newRestrictedIndustry}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val.endsWith(",")) {
                                const trimmed = val.slice(0, -1).trim();
                                if (
                                  trimmed &&
                                  !restrictedIndustries.includes(trimmed)
                                )
                                  setRestrictedIndustries([
                                    ...restrictedIndustries,
                                    trimmed,
                                  ]);
                                setNewRestrictedIndustry("");
                              } else {
                                setNewRestrictedIndustry(val);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const trimmed = newRestrictedIndustry.trim();
                                if (
                                  trimmed &&
                                  !restrictedIndustries.includes(trimmed)
                                )
                                  setRestrictedIndustries([
                                    ...restrictedIndustries,
                                    trimmed,
                                  ]);
                                setNewRestrictedIndustry("");
                              }
                            }}
                            onBlur={() => {
                              const trimmed = newRestrictedIndustry.trim();
                              if (
                                trimmed &&
                                !restrictedIndustries.includes(trimmed)
                              )
                                setRestrictedIndustries([
                                  ...restrictedIndustries,
                                  trimmed,
                                ]);
                              setNewRestrictedIndustry("");
                            }}
                            placeholder="Add industry…"
                            className="text-xs text-gray-700 placeholder:text-gray-300 bg-transparent outline-none w-28 py-0.5"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          Deliverables offered
                          <span className="text-red-400 ml-1 font-normal text-[10px]">
                            (at least 1 required)
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {deliverables.map((tag) => (
                            <TagPill
                              key={tag}
                              label={tag}
                              onRemove={() => {
                                if (deliverables.length > 1)
                                  setDeliverables(
                                    deliverables.filter((t) => t !== tag),
                                  );
                              }}
                            />
                          ))}
                          <input
                            value={newDeliverable}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val.endsWith(",")) {
                                const trimmed = val.slice(0, -1).trim();
                                if (trimmed && !deliverables.includes(trimmed))
                                  setDeliverables([...deliverables, trimmed]);
                                setNewDeliverable("");
                              } else {
                                setNewDeliverable(val);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const trimmed = newDeliverable.trim();
                                if (trimmed && !deliverables.includes(trimmed))
                                  setDeliverables([...deliverables, trimmed]);
                                setNewDeliverable("");
                              }
                            }}
                            onBlur={() => {
                              const trimmed = newDeliverable.trim();
                              if (trimmed && !deliverables.includes(trimmed))
                                setDeliverables([...deliverables, trimmed]);
                              setNewDeliverable("");
                            }}
                            placeholder="Add deliverable…"
                            className="text-xs text-gray-700 placeholder:text-gray-300 bg-transparent outline-none w-32 py-0.5"
                          />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {ALL_DELIVERABLES.filter(
                            (t) => !deliverables.includes(t),
                          ).map((tag) => (
                            <button
                              key={tag}
                              onClick={() =>
                                setDeliverables([...deliverables, tag])
                              }
                              className="text-xs text-gray-400 hover:text-gray-600"
                            >
                              + {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          Average turnaround time
                        </p>
                        <div className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-gray-50">
                          {turnaround}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Past collaborations */}
                  <section className="bg-white rounded-2xl p-5 border border-gray-100">
                    <p className="font-semibold text-gray-900 text-sm mb-0.5">
                      Past collaborations
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      Showcase your best brand work
                    </p>
                    <div className="space-y-3">
                      {collabs.map((c) => (
                        <div
                          key={c.id}
                          className="border border-gray-100 rounded-xl p-3 space-y-2"
                        >
                          <div className="flex gap-2">
                            <input
                              value={c.brand}
                              onChange={(e) =>
                                updateCollab(c.id, "brand", e.target.value)
                              }
                              placeholder="Brand name"
                              className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                            />
                            <input
                              value={c.campaign}
                              onChange={(e) =>
                                updateCollab(c.id, "campaign", e.target.value)
                              }
                              placeholder="Campaign name"
                              className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={c.featured}
                                onChange={(e) =>
                                  updateCollab(
                                    c.id,
                                    "featured",
                                    e.target.checked,
                                  )
                                }
                                className="w-3.5 h-3.5 accent-primary"
                              />
                              Featured campaign
                            </label>
                            <button
                              onClick={() => removeCollab(c.id)}
                              className="text-xs text-red-400 hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addCollab}
                      className="w-full mt-3 border border-dashed border-gray-200 rounded-xl py-2.5 text-xs text-gray-400 hover:border-primary hover:text-primary transition-colors"
                    >
                      + Add a collaboration
                    </button>
                  </section>
                </div>

                {/* Preview panel — desktop only */}
                <div className="hidden lg:block flex-1 overflow-y-auto bg-gray-50 px-6 py-5">
                  <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <ProfilePreview
                      name={displayName}
                      handle={handle}
                      tagline={tagline}
                      location={location}
                      profilePic={profilePic}
                      stats={igStats}
                      insights={igInsights}
                      posts={igPosts}
                      availableForCollabs={availableForCollabs}
                      nicheTags={nicheTags}
                      packages={packages}
                      collabs={collabs}
                      prefIndustries={prefIndustries}
                      restrictedIndustries={restrictedIndustries}
                      deliverables={deliverables}
                      turnaround={turnaround}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Plan & billing: centered single column ── */}
          {activeTab === "plan" && (
            <div className="h-full overflow-y-auto px-4 lg:px-6 py-5 pb-24 lg:pb-5">
              <div className="max-w-2xl mx-auto space-y-5">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    Plans &amp; billing
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    You&apos;re currently on the{" "}
                    <strong className="text-primary font-semibold">
                      Creator Pro
                    </strong>{" "}
                    plan.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3">
                    <div>
                      <p className="font-bold text-gray-900 text-base">
                        Monthly
                      </p>
                      <p className="text-3xl font-black text-gray-900 mt-1">
                        $9
                        <span className="text-base font-normal text-gray-400">
                          {" "}
                          /mo
                        </span>
                      </p>
                      <p className="text-sm text-gray-400 mt-0.5">
                        Flexible billing
                      </p>
                    </div>
                    <button className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                      Switch
                    </button>
                  </div>
                  <div className="bg-purple-50 rounded-2xl border-2 border-purple-300 p-5 flex flex-col gap-3 relative">
                    <span className="absolute top-4 right-4 bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Current
                    </span>
                    <div>
                      <p className="font-bold text-gray-900 text-base">
                        Annual
                      </p>
                      <p className="text-3xl font-black text-gray-900 mt-1">
                        $79
                        <span className="text-base font-normal text-gray-400">
                          {" "}
                          /year
                        </span>
                      </p>
                      <p className="text-sm text-gray-400 mt-0.5">Save 27%</p>
                    </div>
                    <button
                      disabled
                      className="w-full bg-white text-gray-400 font-semibold py-2.5 rounded-xl text-sm cursor-default border border-gray-200"
                    >
                      Active plan
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <p className="font-bold text-gray-900 text-base mb-0.5">
                    Payment method
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    Update your card or billing email
                  </p>
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-700 text-white text-xs font-extrabold px-2 py-1 rounded-md tracking-wider">
                        VISA
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          •••• 4242
                        </p>
                        <p className="text-xs text-gray-400">Expires 04/28</p>
                      </div>
                    </div>
                    <button className="border border-primary text-primary text-sm font-semibold px-4 py-1.5 rounded-xl hover:bg-primary/5 transition-colors">
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Account: centered single column ── */}
          {activeTab === "account" && (
            <div className="h-full overflow-y-auto px-4 lg:px-6 py-5 pb-24 lg:pb-5">
              <div className="max-w-2xl mx-auto space-y-5">
                <h2 className="text-2xl font-black text-gray-900">Account</h2>
                <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                  <p className="font-bold text-gray-900 text-base">
                    Account info
                  </p>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1.5">
                      Email
                    </label>
                    <input
                      defaultValue="sarah@example.com"
                      className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1.5">
                      Username
                    </label>
                    <div className="flex border border-gray-200 rounded-2xl overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                      <span className="flex items-center justify-center w-12 bg-gray-100 text-gray-400 text-sm border-r border-gray-200 shrink-0">
                        @
                      </span>
                      <input
                        defaultValue="sarahjcreates"
                        className="flex-1 px-4 py-3 text-sm outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      defaultValue="password"
                      className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <p className="font-bold text-gray-900 text-base mb-4">
                    Connected accounts
                  </p>
                  <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center shrink-0">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <rect
                            x="2"
                            y="2"
                            width="20"
                            height="20"
                            rx="5"
                            stroke="white"
                            strokeWidth="1.8"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="4"
                            stroke="white"
                            strokeWidth="1.8"
                          />
                          <circle cx="17.5" cy="6.5" r="1" fill="white" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Instagram
                        </p>
                        <p className="text-xs text-gray-400">
                          @sarahjcreates · 485K followers
                        </p>
                      </div>
                    </div>
                    <span className="border border-green-300 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-xl bg-green-50">
                      Connected
                    </span>
                  </div>
                </div>
                {/* undo */}
                {/* <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <p className="font-bold text-gray-900 text-base mb-4">
                    Subscription
                  </p>
                  <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Creator Pro · Annual
                      </p>
                      <p className="text-xs text-gray-400">
                        $79/year · Renews May 6, 2027
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-xl">
                      Active
                    </span>
                  </div>
                  <button className="text-sm text-red-400 hover:text-red-600 transition-colors">
                    Cancel subscription
                  </button>
                </div> */}
                <button
                  onClick={handleLogout}
                  className="w-full border border-red-200 text-red-500 font-semibold py-4 rounded-2xl hover:bg-red-50 transition-colors text-base"
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom tab bar — mobile only ── */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-100 flex z-40">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
              activeTab === id ? "text-primary" : "text-gray-400"
            }`}
          >
            <Icon active={activeTab === id} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
