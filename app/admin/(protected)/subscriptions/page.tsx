"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import { getPricingByPlanId } from "@/lib/plans";

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
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
  } | null;
};

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
  const result = getPricingByPlanId(planId);
  if (!result) return planId;
  return `${result.plan.name} · ${result.billing.charAt(0).toUpperCase() + result.billing.slice(1)}`;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    axios.get("/api/admin/subscriptions")
      .then((res) => setSubscriptions(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        s.user?.name?.toLowerCase().includes(q) ||
        s.user?.email?.toLowerCase().includes(q) ||
        s.user?.username?.toLowerCase().includes(q) ||
        s.razorpaySubscriptionId.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [subscriptions, search, statusFilter]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">Subscriptions</h1>
        <p className="text-sm text-gray-400 mt-1">
          {loading ? "Loading…" : `${subscriptions.length} subscription${subscriptions.length !== 1 ? "s" : ""} total`}
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or Razorpay ID…"
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors bg-white w-full sm:w-80"
        />
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer capitalize ${
                statusFilter === s
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
        {loading ? (
          <p className="px-6 py-12 text-sm text-gray-400 text-center">Loading subscriptions…</p>
        ) : filtered.length === 0 ? (
          <p className="px-6 py-12 text-sm text-gray-400 text-center">No subscriptions found</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-36">Razorpay ID</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">User</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-36 text-left">Plan</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-28 text-center">Status</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-44 text-center">Period</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-28 text-right">Created</p>
            </div>

            {filtered.map((sub) => {
              const statusClass = STATUS_BADGE[sub.status] ?? "bg-gray-100 text-gray-500";
              const periodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;
              const isExpiredPeriod = periodEnd && periodEnd < new Date();

              return (
                <Link
                  key={sub.id}
                  href={`/admin/subscriptions/${sub.id}`}
                  className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3.5 items-center hover:bg-gray-50 transition-colors"
                >
                  {/* Razorpay ID */}
                  <p className="text-xs font-mono text-gray-500 w-36 truncate" title={sub.razorpaySubscriptionId}>
                    {sub.razorpaySubscriptionId}
                  </p>

                  {/* User */}
                  {sub.user ? (
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#f9f3f4] flex items-center justify-center shrink-0">
                        <span className="text-xs font-black text-primary">{initials(sub.user.name || sub.user.username)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {sub.user.name || sub.user.username}
                        </p>
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

                  {/* Plan */}
                  <p className="text-xs font-semibold text-gray-700 w-36">
                    {planName(sub.planId)}
                  </p>

                  {/* Status */}
                  <div className="w-28 flex items-center justify-center gap-1.5">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${statusClass}`}>
                      {sub.status}
                    </span>
                    {sub.cancelAtCycleEnd && sub.status === "active" && (
                      <span className="text-[10px] text-red-400 font-semibold">↓ end</span>
                    )}
                  </div>

                  {/* Period */}
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

                  {/* Created */}
                  <p className="text-xs text-gray-400 w-28 text-right">{fmtDate(sub.createdAt)}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
