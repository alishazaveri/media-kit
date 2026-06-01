"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  DashboardSidebar,
  NAV_ITEMS,
} from "@/components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { CustomizeTab } from "@/components/dashboard/CustomizeTab";
import { PlanTab } from "@/components/dashboard/PlanTab";
import { AccountTab } from "@/components/dashboard/AccountTab";
import {
  Tab,
  Package,
  Collaboration,
  IgStats,
  IgInsights,
} from "@/components/dashboard/types";
import { type ThemeData } from "@/components/CreatorProfile";
import { getThemeByIdentifier } from "@/constants/themes";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("customize");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);
  const [igStats, setIgStats] = useState<IgStats>({
    followers: null,
    avgViews: null,
    engagement: null,
    avgReach: null,
    growth: null,
  });
  const [igInsights, setIgInsights] = useState<IgInsights>({
    gender_age: [],
    top_countries: [],
    top_cities: [],
  });
  const [igPosts] = useState<any[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<any[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [publishedData, setPublishedData] = useState<Record<string, any>>({});

  /* Profile state */
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [appUsername, setAppUsername] = useState("");
  const [email, setEmail] = useState("");
  const [tagline, setTagline] = useState("");
  const [location, setLocation] = useState("India");
  const [availableForCollabs, setAvailableForCollabs] = useState(true);
  const [nicheTags, setNicheTags] = useState<string[]>([]);

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

  const [theme, setTheme] = useState<ThemeData | undefined>(undefined);
  const [draftThemeIdentifier, setDraftThemeIdentifier] = useState<string>("default");
  const [publishedThemeIdentifier, setPublishedThemeIdentifier] = useState<string>("default");

  useEffect(() => {
    fetch("/api/customization")
      .then((r) => r.json())
      .then((data) => {
        const draftId: string = data.draft?.theme_identifier ?? "default";
        const publishedId: string = data.published?.theme_identifier ?? "default";
        setDraftThemeIdentifier(draftId);
        setPublishedThemeIdentifier(publishedId);
        const t = getThemeByIdentifier(draftId);
        if (t) setTheme({ accent_color: t.accent_color, base_color: t.base_color, contrast_color: t.contrast_color });
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await axios.post("/api/auth/logout").catch(() => {});
    window.location.href = "/login";
  };

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
        });
        setIgInsights({
          gender_age: Array.isArray(ig.gender_age) ? ig.gender_age : [],
          top_countries: Array.isArray(ig.top_countries)
            ? ig.top_countries
            : [],
          top_cities: Array.isArray(ig.top_cities) ? ig.top_cities : [],
        });
        if (ig.profile_pic) setProfilePic(ig.profile_pic);
        if (ig.username) setHandle(ig.username);
        if (res.data?.username) setAppUsername(res.data.username);
        if (res.data?.email) setEmail(res.data.email);

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
        if (Array.isArray(draft.posts) && draft.posts.length) {
          setFeaturedPosts(draft.posts);
        }
        setPublishedData(res.data?.published ?? {});
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
        niche_tags: nicheTags,
        available_for_collabs: availableForCollabs,
        packages,
        collabs,
        posts: featuredPosts,
      });
      setPublishedThemeIdentifier(draftThemeIdentifier);
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
    posts: featuredPosts,
  };
  const hasUnpublishedTheme = draftThemeIdentifier !== publishedThemeIdentifier;

  const hasUnpublishedChanges =
    analyticsLoaded &&
    (hasUnpublishedTheme ||
      Object.keys(currentDraft).some(
        (k) =>
          JSON.stringify(currentDraft[k as keyof typeof currentDraft]) !==
          JSON.stringify(publishedData[k]),
      ));

  return (
    <div className="h-[100dvh] flex overflow-hidden bg-[#FAF7F2]">
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopBar
          appUsername={appUsername}
          profilePic={profilePic}
          publishing={publishing}
          hasUnpublishedChanges={hasUnpublishedChanges}
          onPublish={handlePublish}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        />

        {/* Mobile draft strip */}
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

        <div className="flex-1 overflow-hidden">
          {activeTab === "customize" && (
            <CustomizeTab
              profilePic={profilePic}
              setProfilePic={setProfilePic}
              displayName={displayName}
              setDisplayName={setDisplayName}
              appUsername={appUsername}
              handle={handle}
              tagline={tagline}
              setTagline={setTagline}
              location={location}
              setLocation={setLocation}
              availableForCollabs={availableForCollabs}
              setAvailableForCollabs={setAvailableForCollabs}
              nicheTags={nicheTags}
              setNicheTags={setNicheTags}
              igStats={igStats}
              igInsights={igInsights}
              igPosts={igPosts}
              featuredPosts={featuredPosts}
              onFeaturedPostsChange={setFeaturedPosts}
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
              theme={theme}
              onThemeChange={(identifier, themeData) => {
                setDraftThemeIdentifier(identifier);
                setTheme(themeData);
              }}
            />
          )}
          {activeTab === "plan" && <PlanTab />}
          {activeTab === "account" && (
            <AccountTab
              email={email}
              appUsername={appUsername}
              handle={handle}
              igStats={igStats}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>

      {/* Mobile bottom tab bar */}
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
