"use client";

import { useState, useEffect, useRef } from "react";
import { Package, Collaboration, IgStats } from "./types";
import { type ThemeData } from "@/components/CreatorProfile";
import { THEMES } from "@/constants/themes";
import Button from "@/components/reusable/Button";

const POST_GRADIENTS = [
  "from-orange-300 to-rose-300",
  "from-purple-300 to-pink-300",
  "from-teal-200 to-cyan-300",
  "from-rose-200 to-orange-200",
  "from-violet-300 to-indigo-300",
  "from-emerald-200 to-teal-300",
  "from-yellow-200 to-amber-300",
  "from-blue-200 to-indigo-300",
];

const ANALYTICS_TOGGLES = [
  { id: "followers", label: "Followers" },
  { id: "views", label: "Views" },
  { id: "growth", label: "Growth" },
  { id: "shares", label: "Shares" },
  { id: "audience_split", label: "Audience split" },
  { id: "gender", label: "Gender" },
  { id: "locations", label: "Locations" },
  { id: "engagement", label: "Engagement" },
];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${checked ? "bg-primary" : "bg-gray-200"}`}
    >
      <span
        className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-gray-900 mb-1.5">
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  onBlur,
  placeholder,
  readOnly,
  className = "",
  type,
}: {
  value: string;
  onChange?: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  type?: string;
}) {
  return (
    <input
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      onBlur={onBlur}
      placeholder={placeholder}
      readOnly={readOnly}
      type={type}
      className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 ${readOnly ? "bg-gray-50 text-gray-500 cursor-default" : "bg-white"} ${className}`}
    />
  );
}

export interface CustomizeFormProps {
  profilePic: string | null;
  setProfilePic: (v: string | null) => void;
  displayName: string;
  setDisplayName: (v: string) => void;
  appUsername: string;
  tagline: string;
  setTagline: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  displayEmail: string;
  setDisplayEmail: (v: string) => void;
  servicesVisible: boolean;
  setServicesVisible: (v: boolean) => void;
  availableForCollabs: boolean;
  setAvailableForCollabs: (v: boolean) => void;
  nicheTags: string[];
  setNicheTags: (v: string[]) => void;
  igStats: IgStats;
  igPosts: any[];
  packages: Package[];
  addPackage: () => void;
  removePackage: (id: number) => void;
  updatePackage: (
    id: number,
    field: keyof Package,
    value: string | boolean,
  ) => void;
  prefIndustries: string[];
  setPrefIndustries: (v: string[]) => void;
  restrictedIndustries: string[];
  setRestrictedIndustries: (v: string[]) => void;
  deliverables: string[];
  setDeliverables: (v: string[]) => void;
  turnaround: string;
  collabs: Collaboration[];
  addCollab: () => void;
  removeCollab: (id: number) => void;
  updateCollab: (
    id: number,
    field: keyof Collaboration,
    value: string | boolean,
  ) => void;
  featuredPosts: any[];
  onFeaturedPostsChange: (posts: any[]) => void;
  campaignPosts: any[];
  onCampaignPostsChange: (posts: any[]) => void;
  onPreviewClick: () => void;
  onThemeChange?: (identifier: string, theme: ThemeData) => void;
  onProfilePicUploaded?: (url: string | null) => void;
  onSectionFocus?: (sectionId: string) => void;
}

export function CustomizeForm({
  profilePic,
  setProfilePic,
  displayName,
  setDisplayName,
  appUsername,
  tagline,
  setTagline,
  location,
  setLocation,
  displayEmail,
  setDisplayEmail,
  servicesVisible,
  setServicesVisible,
  nicheTags,
  setNicheTags,
  igPosts,
  featuredPosts,
  onFeaturedPostsChange,
  campaignPosts,
  onCampaignPostsChange,
  packages,
  addPackage,
  removePackage,
  updatePackage,
  collabs,
  addCollab,
  removeCollab,
  updateCollab,
  onPreviewClick,
  onThemeChange,
  onProfilePicUploaded,
  onSectionFocus,
}: CustomizeFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const picMenuRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [picMenuOpen, setPicMenuOpen] = useState(false);
  const [pendingDeleteCollab, setPendingDeleteCollab] = useState<number | null>(
    null,
  );
  const [pendingDeletePackage, setPendingDeletePackage] = useState<
    number | null
  >(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("image", file);
    setUploading(true);
    setUploadError(null);
    try {
      const res = await fetch("/api/upload/profile-image", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed");
        return;
      }
      if (data.url) {
        setProfilePic(data.url);
        onProfilePicUploaded?.(data.url);
        fetch("/api/analytics/draft", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile_pic: data.url }),
        }).catch(() => {});
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (picMenuRef.current && !picMenuRef.current.contains(e.target as Node)) {
        setPicMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleRemoveImage() {
    setPicMenuOpen(false);
    setProfilePic(null);
    onProfilePicUploaded?.(null);
    fetch("/api/upload/profile-image", { method: "DELETE" }).catch(() => {});
  }

  const [pronouns, setPronouns] = useState("she/her");
  const [languages, setLanguages] = useState("English");
  const [theme, setTheme] = useState("default");

  useEffect(() => {
    fetch("/api/customization")
      .then((r) => r.json())
      .then((data) => {
        const identifier = data.draft?.theme_identifier;
        if (identifier) setTheme(identifier);
      })
      .catch(() => {});
  }, []);
  const [nicheText, setNicheText] = useState(nicheTags.join(", "));
  const [analyticsToggles, setAnalyticsToggles] = useState<
    Record<string, boolean>
  >({
    followers: true,
    views: true,
    growth: true,
    shares: false,
    audience_split: true,
    gender: false,
    locations: true,
    engagement: true,
  });
  const [userFeaturedIds, setUserFeaturedIds] = useState<string[] | null>(null);
  const featuredIds: string[] =
    userFeaturedIds ??
    ((featuredPosts?.length ?? 0) > 0
      ? featuredPosts.map((p: { id: string }) => p.id)
      : (igPosts?.length ?? 0) > 0
        ? igPosts.slice(0, 4).map((p: { id: string }) => p.id)
        : []);

  const [openModal, setOpenModal] = useState<null | "featured" | "campaign">(null);
  const [modalPosts, setModalPosts] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalLoadingMore, setModalLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  async function fetchPosts(cursor?: string) {
    const isFirst = !cursor;
    if (isFirst) {
      setModalLoading(true);
      setModalPosts([]);
      setNextCursor(null);
    } else {
      setModalLoadingMore(true);
    }
    try {
      const url = `/api/instagram/posts?limit=20${cursor ? `&after=${encodeURIComponent(cursor)}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      const newPosts: any[] = data.posts ?? [];
      setModalPosts((prev) => (isFirst ? newPosts : [...prev, ...newPosts]));
      setNextCursor(data.nextCursor ?? null);
    } catch {
      // silent
    } finally {
      if (isFirst) setModalLoading(false);
      else setModalLoadingMore(false);
    }
  }

  function handleScroll() {
    const el = scrollContainerRef.current;
    if (!el || modalLoadingMore || !nextCursor) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
      fetchPosts(nextCursor);
    }
  }

  const [userCampaignIds, setUserCampaignIds] = useState<string[] | null>(null);
  const campaignIds: string[] =
    userCampaignIds ??
    ((campaignPosts?.length ?? 0) > 0
      ? campaignPosts.map((p: { id: string }) => p.id)
      : []);

  function togglePost(id: string) {
    const next = featuredIds.includes(id)
      ? featuredIds.filter((x) => x !== id)
      : featuredIds.length >= 4
        ? featuredIds
        : [...featuredIds, id];
    setUserFeaturedIds(next);
    const posts = next
      .map(
        (nid) =>
          modalPosts.find((p: any) => p.id === nid) ??
          featuredPosts.find((p: any) => p.id === nid),
      )
      .filter(Boolean);
    onFeaturedPostsChange(posts);
  }

  function toggleCampaignPost(id: string) {
    const next = campaignIds.includes(id)
      ? campaignIds.filter((x) => x !== id)
      : campaignIds.length >= 4
        ? campaignIds
        : [...campaignIds, id];
    setUserCampaignIds(next);
    const posts = next
      .map(
        (nid) =>
          modalPosts.find((p: any) => p.id === nid) ??
          campaignPosts.find((p: any) => p.id === nid),
      )
      .filter(Boolean);
    onCampaignPostsChange(posts);
  }

  function syncNicheTags() {
    const tags = nicheText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setNicheTags(tags);
  }

  const mediaTypeLabel = (t?: string) =>
    t === "REELS"
      ? "Reel"
      : t === "VIDEO"
        ? "Video"
        : t === "CAROUSEL_ALBUM"
          ? "Post"
          : "Post";

  return (
    <div className="w-full lg:w-[520px] shrink-0 overflow-y-auto px-4 lg:px-6 py-5 space-y-4 pb-24 lg:pb-8">
      {/* Mobile preview button */}
      <Button
        variant="default"
        size="md"
        onClick={onPreviewClick}
        fullWidth
        icon={
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
        }
        className="lg:hidden rounded-xl"
      >
        Preview my page
      </Button>

      {/* ── Profile ── */}
      <section
        className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4"
        onFocus={() => onSectionFocus?.("hero")}
      >
        <p className="font-semibold text-gray-900">Profile</p>

        {/* Photo upload */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0" ref={picMenuRef}>
            <button
              type="button"
              onClick={() => !uploading && setPicMenuOpen((v) => !v)}
              className="relative w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden group block"
            >
              {profilePic ? (
                <img src={profilePic} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                </div>
              )}
              {!uploading && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </button>

            {picMenuOpen && (
              <div className="absolute left-0 top-[calc(100%+6px)] z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[160px]">
                <button
                  type="button"
                  onClick={() => { setPicMenuOpen(false); fileInputRef.current?.click(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Change image
                </button>
                {profilePic && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                    Remove image
                  </button>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          {uploadError && (
            <p className="text-xs text-red-500">{uploadError}</p>
          )}
        </div>

        {/* 2-col: Display name + Username */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Display name</Label>
            <Input
              value={displayName}
              onChange={setDisplayName}
              placeholder="Your name"
            />
          </div>
          <div>
            <Label>Username</Label>
            <Input value={appUsername} readOnly placeholder="yourhandle" />
          </div>
        </div>

        {/* 2-col: Pronouns + Location */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Pronouns</Label>
            <Input
              value={pronouns}
              onChange={setPronouns}
              placeholder="she/her"
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={location}
              onChange={setLocation}
              placeholder="City, Country"
            />
          </div>
        </div>

        {/* 2-col: Display email + Languages */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Contact email</Label>
            <Input
              value={displayEmail}
              onChange={setDisplayEmail}
              placeholder="hi@you.com"
            />
          </div>
          {/* <div>
            <Label>Languages</Label>
            <Input
              value={languages}
              onChange={setLanguages}
              placeholder="English"
            />
          </div> */}
        </div>

        {/* Bio */}
        <div>
          <Label>Bio</Label>
          <textarea
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="A short bio about you"
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
          />
        </div>

        {/* Niche tags */}
        <div>
          <Label>Niche tags</Label>
          <Input
            value={nicheText}
            onChange={setNicheText}
            onBlur={syncNicheTags}
            placeholder="lifestyle, travel, beauty"
            className=""
          />
          <p className="text-xs text-gray-400 mt-1">Comma separated</p>
        </div>
      </section>

      {/* ── Theme ── */}
      <section
        className="bg-white rounded-2xl border border-gray-100 p-5"
        onFocus={() => onSectionFocus?.("hero")}
      >
        <p className="font-semibold text-gray-900 mb-4">Theme</p>
        <div className="grid grid-cols-4 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.identifier}
              onClick={() => {
                setTheme(t.identifier);
                onThemeChange?.(t.identifier, {
                  accent_color: t.accent_color,
                  base_color: t.base_color,
                  contrast_color: t.contrast_color,
                });
                fetch("/api/customization", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ theme_identifier: t.identifier }),
                }).catch(() => {});
              }}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`w-full  rounded-2xl overflow-hidden transition-all ${
                  theme === t.identifier
                    ? "ring-2 ring-primary ring-offset-2"
                    : ""
                }`}
                style={{ backgroundColor: t.accent_color, paddingTop: "60%" }}
              >
                {/* <div className="h-[30%] mt-auto" style={{ backgroundColor: t.accent_color, marginTop: "70%" }} /> */}
              </div>
              <span
                className={`text-xs text-center capitalize ${theme === t.identifier ? "font-semibold text-gray-900" : "text-gray-500"}`}
              >
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Featured Instagram content ── */}
      <section
        className="bg-white rounded-2xl border border-gray-100 p-5"
        onFocus={() => onSectionFocus?.("work")}
      >
        <p className="font-semibold text-gray-900 mb-1">
          Featured Instagram content
        </p>
        <p className="text-xs text-gray-400 mb-3">
          Up to 4 posts or reels shown on your page.
        </p>

        {/* Selected posts preview — always visible */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {Array.from({ length: 4 }, (_, i) => {
            const post = featuredPosts[i] ?? null;
            const thumb = post
              ? (post.thumbnail_url ??
                (post.media_type === "IMAGE" ||
                post.media_type === "CAROUSEL_ALBUM"
                  ? post.media_url
                  : null))
              : null;
            return post ? (
              <div
                key={i}
                className="relative rounded-2xl overflow-hidden aspect-square ring-2 ring-primary ring-offset-1"
              >
                {thumb ? (
                  <img
                    src={thumb}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-br ${POST_GRADIENTS[i % POST_GRADIENTS.length]}`}
                  />
                )}
                <span className="absolute top-1.5 right-1.5 bg-gray-900/70 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
                  {mediaTypeLabel(post.media_type)}
                </span>
                <span className="absolute bottom-1 left-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                  {i + 1}
                </span>
              </div>
            ) : (
              <div
                key={i}
                className="rounded-2xl aspect-square bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center"
              >
                <span className="text-gray-300 text-sm font-medium">
                  {i + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* Open picker */}
        <Button
          variant="default"
          size="sm"
          onClick={() => { setOpenModal("featured"); fetchPosts(); }}
          fullWidth
          className="rounded-xl"
          icon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <rect x="8" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <rect x="1" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <rect x="8" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          }
        >
          {featuredIds.length > 0 ? "Change selection" : "Choose posts"}
        </Button>
      </section>

      {/* ── Campaign showcase ── */}
      <section
        className="bg-white rounded-2xl border border-gray-100 p-5"
        onFocus={() => onSectionFocus?.("work")}
      >
        <p className="font-semibold text-gray-900 mb-1">Previous campaigns</p>
        <p className="text-xs text-gray-400 mb-3">
          Up to 4 posts from your brand campaigns.
        </p>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {Array.from({ length: 4 }, (_, i) => {
            const post = campaignPosts[i] ?? null;
            const thumb = post
              ? (post.thumbnail_url ??
                (post.media_type === "IMAGE" || post.media_type === "CAROUSEL_ALBUM"
                  ? post.media_url
                  : null))
              : null;
            return post ? (
              <div key={i} className="relative rounded-2xl overflow-hidden aspect-square ring-2 ring-primary ring-offset-1">
                {thumb ? (
                  <img src={thumb} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${POST_GRADIENTS[i % POST_GRADIENTS.length]}`} />
                )}
                <span className="absolute top-1.5 right-1.5 bg-gray-900/70 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
                  {mediaTypeLabel(post.media_type)}
                </span>
                <span className="absolute bottom-1 left-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                  {i + 1}
                </span>
              </div>
            ) : (
              <div key={i} className="rounded-2xl aspect-square bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
                <span className="text-gray-300 text-sm font-medium">{i + 1}</span>
              </div>
            );
          })}
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={() => { setOpenModal("campaign"); fetchPosts(); }}
          fullWidth
          className="rounded-xl"
          icon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <rect x="8" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <rect x="1" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <rect x="8" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          }
        >
          {campaignIds.length > 0 ? "Change selection" : "Choose posts"}
        </Button>
      </section>

      {/* Shared post picker modal */}
      {openModal !== null && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm"
          onClick={() => setOpenModal(null)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm max-h-[85vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="font-semibold text-gray-900">
                  {openModal === "campaign" ? "Campaign posts" : "Choose posts"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {(openModal === "campaign" ? campaignIds : featuredIds).length} of 4 selected
                </p>
              </div>
              <button
                onClick={() => setOpenModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {(openModal === "campaign" ? campaignIds : featuredIds).length >= 4 && (
              <div className="mx-5 mt-4 shrink-0 bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 text-xs text-center text-primary font-medium">
                4 posts selected — deselect one to swap
              </div>
            )}

            <div ref={scrollContainerRef} className="overflow-y-auto flex-1 p-4" onScroll={handleScroll}>
              <div className="grid grid-cols-3 gap-2">
                {modalLoading
                  ? Array.from({ length: 9 }, (_, i) => (
                      <div key={i} className="rounded-2xl aspect-square bg-gray-100 animate-pulse" />
                    ))
                  : modalPosts.map((post, i) => {
                      const activeIds = openModal === "campaign" ? campaignIds : featuredIds;
                      const thumb =
                        post.thumbnail_url ??
                        (post.media_type === "IMAGE" || post.media_type === "CAROUSEL_ALBUM"
                          ? post.media_url
                          : null);
                      const selected = activeIds.includes(post.id);
                      const dimmed = activeIds.length >= 4 && !selected;
                      return (
                        <button
                          key={post.id}
                          onClick={() =>
                            openModal === "campaign"
                              ? toggleCampaignPost(post.id)
                              : togglePost(post.id)
                          }
                          className={`relative rounded-2xl overflow-hidden aspect-square transition-all
                            ${selected ? "ring-2 ring-primary ring-offset-1" : ""}
                            ${dimmed ? "cursor-not-allowed" : "cursor-pointer"}
                          `}
                        >
                          {thumb ? (
                            <img src={thumb} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${POST_GRADIENTS[i % POST_GRADIENTS.length]}`} />
                          )}
                          <span className="absolute top-1.5 right-1.5 bg-gray-900/70 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
                            {mediaTypeLabel(post.media_type)}
                          </span>
                          {selected && (
                            <span className="absolute bottom-1.5 left-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          )}
                        </button>
                      );
                    })}
              </div>
              {!modalLoading && modalPosts.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-8">No posts found</p>
              )}
              {modalLoadingMore && (
                <div className="flex justify-center py-3">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 shrink-0">
              <Button
                variant="primary"
                size="md"
                fullWidth
                className="rounded-2xl"
                onClick={() => {
                  if (openModal === "campaign") {
                    setOpenModal(null);
                    const selected = campaignIds
                      .map((id) => modalPosts.find((p) => p.id === id) ?? campaignPosts.find((p) => p.id === id))
                      .filter(Boolean);
                    onCampaignPostsChange(selected);
                    fetch("/api/analytics/draft", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ campaign_posts: selected }),
                    }).catch(() => {});
                  } else {
                    setOpenModal(null);
                    const selected = featuredIds
                      .map((id) => modalPosts.find((p) => p.id === id) ?? featuredPosts.find((p) => p.id === id))
                      .filter(Boolean);
                    onFeaturedPostsChange(selected);
                    fetch("/api/analytics/draft", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ posts: selected }),
                    }).catch(() => {});
                  }
                }}
              >
                Done — {(openModal === "campaign" ? campaignIds : featuredIds).length} selected
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Brands you've worked with ── */}
      <section
        className="bg-white rounded-2xl border border-gray-100 p-5"
        onFocus={() => onSectionFocus?.("partner")}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-gray-900">
            Brands you&apos;ve worked with
          </p>
        </div>
        <div className="space-y-2">
          {collabs.map((c) => (
            <div key={c.id} className="flex items-center gap-2 min-h-[44px]">
              {pendingDeleteCollab !== c.id ? (
                <>
                  <Input
                    value={c.brand}
                    onChange={(v) => updateCollab(c.id, "brand", v)}
                    placeholder="Brand name"
                  />

                  <button
                    onClick={() => setPendingDeleteCollab(c.id)}
                    className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 focus:outline-none focus:ring-0 transition-colors cursor-pointer"
                    type="button"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </>
              ) : (
                <div className="w-full flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5">
                  <span className="flex-1 text-sm text-red-700 truncate">
                    Remove &ldquo;{c.brand || "this brand"}&rdquo;?
                  </span>

                  <Button
                    variant="danger"
                    size="xs"
                    onClick={() => {
                      removeCollab(c.id);
                      setPendingDeleteCollab(null);
                    }}
                    className="shrink-0 rounded-lg"
                  >
                    Remove
                  </Button>

                  <button
                    onClick={() => setPendingDeleteCollab(null)}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors cursor-pointer"
                    type="button"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M1 1l8 8M9 1L1 9"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={addCollab}
          fullWidth
          className="rounded-xl mt-3"
          icon={
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 1v10M1 6h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          }
        >
          Add service
        </Button>
      </section>

      {/* ── Analytics on your page ── */}
      {/* uncomment later */}
      {/* <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="font-semibold text-gray-900 mb-1">
          Analytics on your page
        </p>
        <p className="text-xs text-gray-400 mb-4">
          Choose which stats to publicly display.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ANALYTICS_TOGGLES.map(({ id, label }) => (
            <div
              key={id}
              className="flex items-center justify-between border border-gray-100 rounded-xl px-3 py-2.5"
            >
              <span className="text-sm text-gray-700">{label}</span>
              <Toggle
                checked={analyticsToggles[id] ?? false}
                onChange={(v) =>
                  setAnalyticsToggles((prev) => ({ ...prev, [id]: v }))
                }
              />
            </div>
          ))}
        </div>
      </section> */}

      {/* ── Services & rates ── */}
      <section
        className="bg-white rounded-2xl border border-gray-100 p-5"
        onFocus={() => onSectionFocus?.("partner")}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-gray-900">Services &amp; rates</p>
          <Toggle checked={servicesVisible} onChange={setServicesVisible} />
        </div>
        {/* <p className="text-xs text-gray-400 mb-4">
          Toggle visibility on your page.
        </p> */}
        <div className="space-y-3">
          {packages.map((pkg) => {
            const isPending = pendingDeletePackage === pkg.id;
            return (
              <div
                key={pkg.id}
                className={`rounded-xl p-3 space-y-2 border transition-colors ${isPending ? "border-red-200 bg-red-50" : "border-gray-100"}`}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="flex md:flex-row flex-col md:items-center  gap-2 w-full">
                    <Input
                      value={pkg.title}
                      onChange={(v) => updatePackage(pkg.id, "title", v)}
                      placeholder="Service name"
                      className="flex-1"
                    />
                    <Input
                      value={pkg.price}
                      onChange={(v) => updatePackage(pkg.id, "price", v)}
                      placeholder="₹0"
                      className="!w-28 md:block hidden"
                    />
                  </div>
                  {isPending ? (
                    <div className="flex md:items-center gap-1.5 shrink-0">
                      <Button
                        variant="danger"
                        size="xs"
                        onClick={() => {
                          removePackage(pkg.id);
                          setPendingDeletePackage(null);
                        }}
                        className="rounded-lg"
                      >
                        Remove
                      </Button>
                      <button
                        onPointerDown={(e) => {
                          e.preventDefault();
                          setPendingDeletePackage(null);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                        >
                          <path
                            d="M1 1l8 8M9 1L1 9"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPendingDeletePackage(pkg.id)}
                      className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors outline-none focus:outline-none cursor-pointer"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  )}
                </div>
                <Input
                  value={pkg.price}
                  onChange={(v) => updatePackage(pkg.id, "price", v)}
                  placeholder="₹0"
                  className="md:hidden"
                />
                <textarea
                  value={pkg.description}
                  onChange={(e) =>
                    updatePackage(pkg.id, "description", e.target.value)
                  }
                  placeholder="Short description"
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm placeholder:text-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none bg-white"
                />
              </div>
            );
          })}
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={addPackage}
          fullWidth
          className="rounded-xl mt-3"
          icon={
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 1v10M1 6h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          }
        >
          Add service
        </Button>
      </section>
    </div>
  );
}
