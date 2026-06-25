"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { CustomizeTab } from "@/components/dashboard/CustomizeTab";
import {
  Package,
  Collaboration,
  IgStats,
  IgInsights,
} from "@/components/dashboard/types";
import { type ThemeData } from "@/components/CreatorProfile";
import { getThemeByIdentifier } from "@/constants/themes";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { Toast } from "@/components/ui/Toast";

export default function DashboardPage() {
  const { sidebarCollapsed, setSidebarCollapsed } = useDashboard();

  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [igStats, setIgStats] = useState<IgStats>({
    followers: null,
    avgViews: null,
    engagement: null,
    avgReach: null,
    growth: null,
    reach_daily_30d: null,
  });
  const [igInsights, setIgInsights] = useState<IgInsights>({
    gender_age: [],
    top_countries: [],
    top_cities: [],
    age_breakdown: [],
    gender_breakdown: [],
  });
  const [igPosts] = useState<any[]>([]);
  const [igTopPosts, setIgTopPosts] = useState<any[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<any[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [publishedData, setPublishedData] = useState<Record<string, any>>({});
  const [profilePicChanged, setProfilePicChanged] = useState(false);

  /* Profile state */
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [publishedProfilePic, setPublishedProfilePic] = useState<string | null>(
    null,
  );
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [appUsername, setAppUsername] = useState("");
  const [tagline, setTagline] = useState("");
  const [location, setLocation] = useState("India");
  const [displayEmail, setDisplayEmail] = useState("");
  const [servicesVisible, setServicesVisible] = useState(true);
  const [availableForCollabs, setAvailableForCollabs] = useState(true);
  const [nicheTags, setNicheTags] = useState<string[]>([]);

  /* Packages */
  const [packages, setPackages] = useState<Package[]>([
    {
      id: 1,
      title: "Instagram Reel",
      description: "Single Instagram Reel",
      price: "₹2,500",
      popular: false,
    },
    {
      id: 2,
      title: "Instagram Story",
      description: "Story series (3–5 frames)",
      price: "₹800",
      popular: false,
    },
    // {
    //   id: 3,
    //   title: "YouTube Video",
    //   description: "Dedicated or integrated video",
    //   price: "$5,000",
    //   popular: true,
    // },
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
  const [receiptsVisible, setReceiptsVisible] = useState(true);

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

  const [theme, setTheme] = useState<ThemeData | undefined>(undefined);
  const [draftThemeIdentifier, setDraftThemeIdentifier] =
    useState<string>("default");
  const [publishedThemeIdentifier, setPublishedThemeIdentifier] =
    useState<string>("default");
  const [draftDarkMode, setDraftDarkMode] = useState<boolean>(false);
  const [publishedDarkMode, setPublishedDarkMode] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/customization")
      .then((r) => r.json())
      .then((data) => {
        const draftId: string = data.draft?.theme_identifier ?? "default";
        const publishedId: string =
          data.published?.theme_identifier ?? "default";
        const draftDark: boolean = data.draft?.dark_mode ?? false;
        const publishedDark: boolean = data.published?.dark_mode ?? false;
        setDraftThemeIdentifier(draftId);
        setPublishedThemeIdentifier(publishedId);
        setDraftDarkMode(draftDark);
        setPublishedDarkMode(publishedDark);
        const t = getThemeByIdentifier(draftId);
        if (t)
          setTheme({
            accent_color: t.accent_color,
            base_color: t.base_color,
            contrast_color: t.contrast_color,
            dark_mode: draftDark,
          });
      })
      .catch(() => {});
  }, []);

  /* Load analytics on mount */
  useEffect(() => {
    axios
      .get("/api/analytics")
      .then((res) => {
        const ig: Record<string, any> = res.data?.data?.data ?? {};
        const draft: Record<string, any> = res.data?.draft ?? {};

        const engagementRate =
          ig.followers_count && ig.post_count
            ? +(
                (((ig.total_likes ?? 0) + (ig.total_comments ?? 0)) /
                  (ig.followers_count * ig.post_count)) *
                100
              ).toFixed(1)
            : null;

        setIgStats({
          followers: ig.followers_count ?? null,
          avgViews: ig.impressions_30d || null,
          engagement: engagementRate,
          avgReach: ig.reach_30d || null,
          growth: ig.follower_gain_30d || null,
          reach_daily_30d: ig.reach_daily_30d && typeof ig.reach_daily_30d === "object" ? ig.reach_daily_30d : null,
        });
        setIgInsights({
          gender_age: Array.isArray(ig.gender_age) ? ig.gender_age : [],
          top_countries: Array.isArray(ig.top_countries) ? ig.top_countries : [],
          top_cities: Array.isArray(ig.top_cities) ? ig.top_cities : [],
          age_breakdown: Array.isArray(ig.age_breakdown) ? ig.age_breakdown : [],
          gender_breakdown: Array.isArray(ig.gender_breakdown) ? ig.gender_breakdown : [],
        });
        if (Array.isArray(ig.top_content_by_views) && ig.top_content_by_views.length > 0) {
          setIgTopPosts(
            ig.top_content_by_views.slice(0, 4).map((p: any) => ({
              id: p.id,
              caption: p.caption,
              media_type: p.media_type,
              thumbnail_url: p.thumbnail_url ?? null,
              media_url: p.media_url ?? null,
              permalink: p.permalink ?? null,
              like_count: p.like_count,
              comments_count: p.comments_count,
              view_count: p.impressions,
            })),
          );
        }
        // If draft.profile_pic is explicitly null it means the user removed it — don't fall back.
        // Only fall back to profile_image_url / ig pic when the draft has never set a pic.
        setProfilePic(
          "profile_pic" in draft
            ? (draft.profile_pic ?? null)
            : (res.data?.profile_image_url ?? ig.profile_pic ?? null),
        );
        if (ig.username) setHandle(ig.username);
        if (res.data?.username) setAppUsername(res.data.username);

        setDisplayName(draft.display_name ?? ig.name ?? "");
        setTagline(draft.tagline ?? ig.tagline ?? ig.biography ?? "");
        setLocation(draft.location ?? "India");
        if (draft.display_email) setDisplayEmail(draft.display_email);
        if (typeof draft.services_visible === "boolean")
          setServicesVisible(draft.services_visible);
        if (typeof draft.receipts_visible === "boolean")
          setReceiptsVisible(draft.receipts_visible);
        if (Array.isArray(draft.niche_tags) && draft.niche_tags.length)
          setNicheTags(draft.niche_tags);
        if (typeof draft.available_for_collabs === "boolean")
          setAvailableForCollabs(draft.available_for_collabs);
        if (Array.isArray(draft.packages) && draft.packages.length)
          setPackages(draft.packages);
        if (Array.isArray(draft.collabs) && draft.collabs.length)
          setCollabs(draft.collabs);
        if (Array.isArray(draft.posts) && draft.posts.length) {
          setFeaturedPosts(draft.posts);
        } else if (Array.isArray(ig.top_content_by_views) && ig.top_content_by_views.length > 0) {
          // Use top posts by views from insights as the default
          setFeaturedPosts(
            ig.top_content_by_views.slice(0, 4).map((p: any) => ({
              id: p.id,
              caption: p.caption,
              media_type: p.media_type,
              thumbnail_url: p.thumbnail_url ?? null,
              media_url: p.media_url ?? null,
              permalink: p.permalink ?? null,
              like_count: p.like_count,
              comments_count: p.comments_count,
              view_count: p.impressions,
            })),
          );
        } else {
          // Last resort — fetch first 4 posts chronologically
          fetch("/api/instagram/posts?limit=4")
            .then((r) => r.json())
            .then((data) => {
              const posts: any[] = data.posts ?? [];
              if (posts.length > 0) setFeaturedPosts(posts.slice(0, 4));
            })
            .catch(() => {});
        }
        const published: Record<string, unknown> = res.data?.published ?? {};
        setPublishedData({
          display_name: "",
          tagline: "",
          location: "India",
          display_email: "",
          services_visible: true,
          receipts_visible: true,
          available_for_collabs: true,
          niche_tags: [],
          posts: [],
          ...published,
        });
        setPublishedProfilePic(
          (published.profile_pic as string | null) ??
            res.data?.profile_image_url ??
            ig.profile_pic ??
            null,
        );
        if ((draft.profile_pic ?? null) !== (published.profile_pic ?? null)) {
          setProfilePicChanged(true);
        }
      })
      .catch(() => {})
      .finally(() => setAnalyticsLoaded(true));
  }, []);

  /* Auto-save draft (debounced 1.5s) */
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
          display_email: displayEmail,
          services_visible: servicesVisible,
          receipts_visible: receiptsVisible,
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
    displayEmail,
    servicesVisible,
    receiptsVisible,
    nicheTags,
    availableForCollabs,
    packages,
    collabs,
    analyticsLoaded,
  ]);

  /* Publish */
  const handlePublish = async () => {
    setPublishing(true);
    try {
      await Promise.all([
        axios.post("/api/analytics/publish"),
        axios.post("/api/customization/publish"),
      ]);
      setPublishedData({
        display_name: displayName,
        tagline,
        location,
        display_email: displayEmail,
        services_visible: servicesVisible,
        niche_tags: nicheTags,
        available_for_collabs: availableForCollabs,
        packages,
        collabs,
        receipts_visible: receiptsVisible,
        posts: featuredPosts,
        profile_pic: profilePic,
      });
      setPublishedProfilePic(profilePic);
      setProfilePicChanged(false);
      setPublishedThemeIdentifier(draftThemeIdentifier);
      setPublishedDarkMode(draftDarkMode);
    } catch {
      /* silent */
    } finally {
      setPublishing(false);
    }
  };

  const addPackage = () =>
    setPackages((p) => [
      ...p,
      {
        id: Date.now(),
        title: "",
        description: "",
        price: "",
        popular: false,
      },
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
    value: string | boolean | number | any[],
  ) =>
    setCollabs((c) =>
      c.map((x) => (x.id === id ? { ...x, [field]: value } : x)),
    );

  const currentDraft = {
    display_name: displayName,
    tagline,
    location,
    display_email: displayEmail,
    services_visible: servicesVisible,
    receipts_visible: receiptsVisible,
    niche_tags: nicheTags,
    available_for_collabs: availableForCollabs,
    packages,
    collabs,
    posts: featuredPosts,
  };
  const hasUnpublishedTheme =
    draftThemeIdentifier !== publishedThemeIdentifier ||
    draftDarkMode !== publishedDarkMode;

  const hasUnpublishedChanges =
    analyticsLoaded &&
    (profilePicChanged ||
      hasUnpublishedTheme ||
      Object.keys(currentDraft).some(
        (k) =>
          JSON.stringify(currentDraft[k as keyof typeof currentDraft]) !==
          JSON.stringify(publishedData[k]),
      ));

  return (
    <>
      {copied && (
        <Toast
          message="Copied!"
          type="success"
          onClose={() => setCopied(false)}
        />
      )}
      <DashboardTopBar
        appUsername={appUsername}
        profilePic={publishedProfilePic}
        publishing={publishing}
        hasUnpublishedChanges={hasUnpublishedChanges}
        onPublish={handlePublish}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={async () => {
          await axios.post("/api/auth/logout").catch(() => {});
          window.location.href = "/app/login";
        }}
      />

      {/* Mobile draft strip */}
      {/* <div
        className={` border border-gray-200  px-3 py-1 text-xs text-gray-400 ${hasUnpublishedChanges ? "bg-amber-50" : "bg-white"}`}
      >
        <span
          className={`text-xs ${hasUnpublishedChanges ? " text-amber-700" : ""}`}
        >
          {hasUnpublishedChanges && "Draft ·"}{" "}
          <a
            href={`/${appUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            kloot.io/{appUsername}
          </a>
        </span>
      </div> */}
      <div className="sm:hidden flex items-center gap-2 bg-gray-50 border border-gray-200 px-6 py-2 w-full ">
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${hasUnpublishedChanges ? "bg-amber-400" : "bg-green-400"}`}
        />
        <a
          href={`/${appUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-600 flex-1 hover:text-primary transition-colors truncate"
        >
          kloot.io/{appUsername}
        </a>

        <div className="flex flex-row gap-3 items-center">
          {hasUnpublishedChanges ? (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded shrink-0">
              DRAFT
            </span>
          ) : (
            <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded shrink-0">
              LIVE
            </span>
          )}
          <button
            onClick={() =>
              navigator.clipboard
                .writeText(`${process.env.NEXT_PUBLIC_APP_URL}/${appUsername}`)
                .then(() => setCopied(true))
            }
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            title="Copy link"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          </button>
          <a
            href={`/${appUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            title="Open live"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <CustomizeTab
          profilePic={profilePic}
          setProfilePic={setProfilePic}
          displayName={displayName}
          setDisplayName={setDisplayName}
          appUsername={appUsername}
          handle={handle}
          isInstagramConnected={!analyticsLoaded || Boolean(handle)}
          tagline={tagline}
          setTagline={setTagline}
          location={location}
          setLocation={setLocation}
          displayEmail={displayEmail}
          setDisplayEmail={setDisplayEmail}
          servicesVisible={servicesVisible}
          setServicesVisible={setServicesVisible}
          availableForCollabs={availableForCollabs}
          setAvailableForCollabs={setAvailableForCollabs}
          nicheTags={nicheTags}
          setNicheTags={setNicheTags}
          igStats={igStats}
          igInsights={igInsights}
          igPosts={igPosts}
          igTopPosts={igTopPosts}
          packages={packages}
          addPackage={addPackage}
          removePackage={removePackage}
          updatePackage={updatePackage}
          prefIndustries={prefIndustries}
          setPrefIndustries={setPrefIndustries}
          restrictedIndustries={restrictedIndustries}
          setRestrictedIndustries={setRestrictedIndustries}
          deliverables={deliverables}
          setDeliverables={setDeliverables}
          turnaround={turnaround}
          collabs={collabs}
          addCollab={addCollab}
          removeCollab={removeCollab}
          updateCollab={updateCollab}
          featuredPosts={featuredPosts}
          onFeaturedPostsChange={setFeaturedPosts}
          receiptsVisible={receiptsVisible}
          setReceiptsVisible={setReceiptsVisible}
          theme={theme}
          onThemeChange={(identifier, themeData) => {
            setDraftThemeIdentifier(identifier);
            setDraftDarkMode(themeData.dark_mode ?? false);
            setTheme(themeData);
          }}
          onProfilePicUploaded={() => setProfilePicChanged(true)}
          publishing={publishing}
          hasUnpublishedChanges={hasUnpublishedChanges}
          onPublish={handlePublish}
        />
      </div>
    </>
  );
}
