"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import type { JourneyStage, SubscriptionSlotStage } from "@/app/api/admin/users/route";

type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  handle: string | null;
  followers: number | null;
  hasTrial: boolean;
  subscriptionSlotStage: SubscriptionSlotStage;
  trialExpired: boolean;
  stage: JourneyStage;
  createdAt: string;
};

const STAGES: { key: JourneyStage | "all"; label: string }[] = [
  { key: "all",                 label: "All" },
  { key: "signed_up",           label: "Signed up" },
  { key: "instagram_connected", label: "Instagram connected" },
  { key: "trial_started",       label: "Trial" },
  { key: "trial_expired",       label: "Trial expired" },
  { key: "subscribed",          label: "Subscribed" },
  { key: "cancelled",           label: "Cancelled" },
  { key: "scheduled",           label: "Scheduled" },
  { key: "published",           label: "Published" },
];

const STAGE_BADGE: Record<JourneyStage, { label: string; className: string }> = {
  signed_up:           { label: "Signed up",           className: "bg-gray-100 text-gray-500" },
  instagram_connected: { label: "Instagram connected", className: "bg-blue-50 text-blue-600" },
  trial_started:       { label: "Trial",               className: "bg-amber-50 text-amber-600" },
  trial_expired:       { label: "Trial expired",       className: "bg-red-50 text-red-400" },
  subscribed:          { label: "Subscribed",          className: "bg-green-50 text-green-600" },
  cancelled:           { label: "Cancelled",           className: "bg-red-50 text-red-400" },
  scheduled:           { label: "Scheduled",           className: "bg-amber-50 text-amber-600" },
  published:           { label: "Published",           className: "bg-[#fff4f1] text-primary" },
};

function initials(name: string) {
  return name.trim().split(/\s+/).map((p) => p[0]?.toUpperCase() ?? "").join("").slice(0, 2) || "?";
}

function fmtFollowers(n: number | null) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<JourneyStage | "all">("all");

  useEffect(() => {
    axios.get("/api/admin/users").then((res) => {
      setUsers(res.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesStage = stageFilter === "all" || u.stage === stageFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.handle?.toLowerCase().includes(q);
      return matchesStage && matchesSearch;
    });
  }, [users, search, stageFilter]);

  // Hide trial-related stages from filter if no trial users exist
  const hasTrialUsers = users.some((u) => u.hasTrial);
  const visibleStages = STAGES.filter(
    (s) => hasTrialUsers || !["trial_started", "trial_expired", "scheduled"].includes(s.key),
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">Users</h1>
        <p className="text-sm text-gray-400 mt-1">
          {loading ? "Loading…" : `${users.length} creator${users.length !== 1 ? "s" : ""} total`}
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or handle…"
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors bg-white w-full sm:w-72"
        />
        <div className="flex flex-wrap gap-1.5">
          {visibleStages.map((s) => (
            <button
              key={s.key}
              onClick={() => setStageFilter(s.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                stageFilter === s.key
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-gray-400"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <p className="px-6 py-12 text-sm text-gray-400 text-center">Loading users…</p>
        ) : filtered.length === 0 ? (
          <p className="px-6 py-12 text-sm text-gray-400 text-center">No users found</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Creator</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-20 text-right">Followers</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-56 text-center">Stage</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-28 text-right">Joined</p>
            </div>
            {filtered.map((u) => {
              const badge = STAGE_BADGE[u.stage];
              return (
                <Link
                  key={u.id}
                  href={`/admin/users/${u.id}`}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3.5 items-center hover:bg-gray-50 transition-colors"
                >
                  {/* Creator */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#f9f3f4] flex items-center justify-center shrink-0">
                      <span className="text-xs font-black text-primary">{initials(u.name || u.username)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{u.name || u.username}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                  </div>
                  {/* Followers */}
                  <p className="text-sm font-semibold text-gray-700 w-20 text-right">
                    {fmtFollowers(u.followers)}
                  </p>
                  {/* Stage */}
                  <div className="w-56 flex items-center justify-center">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                  {/* Joined */}
                  <p className="text-xs text-gray-400 w-28 text-right">{fmtDate(u.createdAt)}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
