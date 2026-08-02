"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { Pagination } from "@/components/admin/Pagination";
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

type PaginationInfo = { page: number; total: number; totalPages: number };

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

function SortIcon({ field, sort, sortDir }: { field: string; sort: string; sortDir: string }) {
  if (sort !== field) return <span className="text-gray-300 ml-0.5 text-[10px]">↕</span>;
  return <span className="ml-0.5 text-[10px]">{sortDir === "asc" ? "↑" : "↓"}</span>;
}

function UsersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const stage   = searchParams.get("stage") ?? "all";
  const sort    = searchParams.get("sort") ?? "createdAt";
  const sortDir = searchParams.get("sortDir") ?? "desc";
  const limit   = parseInt(searchParams.get("limit") ?? "25");

  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");

  const { data: result, isLoading } = useSWR<{ data: User[]; pagination: PaginationInfo }>(
    `/api/admin/users?${searchParams.toString()}`,
  );

  const users      = result?.data ?? [];
  const pagination = result?.pagination ?? null;

  // Debounce search input → URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      if (searchInput) params.set("search", searchInput);
      else params.delete("search");
      router.replace(`${pathname}?${params.toString()}`);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  }

  function setPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (p > 1) params.set("page", String(p));
    else params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  function setLimit(n: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.set("limit", String(n));
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handleSort(field: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.set("sort", field);
    if (sort === field) {
      params.set("sortDir", sortDir === "asc" ? "desc" : "asc");
    } else {
      params.set("sortDir", "desc");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">Users</h1>
        <p className="text-sm text-gray-400 mt-1">
          {isLoading
            ? "Loading…"
            : `${(pagination?.total ?? 0).toLocaleString()} creator${pagination?.total !== 1 ? "s" : ""} total`}
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, email or handle…"
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors bg-white w-full sm:w-72"
        />
        <div className="flex flex-wrap gap-1.5">
          {STAGES.map((s) => (
            <button
              key={s.key}
              onClick={() => setParam("stage", s.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                stage === s.key || (s.key === "all" && !searchParams.get("stage"))
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
        {isLoading ? (
          <p className="px-6 py-12 text-sm text-gray-400 text-center">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="px-6 py-12 text-sm text-gray-400 text-center">No users found</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Creator</p>
              <button
                onClick={() => handleSort("followers")}
                className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-20 text-right cursor-pointer hover:text-gray-600 transition-colors"
              >
                Followers <SortIcon field="followers" sort={sort} sortDir={sortDir} />
              </button>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-56 text-center">Stage</p>
              <button
                onClick={() => handleSort("createdAt")}
                className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-28 text-right cursor-pointer hover:text-gray-600 transition-colors"
              >
                Joined <SortIcon field="createdAt" sort={sort} sortDir={sortDir} />
              </button>
            </div>
            {users.map((u) => {
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

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-400">Loading…</div>}>
      <UsersContent />
    </Suspense>
  );
}
