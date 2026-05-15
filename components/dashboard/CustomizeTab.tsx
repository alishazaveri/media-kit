"use client";

import { useState } from "react";
import { ProfilePreview } from "@/components/ProfilePreview";
import { Package, Collaboration, IgStats, IgInsights } from "./types";
import { formatCount } from "./utils";

/* ─── Shared tag pills ─── */
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

interface Props {
  /* profile */
  profilePic: string | null;
  setProfilePic: (v: string | null) => void;
  displayName: string;
  setDisplayName: (v: string) => void;
  appUsername: string;
  handle: string;
  tagline: string;
  setTagline: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  availableForCollabs: boolean;
  setAvailableForCollabs: (v: boolean) => void;
  nicheTags: string[];
  setNicheTags: (v: string[]) => void;
  /* ig data */
  igStats: IgStats;
  igInsights: IgInsights;
  igPosts: any[];
  /* packages */
  packages: Package[];
  addPackage: () => void;
  removePackage: (id: number) => void;
  updatePackage: (
    id: number,
    field: keyof Package,
    value: string | boolean,
  ) => void;
  /* collab prefs */
  prefIndustries: string[];
  setPrefIndustries: (v: string[]) => void;
  restrictedIndustries: string[];
  setRestrictedIndustries: (v: string[]) => void;
  deliverables: string[];
  setDeliverables: (v: string[]) => void;
  turnaround: string;
  /* collabs */
  collabs: Collaboration[];
  addCollab: () => void;
  removeCollab: (id: number) => void;
  updateCollab: (
    id: number,
    field: keyof Collaboration,
    value: string | boolean,
  ) => void;
}

export function CustomizeTab(props: Props) {
  const {
    profilePic,
    setProfilePic,
    displayName,
    setDisplayName,
    appUsername,
    handle,
    tagline,
    setTagline,
    location,
    setLocation,
    availableForCollabs,
    setAvailableForCollabs,
    nicheTags,
    setNicheTags,
    igStats,
    igInsights,
    igPosts,
    packages,
    addPackage,
    removePackage,
    updatePackage,
    prefIndustries,
    setPrefIndustries,
    restrictedIndustries,
    setRestrictedIndustries,
    deliverables,
    setDeliverables,
    turnaround,
    collabs,
    addCollab,
    removeCollab,
    updateCollab,
  } = props;

  const [showPreview, setShowPreview] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newPrefIndustry, setNewPrefIndustry] = useState("");
  const [newRestrictedIndustry, setNewRestrictedIndustry] = useState("");
  const [newDeliverable, setNewDeliverable] = useState("");

  const previewProps = {
    name: displayName,
    handle,
    tagline,
    location,
    profilePic,
    stats: igStats,
    insights: igInsights,
    posts: igPosts,
    availableForCollabs,
    nicheTags,
    packages,
    collabs,
    prefIndustries,
    restrictedIndustries,
    deliverables,
    turnaround,
  };

  return (
    <>
      {/* Mobile full-screen preview modal */}
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
            <ProfilePreview {...previewProps} />
          </div>
        </div>
      )}

      <div className="h-full flex justify-center overflow-hidden bg-muted/30]">
        <div className="flex w-full max-w-5xl overflow-hidden">
          {/* ── Form panel ── */}
          <div className="w-full lg:w-[440px] shrink-0 overflow-y-auto px-4 lg:px-6 py-5 space-y-4 pb-24 lg:pb-5">
            {/* Mobile preview button */}
            <button
              onClick={() => setShowPreview(true)}
              className="lg:hidden w-full bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
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

            {/* Profile */}
            <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="font-semibold text-gray-900 text-sm">Profile</p>
              </div>
              <div className="px-5 py-4 flex items-center gap-4 border-b border-gray-100">
                <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden shrink-0">
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10" />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1.5 text-sm text-gray-700 border border-gray-200 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <svg
                      width="13"
                      height="13"
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
                    Replace
                  </button>
                  <button
                    onClick={() => setProfilePic(null)}
                    className="text-sm text-red-500 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="px-5 py-4 space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                    Display Name
                  </label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                    Username (URL)
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                    <input
                      value={appUsername}
                      readOnly
                      className="flex-1 px-3 py-2.5 text-sm bg-gray-50 text-gray-500 outline-none cursor-default"
                    />
                    <span className="text-sm text-gray-400 px-3 border-l border-gray-200 bg-gray-50 py-2.5 shrink-0">
                      .kloot.io
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                    Bio
                  </label>
                  <textarea
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                    Location
                  </label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                    Niche Tags (comma separated)
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
                          const t = val.slice(0, -1).trim();
                          if (t && !nicheTags.includes(t))
                            setNicheTags([...nicheTags, t]);
                          setNewTag("");
                        } else setNewTag(val);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const t = newTag.trim();
                          if (t && !nicheTags.includes(t))
                            setNicheTags([...nicheTags, t]);
                          setNewTag("");
                        }
                      }}
                      onBlur={() => {
                        const t = newTag.trim();
                        if (t && !nicheTags.includes(t))
                          setNicheTags([...nicheTags, t]);
                        setNewTag("");
                      }}
                      placeholder="Add tag…"
                      className="text-xs text-gray-700 placeholder:text-gray-300 bg-transparent outline-none w-20 py-0.5"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_NICHE_TAGS.filter((t) => !nicheTags.includes(t)).map(
                      (tag) => (
                        <button
                          key={tag}
                          onClick={() => setNicheTags([...nicheTags, tag])}
                          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          + {tag}
                        </button>
                      ),
                    )}
                  </div>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availableForCollabs}
                    onChange={(e) => setAvailableForCollabs(e.target.checked)}
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
                    <p className="font-bold text-gray-900 text-sm">{value}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400">
                ↻ Analytics refresh automatically every 24 hours from Instagram.
                They cannot be edited.
              </p>
            </section>

            {/* Packages */}
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
                        updatePackage(pkg.id, "description", e.target.value)
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
                            updatePackage(pkg.id, "popular", e.target.checked)
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

            {/* Collab preferences */}
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
                    Preferred industries{" "}
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
                          const t = val.slice(0, -1).trim();
                          if (t && !prefIndustries.includes(t))
                            setPrefIndustries([...prefIndustries, t]);
                          setNewPrefIndustry("");
                        } else setNewPrefIndustry(val);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const t = newPrefIndustry.trim();
                          if (t && !prefIndustries.includes(t))
                            setPrefIndustries([...prefIndustries, t]);
                          setNewPrefIndustry("");
                        }
                      }}
                      onBlur={() => {
                        const t = newPrefIndustry.trim();
                        if (t && !prefIndustries.includes(t))
                          setPrefIndustries([...prefIndustries, t]);
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
                          const t = val.slice(0, -1).trim();
                          if (t && !restrictedIndustries.includes(t))
                            setRestrictedIndustries([
                              ...restrictedIndustries,
                              t,
                            ]);
                          setNewRestrictedIndustry("");
                        } else setNewRestrictedIndustry(val);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const t = newRestrictedIndustry.trim();
                          if (t && !restrictedIndustries.includes(t))
                            setRestrictedIndustries([
                              ...restrictedIndustries,
                              t,
                            ]);
                          setNewRestrictedIndustry("");
                        }
                      }}
                      onBlur={() => {
                        const t = newRestrictedIndustry.trim();
                        if (t && !restrictedIndustries.includes(t))
                          setRestrictedIndustries([...restrictedIndustries, t]);
                        setNewRestrictedIndustry("");
                      }}
                      placeholder="Add industry…"
                      className="text-xs text-gray-700 placeholder:text-gray-300 bg-transparent outline-none w-28 py-0.5"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    Deliverables offered{" "}
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
                          const t = val.slice(0, -1).trim();
                          if (t && !deliverables.includes(t))
                            setDeliverables([...deliverables, t]);
                          setNewDeliverable("");
                        } else setNewDeliverable(val);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const t = newDeliverable.trim();
                          if (t && !deliverables.includes(t))
                            setDeliverables([...deliverables, t]);
                          setNewDeliverable("");
                        }
                      }}
                      onBlur={() => {
                        const t = newDeliverable.trim();
                        if (t && !deliverables.includes(t))
                          setDeliverables([...deliverables, t]);
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
                        onClick={() => setDeliverables([...deliverables, tag])}
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

            {/* Past collabs */}
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
                            updateCollab(c.id, "featured", e.target.checked)
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

          {/* ── Preview panel (desktop) ── */}
          <div className="hidden lg:flex flex-1 flex-col px-6 py-5 overflow-hidden">
            <div className="flex-1 rounded-2xl border border-gray-200 bg-white overflow-hidden flex flex-col shadow-sm">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-400">
                  kloot.io/{appUsername || "yourhandle"}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <ProfilePreview {...previewProps} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
