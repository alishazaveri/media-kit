"use client";

import Link from "next/link";
import useSWR from "swr";
import { SubscriptionChart } from "@/components/admin/SubscriptionChart";
import { UserChart } from "@/components/admin/UserChart";

type DashboardData = {
  totalUsers: number;
  activeSubscriptions: number;
  trialUsers: number;
  revenueINR: number;
  revenueUSD: number;
  recentUsers: { _id: string; name: string; email: string; username: string; created_at: string }[];
  recentInvoices: { _id: string; customer_name: string; plan_name: string; total_amount: number; created_at: string; currency: string }[];
};

function fmtAmount(amount: number, currency: string) {
  if (currency === "USD") return `$${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `₹${(amount / 100).toLocaleString("en-IN")}`;
}

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useSWR<DashboardData>("/api/admin/dashboard", {
    refreshInterval: 60_000,
  });

  const stats = [
    { label: "Total creators",            value: data?.totalUsers.toLocaleString() ?? "—" },
    { label: "Active subscribers",        value: data?.activeSubscriptions.toLocaleString() ?? "—" },
    { label: "On trial",                  value: data?.trialUsers.toLocaleString() ?? "—" },
    { label: "Revenue this month (INR)",  value: data ? fmtAmount(data.revenueINR, "INR") : "—" },
    { label: "Revenue this month (USD)",  value: data ? fmtAmount(data.revenueUSD, "USD") : "—" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          {isLoading ? "Loading…" : "Overview of all activity"}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 px-5 py-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{s.label}</p>
            <p className={`text-3xl font-black ${isLoading ? "text-gray-200" : "text-gray-900"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="flex flex-col gap-5 mb-5">
        <SubscriptionChart />
        <UserChart />
      </div>

      {/* Two-column tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent signups */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-black text-gray-900">Recent signups</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {isLoading ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">Loading…</p>
            ) : (data?.recentUsers ?? []).length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">No signups yet</p>
            ) : (
              (data?.recentUsers ?? []).map((u) => (
                <Link
                  key={u._id}
                  href={`/admin/users/${u._id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{u.name || u.username}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 ml-4">{timeAgo(u.created_at)}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent payments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-black text-gray-900">Recent payments</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {isLoading ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">Loading…</p>
            ) : (data?.recentInvoices ?? []).length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">No payments yet</p>
            ) : (
              (data?.recentInvoices ?? []).map((inv) => (
                <div key={inv._id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{inv.customer_name}</p>
                    <p className="text-xs text-gray-400">{inv.plan_name}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-black text-gray-900">{fmtAmount(inv.total_amount, inv.currency ?? "INR")}</p>
                    <p className="text-xs text-gray-400">{timeAgo(inv.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
