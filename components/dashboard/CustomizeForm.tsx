"use client";

import { useState, useEffect } from "react";
import { Package, Collaboration, IgStats } from "./types";
import { type ThemeData } from "@/components/CreatorProfile";
import { THEMES } from "@/constants/themes";

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

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
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
  return <label className="block text-sm font-medium text-gray-900 mb-1.5">{children}</label>;
}

function Input({
  value,
  onChange,
  onBlur,
  placeholder,
  readOnly,
  className = "",
}: {
  value: string;
  onChange?: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}) {
  return (
    <input
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      onBlur={onBlur}
      placeholder={placeholder}
      readOnly={readOnly}
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
  availableForCollabs: boolean;
  setAvailableForCollabs: (v: boolean) => void;
  nicheTags: string[];
  setNicheTags: (v: string[]) => void;
  igStats: IgStats;
  igPosts: any[];
  packages: Package[];
  addPackage: () => void;
  removePackage: (id: number) => void;
  updatePackage: (id: number, field: keyof Package, value: string | boolean) => void;
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
  updateCollab: (id: number, field: keyof Collaboration, value: string | boolean) => void;
  onPreviewClick: () => void;
  onThemeChange?: (identifier: string, theme: ThemeData) => void;
}

export function CustomizeForm({
  profilePic, setProfilePic,
  displayName, setDisplayName,
  appUsername,
  tagline, setTagline,
  location, setLocation,
  nicheTags, setNicheTags,
  igPosts,
  packages, addPackage, removePackage, updatePackage,
  collabs, addCollab, removeCollab, updateCollab,
  onPreviewClick,
  onThemeChange,
}: CustomizeFormProps) {
  const [pronouns, setPronouns] = useState("she/her");
  const [displayEmail, setDisplayEmail] = useState("");
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
  const [analyticsToggles, setAnalyticsToggles] = useState<Record<string, boolean>>({
    followers: true, views: true, growth: true, shares: false,
    audience_split: true, gender: false, locations: true, engagement: true,
  });
  const [servicesVisible, setServicesVisible] = useState(true);

  const defaultPosts =
    igPosts.length > 0
      ? igPosts
      : Array.from({ length: 8 }, (_, i) => ({ id: `dummy_${i}`, media_type: ["REELS", "IMAGE", "IMAGE", "REELS", "IMAGE", "REELS", "IMAGE", "IMAGE"][i] }));

  const [featuredIds, setFeaturedIds] = useState<string[]>(
    defaultPosts.slice(0, 4).map((p: any) => p.id),
  );

  function togglePost(id: string) {
    setFeaturedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function syncNicheTags() {
    const tags = nicheText.split(",").map((t) => t.trim()).filter(Boolean);
    setNicheTags(tags);
  }

  const mediaTypeLabel = (t?: string) =>
    t === "REELS" ? "Reel" : t === "VIDEO" ? "Video" : t === "CAROUSEL_ALBUM" ? "Post" : "Post";

  return (
    <div className="w-full lg:w-[520px] shrink-0 overflow-y-auto px-4 lg:px-6 py-5 space-y-4 pb-24 lg:pb-8">
      {/* Mobile preview button */}
      <button
        onClick={onPreviewClick}
        className="lg:hidden w-full bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        Preview my page
      </button>

      {/* ── Profile ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <p className="font-semibold text-gray-900">Profile</p>

        {/* Photo upload */}
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
            {profilePic ? (
              <img src={profilePic} alt="" className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div>
            <button className="flex items-center gap-2 border border-gray-200 bg-white text-sm font-medium text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload photo
            </button>
            <p className="text-xs text-gray-400 mt-1.5">JPG or PNG, square works best.</p>
          </div>
        </div>

        {/* 2-col: Display name + Username */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Display name</Label>
            <Input value={displayName} onChange={setDisplayName} placeholder="Your name" />
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
            <Input value={pronouns} onChange={setPronouns} placeholder="she/her" />
          </div>
          <div>
            <Label>Location</Label>
            <Input value={location} onChange={setLocation} placeholder="City, Country" />
          </div>
        </div>

        {/* 2-col: Display email + Languages */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Display email</Label>
            <Input value={displayEmail} onChange={setDisplayEmail} placeholder="hi@you.com" />
          </div>
          <div>
            <Label>Languages</Label>
            <Input value={languages} onChange={setLanguages} placeholder="English" />
          </div>
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
      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="font-semibold text-gray-900 mb-4">Theme</p>
        <div className="grid grid-cols-4 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.identifier}
              onClick={() => {
                setTheme(t.identifier);
                onThemeChange?.(t.identifier, { accent_color: t.accent_color, base_color: t.base_color, contrast_color: t.contrast_color });
                fetch("/api/customization", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ theme_identifier: t.identifier }),
                }).catch(() => {});
              }}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`w-full aspect-[3/4] rounded-2xl overflow-hidden transition-all ${
                  theme === t.identifier ? "ring-2 ring-primary ring-offset-2" : ""
                }`}
                style={{ backgroundColor: t.base_color }}
              >
                <div className="h-[30%] mt-auto" style={{ backgroundColor: t.accent_color, marginTop: "70%" }} />
              </div>
              <span className={`text-xs text-center capitalize ${theme === t.identifier ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Featured Instagram content ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="font-semibold text-gray-900 mb-1">Featured Instagram content</p>
        <p className="text-xs text-gray-400 mb-4">Tap to select. First 4 are shown by default.</p>
        <div className="grid grid-cols-4 gap-2">
          {defaultPosts.slice(0, 8).map((post: any, i: number) => {
            const thumb = post.thumbnail_url ?? (post.media_type === "IMAGE" || post.media_type === "CAROUSEL_ALBUM" ? post.media_url : null);
            const selected = featuredIds.includes(post.id);
            return (
              <button
                key={post.id}
                onClick={() => togglePost(post.id)}
                className={`relative rounded-2xl overflow-hidden aspect-square transition-all ${selected ? "ring-2 ring-primary ring-offset-1" : ""}`}
              >
                {thumb ? (
                  <img src={thumb} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${POST_GRADIENTS[i % POST_GRADIENTS.length]}`} />
                )}
                {/* Type badge */}
                <span className="absolute top-1.5 right-1.5 bg-gray-900/70 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
                  {mediaTypeLabel(post.media_type)}
                </span>
                {/* Selected check */}
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
      </section>

      {/* ── Brands you've worked with ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-gray-900">Brands you&apos;ve worked with</p>
          <button
            onClick={addCollab}
            className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 bg-white px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add
          </button>
        </div>
        <div className="space-y-2">
          {collabs.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <Input
                value={c.brand}
                onChange={(v) => updateCollab(c.id, "brand", v)}
                placeholder="Brand name"
              />
              <button
                onClick={() => removeCollab(c.id)}
                className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Analytics on your page ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="font-semibold text-gray-900 mb-1">Analytics on your page</p>
        <p className="text-xs text-gray-400 mb-4">Choose which stats to publicly display.</p>
        <div className="grid grid-cols-2 gap-2">
          {ANALYTICS_TOGGLES.map(({ id, label }) => (
            <div key={id} className="flex items-center justify-between border border-gray-100 rounded-xl px-3 py-2.5">
              <span className="text-sm text-gray-700">{label}</span>
              <Toggle
                checked={analyticsToggles[id] ?? false}
                onChange={(v) => setAnalyticsToggles((prev) => ({ ...prev, [id]: v }))}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Services & rates ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="font-semibold text-gray-900">Services &amp; rates</p>
          <Toggle checked={servicesVisible} onChange={setServicesVisible} />
        </div>
        <p className="text-xs text-gray-400 mb-4">Toggle visibility on your page.</p>
        <div className="space-y-3">
          {packages.map((pkg) => (
            <div key={pkg.id} className="border border-gray-100 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={pkg.title}
                  onChange={(v) => updatePackage(pkg.id, "title", v)}
                  placeholder="Service name"
                  className="flex-1"
                />
                <Input
                  value={pkg.price}
                  onChange={(v) => updatePackage(pkg.id, "price", v)}
                  placeholder="$0"
                  className="!w-24"
                />
                <button
                  onClick={() => removePackage(pkg.id)}
                  className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
              <textarea
                value={pkg.description}
                onChange={(e) => updatePackage(pkg.id, "description", e.target.value)}
                placeholder="Short description"
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm placeholder:text-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
              />
            </div>
          ))}
        </div>
        <button
          onClick={addPackage}
          className="flex items-center gap-2 text-sm text-gray-600 mt-3 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Add service
        </button>
      </section>
    </div>
  );
}
