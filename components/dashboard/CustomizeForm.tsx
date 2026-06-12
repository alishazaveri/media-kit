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
    value: string | boolean | number | any[],
  ) => void;
  featuredPosts: any[];
  onFeaturedPostsChange: (posts: any[]) => void;
  receiptsVisible: boolean;
  setReceiptsVisible: (v: boolean) => void;
  onPreviewClick: () => void;
  onThemeChange?: (identifier: string, theme: ThemeData) => void;
  onProfilePicUploaded?: (url: string) => void;
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
  packages,
  addPackage,
  removePackage,
  updatePackage,
  collabs,
  addCollab,
  removeCollab,
  updateCollab,
  receiptsVisible,
  setReceiptsVisible,
  onPreviewClick,
  onThemeChange,
  onProfilePicUploaded,
  onSectionFocus,
}: CustomizeFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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

  const [pronouns, setPronouns] = useState("she/her");
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
  const [userFeaturedIds, setUserFeaturedIds] = useState<string[] | null>(null);
  const featuredIds: string[] =
    userFeaturedIds ??
    ((featuredPosts?.length ?? 0) > 0
      ? featuredPosts.map((p: { id: string }) => p.id)
      : (igPosts?.length ?? 0) > 0
        ? igPosts.slice(0, 4).map((p: { id: string }) => p.id)
        : []);

  const [expandedCollabId, setExpandedCollabId] = useState<number | null>(null);
  const [collabPickerOpen, setCollabPickerOpen] = useState<number | null>(null);

  useEffect(() => {
    if (expandedCollabId !== null) {
      onSectionFocus?.(`receipts-card-${expandedCollabId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedCollabId]);
  const collabScrollRef = useRef<HTMLDivElement>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
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
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
            {profilePic ? (
              <img
                src={profilePic}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={uploading}
              loading={uploading}
              onClick={() => fileInputRef.current?.click()}
              icon={
                !uploading && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                )
              }
              className="rounded-xl"
            >
              {uploading ? "Uploading…" : "Upload photo"}
            </Button>
            {uploadError ? (
              <p className="text-xs text-red-500 mt-1.5">{uploadError}</p>
            ) : (
              <p className="text-xs text-gray-400 mt-1.5">
                JPG, PNG or WebP, square works best.
              </p>
            )}
          </div>
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
          onClick={() => {
            setDropdownOpen(true);
            fetchPosts();
          }}
          fullWidth
          className="rounded-xl"
          icon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect
                x="1"
                y="1"
                width="5"
                height="5"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <rect
                x="8"
                y="1"
                width="5"
                height="5"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <rect
                x="1"
                y="8"
                width="5"
                height="5"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <rect
                x="8"
                y="8"
                width="5"
                height="5"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
            </svg>
          }
        >
          {featuredIds.length > 0 ? "Change selection" : "Choose posts"}
        </Button>

        {/* Post picker modal */}
        {dropdownOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm"
            onClick={() => setDropdownOpen(false)}
          >
            <div
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm max-h-[85vh] flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                <div>
                  <p className="font-semibold text-gray-900">Choose posts</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {featuredIds.length} of 4 selected
                  </p>
                </div>
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M1 1l10 10M11 1L1 11"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Max reached banner */}
              {featuredIds.length >= 4 && (
                <div className="mx-5 mt-4 shrink-0 bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 text-xs text-center text-primary font-medium">
                  4 posts selected — deselect one to swap
                </div>
              )}

              {/* Scrollable grid */}
              <div
                ref={scrollContainerRef}
                className="overflow-y-auto flex-1 p-4"
                onScroll={handleScroll}
              >
                <div className="grid grid-cols-3 gap-2">
                  {modalLoading
                    ? Array.from({ length: 9 }, (_, i) => (
                        <div
                          key={i}
                          className="rounded-2xl aspect-square bg-gray-100 animate-pulse"
                        />
                      ))
                    : modalPosts.length === 0
                      ? null
                      : modalPosts.map((post: any, i: number) => {
                          const thumb =
                            post.thumbnail_url ??
                            (post.media_type === "IMAGE" ||
                            post.media_type === "CAROUSEL_ALBUM"
                              ? post.media_url
                              : null);
                          const selected = featuredIds.includes(post.id);
                          const dimmed = featuredIds.length >= 4 && !selected;
                          return (
                            <button
                              key={post.id}
                              onClick={() => togglePost(post.id)}
                              className={`relative rounded-2xl overflow-hidden aspect-square transition-all
                              ${selected ? "ring-2 ring-primary ring-offset-1" : ""}
                              ${dimmed ? "cursor-not-allowed" : "cursor-pointer"}
                            `}
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
                              {selected && (
                                <span className="absolute bottom-1.5 left-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                  <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 10 10"
                                    fill="none"
                                  >
                                    <path
                                      d="M2 5l2.5 2.5L8 3"
                                      stroke="white"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                              )}
                            </button>
                          );
                        })}
                </div>
                {!modalLoading && modalPosts.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-8">
                    No posts found
                  </p>
                )}
                {modalLoadingMore && (
                  <div className="flex justify-center py-3">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div className="px-5 py-4 border-t border-gray-100 shrink-0">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  className="rounded-2xl"
                  onClick={() => {
                    setDropdownOpen(false);
                    const selectedPosts = featuredIds
                      .map(
                        (id) =>
                          modalPosts.find((p: any) => p.id === id) ??
                          featuredPosts.find((p: any) => p.id === id),
                      )
                      .filter(Boolean);
                    onFeaturedPostsChange(selectedPosts);
                    fetch("/api/analytics/draft", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ posts: selectedPosts }),
                    }).catch(() => {});
                  }}
                >
                  Done — {featuredIds.length} selected
                </Button>
              </div>
            </div>
          </div>
        )}
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

      {/* ── Past collabs ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-gray-900">Past collabs</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Showcase verified campaign results on your page.
            </p>
          </div>
          <Toggle checked={receiptsVisible} onChange={setReceiptsVisible} />
        </div>

        <div className="space-y-2">
          {collabs.map((c) => {
            const isExpanded = expandedCollabId === c.id;
            const isPendingDelete = pendingDeleteCollab === c.id;
            const selectedPosts: any[] = c.collabPosts ?? [];
            const selectedThumbs = selectedPosts.map(
              (p) =>
                p.thumbnail_url ??
                (p.media_type === "IMAGE" || p.media_type === "CAROUSEL_ALBUM"
                  ? p.media_url
                  : null),
            );

            if (isPendingDelete) {
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5"
                >
                  <span className="flex-1 text-sm text-red-700 truncate">
                    Remove &ldquo;{c.brand || "this collab"}&rdquo;?
                  </span>
                  <Button
                    variant="danger"
                    size="xs"
                    onClick={() => {
                      removeCollab(c.id);
                      setPendingDeleteCollab(null);
                      if (expandedCollabId === c.id) setExpandedCollabId(null);
                    }}
                    className="shrink-0 rounded-lg"
                  >
                    Remove
                  </Button>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteCollab(null)}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors cursor-pointer"
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
              );
            }

            return (
              <div
                key={c.id}
                className="rounded-xl border border-gray-100 overflow-hidden"
              >
                {/* Collapsed header row */}
                <div className="flex items-center gap-2.5 px-3 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                    {c.brand?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {c.brand || "New collab"}
                    </p>
                    {c.industry && (
                      <p className="text-xs text-gray-400 truncate">
                        {c.industry}
                      </p>
                    )}
                  </div>
                  {/* Featured / TOP PERFORMER toggle */}
                  <button
                    type="button"
                    title={
                      c.featured
                        ? "Remove Top Performer badge"
                        : "Mark as Top Performer"
                    }
                    onClick={() => updateCollab(c.id, "featured", !c.featured)}
                    className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                      c.featured
                        ? "bg-amber-50 text-amber-500"
                        : "text-gray-300 hover:text-amber-400"
                    }`}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill={c.featured ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth={c.featured ? "0" : "1.8"}
                    >
                      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                    </svg>
                  </button>
                  {/* Expand / collapse */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedCollabId(isExpanded ? null : c.id)
                    }
                    className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => setPendingDeleteCollab(c.id)}
                    className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <svg
                      width="13"
                      height="13"
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
                </div>

                {/* Expanded detail fields */}
                {isExpanded && (
                  <div
                    className="border-t border-gray-50 px-3 pb-4 pt-3 space-y-3"
                    onFocus={() => onSectionFocus?.(`receipts-card-${c.id}`)}
                  >
                    {/* Brand + Category */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Brand</Label>
                        <Input
                          value={c.brand}
                          onChange={(v) => updateCollab(c.id, "brand", v)}
                          placeholder="Brand name"
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Input
                          value={c.industry ?? ""}
                          onChange={(v) => updateCollab(c.id, "industry", v)}
                          placeholder="e.g. Clean Beauty"
                        />
                      </div>
                    </div>

                    {/* Goal */}
                    <div>
                      <Label>Campaign goal</Label>
                      <Input
                        value={c.goal ?? ""}
                        onChange={(v) => updateCollab(c.id, "goal", v)}
                        placeholder="e.g. Product launch awareness"
                      />
                    </div>

                    {/* Content delivered — 3 number inputs */}
                    <div>
                      <Label>Content delivered</Label>
                      <div className="flex gap-2">
                        {(
                          [
                            { label: "Reels", field: "reels_count" },
                            { label: "Posts", field: "posts_count" },
                            { label: "Stories", field: "stories_count" },
                          ] as const
                        ).map(({ label, field }) => (
                          <div key={field} className="flex-1">
                            <p className="text-[11px] text-gray-400 mb-1 text-center">
                              {label}
                            </p>
                            <input
                              type="number"
                              min={0}
                              value={c[field] ?? 0}
                              onChange={(e) =>
                                updateCollab(
                                  c.id,
                                  field,
                                  Math.max(0, Number(e.target.value)),
                                )
                              }
                              className="w-full border border-gray-200 rounded-xl px-2 py-2 text-sm text-center font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Showcase posts */}
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        Showcase posts{" "}
                        <span className="text-gray-400 font-normal">
                          ({selectedPosts.length}/10)
                        </span>
                      </p>
                      <div className="grid grid-cols-5 gap-1.5 mb-2">
                        {selectedThumbs.map((thumb, i) =>
                          thumb ? (
                            <div
                              key={i}
                              className="relative rounded-xl overflow-hidden aspect-square ring-1 ring-primary ring-offset-1"
                            >
                              <img
                                src={thumb}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div
                              key={i}
                              className="rounded-xl aspect-square bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center"
                            >
                              <span className="text-gray-300 text-xs font-medium">
                                {i + 1}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        fullWidth
                        className="rounded-xl"
                        onClick={() => {
                          setCollabPickerOpen(c.id);
                          fetchPosts();
                        }}
                        icon={
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                          >
                            <rect
                              x="1"
                              y="1"
                              width="5"
                              height="5"
                              rx="1.5"
                              stroke="currentColor"
                              strokeWidth="1.3"
                            />
                            <rect
                              x="8"
                              y="1"
                              width="5"
                              height="5"
                              rx="1.5"
                              stroke="currentColor"
                              strokeWidth="1.3"
                            />
                            <rect
                              x="1"
                              y="8"
                              width="5"
                              height="5"
                              rx="1.5"
                              stroke="currentColor"
                              strokeWidth="1.3"
                            />
                            <rect
                              x="8"
                              y="8"
                              width="5"
                              height="5"
                              rx="1.5"
                              stroke="currentColor"
                              strokeWidth="1.3"
                            />
                          </svg>
                        }
                      >
                        {selectedPosts.length > 0
                          ? "Change posts"
                          : "Select posts"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
          Add collab
        </Button>
      </section>

      {/* Collab post picker modal */}
      {collabPickerOpen !== null &&
        (() => {
          const activeCollab = collabs.find((c) => c.id === collabPickerOpen);
          const activeCollabPosts: any[] = activeCollab?.collabPosts ?? [];
          return (
            <div
              className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm"
              onClick={() => setCollabPickerOpen(null)}
            >
              <div
                className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm max-h-[85vh] flex flex-col shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {activeCollab?.brand || "Collab"} posts
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {activeCollabPosts.length} of 10 selected
                    </p>
                  </div>
                  <button
                    onClick={() => setCollabPickerOpen(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M1 1l10 10M11 1L1 11"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                {activeCollabPosts.length >= 10 && (
                  <div className="mx-5 mt-4 shrink-0 bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 text-xs text-center text-primary font-medium">
                    10 posts selected — deselect one to swap
                  </div>
                )}

                <div
                  ref={collabScrollRef}
                  className="overflow-y-auto flex-1 p-4"
                  onScroll={() => {
                    const el = collabScrollRef.current;
                    if (!el || modalLoadingMore || !nextCursor) return;
                    if (
                      el.scrollTop + el.clientHeight >=
                      el.scrollHeight - 80
                    ) {
                      fetchPosts(nextCursor);
                    }
                  }}
                >
                  <div className="grid grid-cols-3 gap-2">
                    {modalLoading
                      ? Array.from({ length: 9 }, (_, i) => (
                          <div
                            key={i}
                            className="rounded-2xl aspect-square bg-gray-100 animate-pulse"
                          />
                        ))
                      : modalPosts.map((post: any, i: number) => {
                          const thumb =
                            post.thumbnail_url ??
                            (post.media_type === "IMAGE" ||
                            post.media_type === "CAROUSEL_ALBUM"
                              ? post.media_url
                              : null);
                          const selected = activeCollabPosts.some(
                            (p: any) => p.id === post.id,
                          );
                          const dimmed =
                            activeCollabPosts.length >= 10 && !selected;
                          return (
                            <button
                              key={post.id}
                              onClick={() => {
                                const next = selected
                                  ? activeCollabPosts.filter(
                                      (p: any) => p.id !== post.id,
                                    )
                                  : activeCollabPosts.length >= 10
                                    ? activeCollabPosts
                                    : [...activeCollabPosts, post];
                                updateCollab(
                                  collabPickerOpen!,
                                  "collabPosts",
                                  next,
                                );
                                // Auto-populate Reels and Posts counts from selected media types
                                updateCollab(
                                  collabPickerOpen!,
                                  "reels_count",
                                  next.filter(
                                    (p: any) => p.media_type === "VIDEO",
                                  ).length,
                                );
                                updateCollab(
                                  collabPickerOpen!,
                                  "posts_count",
                                  next.filter(
                                    (p: any) =>
                                      p.media_type === "IMAGE" ||
                                      p.media_type === "CAROUSEL_ALBUM",
                                  ).length,
                                );
                              }}
                              className={`relative rounded-2xl overflow-hidden aspect-square transition-all
                              ${selected ? "ring-2 ring-primary ring-offset-1" : ""}
                              ${dimmed ? "cursor-not-allowed" : "cursor-pointer"}
                            `}
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
                              {selected && (
                                <span className="absolute bottom-1.5 left-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                  <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 10 10"
                                    fill="none"
                                  >
                                    <path
                                      d="M2 5l2.5 2.5L8 3"
                                      stroke="white"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                              )}
                            </button>
                          );
                        })}
                  </div>
                  {!modalLoading && modalPosts.length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-8">
                      No posts found
                    </p>
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
                    onClick={() => setCollabPickerOpen(null)}
                  >
                    Done — {activeCollabPosts.length}/10 selected
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
