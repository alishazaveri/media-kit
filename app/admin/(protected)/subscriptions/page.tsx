"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { findPlanByGatewayPlanId } from "@/lib/plans";
import { Pagination } from "@/components/admin/Pagination";

type Subscription = {
  id: string;
  razorpaySubscriptionId: string;
  planId: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  subscriptionStartAt: string | null;
  cancelAtCycleEnd: boolean;
  cancelledAt: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; username: string } | null;
};

type PaginationInfo = { page: number; total: number; totalPages: number };

const STATUS_BADGE: Record<string, string> = {
  active:        "bg-green-50 text-green-600",
  authenticated: "bg-amber-50 text-amber-600",
  created:       "bg-gray-100 text-gray-500",
  pending:       "bg-yellow-50 text-yellow-600",
  halted:        "bg-orange-50 text-orange-600",
  cancelled:     "bg-red-50 text-red-400",
  expired:       "bg-gray-100 text-gray-400",
};

const STATUSES = ["all", "active", "authenticated", "cancelled", "expired", "halted", "created"] as const;

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function initials(name: string) {
  return name.trim().split(/\s+/).map((p) => p[0]?.toUpperCase() ?? "").join("").slice(0, 2) || "?";
}

function planName(planId: string) {
  const result = findPlanByGatewayPlanId("razorpay", planId);
  if (!result) return planId;
  return `${result.plan.name} · ${result.billingOption.frequency.charAt(0).toUpperCase() + result.billingOption.frequency.slice(1)}`;
}

function SortIcon({ field, sort, sortDir }: { field: string; sort: string; sortDir: string }) {
  if (sort !== field) return <span className="text-gray-300 ml-0.5 text-[10px]">↕</span>;
  return <span className="ml-0.5 text-[10px]">{sortDir === "asc" ? "↑" : "↓"}</span>;
}

function SubscriptionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const status  = searchParams.get("status") ?? "all";
  const sort    = searchParams.get("sort") ?? "createdAt";
  const sortDir = searchParams.get("sortDir") ?? "desc";
  const limit   = parseInt(searchParams.get("limit") ?? "25");

  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");

  const { data: result, isLoading } = useSWR<{ data: Subscription[]; pagination: PaginationInfo }>(
    `/api/admin/subscriptions?${searchParams.toString()}`,
  );

  const subs       = result?.data ?? [];
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
        <h1 className="text-3xl font-black text-gray-900">Subscriptions</h1>
        <p className="text-sm text-gray-400 mt-1">
          {isLoading
            ? "Loading…"
            : `${(pagination?.total ?? 0).toLocaleString()} subscription${pagination?.total !== 1 ? "s" : ""} total`}
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, email or Razorpay ID…"
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors bg-white w-full sm:w-80"
        />
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setParam("status", s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer capitalize ${
                status === s
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-gray-400"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <p className="px-6 py-12 text-sm text-gray-400 text-center">Loading subscriptions…</p>
        ) : subs.length === 0 ? (
          <p className="px-6 py-12 text-sm text-gray-400 text-center">No subscriptions found</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-36">Razorpay ID</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">User</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-36 text-left">Plan</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-28 text-center">Status</p>
              <button
                onClick={() => handleSort("currentPeriodEnd")}
                className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-44 text-center cursor-pointer hover:text-gray-600 transition-colors"
              >
                Period <SortIcon field="currentPeriodEnd" sort={sort} sortDir={sortDir} />
              </button>
              <button
                onClick={() => handleSort("createdAt")}
                className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-28 text-right cursor-pointer hover:text-gray-600 transition-colors"
              >
                Created <SortIcon field="createdAt" sort={sort} sortDir={sortDir} />
              </button>
            </div>

            {subs.map((sub) => {
              const statusClass = STATUS_BADGE[sub.status] ?? "bg-gray-100 text-gray-500";
              const periodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;
              const isExpiredPeriod = periodEnd && periodEnd < new Date();

              return (
                <Link
                  key={sub.id}
                  href={`/admin/subscriptions/${sub.id}`}
                  className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3.5 items-center hover:bg-gray-50 transition-colors"
                >
                  <p className="text-xs font-mono text-gray-500 w-36 truncate" title={sub.razorpaySubscriptionId}>
                    {sub.razorpaySubscriptionId}
                  </p>

                  {sub.user ? (
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#f9f3f4] flex items-center justify-center shrink-0">
                        <span className="text-xs font-black text-primary">{initials(sub.user.name || sub.user.username)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{sub.user.name || sub.user.username}</p>
                        <p className="text-xs text-gray-400 truncate">{sub.user.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-black text-gray-400">?</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-400">Unknown user</p>
                    </div>
                  )}

                  <p className="text-xs font-semibold text-gray-700 w-36">{planName(sub.planId)}</p>

                  <div className="w-28 flex items-center justify-center gap-1.5">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${statusClass}`}>
                      {sub.status}
                    </span>
                    {sub.cancelAtCycleEnd && sub.status === "active" && (
                      <span className="text-[10px] text-red-400 font-semibold">↓ end</span>
                    )}
                  </div>

                  <div className="w-44 text-center">
                    {sub.currentPeriodStart && sub.currentPeriodEnd ? (
                      <p className={`text-xs font-semibold ${isExpiredPeriod ? "text-gray-400" : "text-gray-700"}`}>
                        {fmtDate(sub.currentPeriodStart)} – {fmtDate(sub.currentPeriodEnd)}
                      </p>
                    ) : sub.subscriptionStartAt ? (
                      <p className="text-xs text-gray-400">Starts {fmtDate(sub.subscriptionStartAt)}</p>
                    ) : (
                      <p className="text-xs text-gray-300">—</p>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 w-28 text-right">{fmtDate(sub.createdAt)}</p>
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

export default function AdminSubscriptionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-400">Loading…</div>}>
      <SubscriptionsContent />
    </Suspense>
  );
}
