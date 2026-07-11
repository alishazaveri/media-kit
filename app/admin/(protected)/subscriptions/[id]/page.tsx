"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { getPricingByPlanId } from "@/lib/plans";

type SubscriptionDetail = {
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
  invoices: {
    id: string;
    invoiceNumber: string;
    planName: string;
    totalAmount: number;
    status: string;
    invoiceDate: string;
    periodStart: string | null;
    periodEnd: string | null;
    pdfUrl: string | null;
  }[];
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

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtPaise(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function initials(name: string) {
  return name.trim().split(/\s+/).map((p) => p[0]?.toUpperCase() ?? "").join("").slice(0, 2) || "?";
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <p className="text-xs text-gray-400 shrink-0 w-36">{label}</p>
      <p className="text-xs font-semibold text-gray-800 text-right break-all">{value ?? "—"}</p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <h2 className="text-sm font-black text-gray-900">{title}</h2>
      </div>
      <div className="px-5 py-3">{children}</div>
    </div>
  );
}

export default function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<SubscriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    axios.get(`/api/admin/subscriptions/${id}`)
      .then((res) => setData(res.data.data))
      .catch((err) => { if (err.response?.status === 404) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="p-8">
        <p className="text-sm text-gray-400">Subscription not found.</p>
        <Link href="/admin/subscriptions" className="text-sm text-primary font-semibold mt-2 block">
          ← Back to subscriptions
        </Link>
      </div>
    );
  }

  const planResult = getPricingByPlanId(data.planId);
  const resolvedPlanName = planResult
    ? `${planResult.plan.name} · ${planResult.billing.charAt(0).toUpperCase() + planResult.billing.slice(1)}`
    : data.planId;

  const statusClass = STATUS_BADGE[data.status] ?? "bg-gray-100 text-gray-500";

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/subscriptions"
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors mb-4 inline-flex items-center gap-1"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All subscriptions
        </Link>

        <div className="flex items-center gap-3 mt-2">
          <p className="text-xl font-black text-gray-900 font-mono">{data.razorpaySubscriptionId}</p>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${statusClass}`}>
            {data.status}
          </span>
          {data.cancelAtCycleEnd && data.status === "active" && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-400">
              Cancels at cycle end
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left */}
        <div className="space-y-5">
          <Card title="Subscription">
            <Row label="Plan" value={resolvedPlanName} />
            <Row label="Plan ID" value={<span className="font-mono text-[11px]">{data.planId}</span>} />
            <Row label="Status" value={
              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${statusClass}`}>
                {data.status}
              </span>
            } />
            <Row label="Current period" value={
              data.currentPeriodStart && data.currentPeriodEnd
                ? `${fmtDate(data.currentPeriodStart)} – ${fmtDate(data.currentPeriodEnd)}`
                : null
            } />
            {data.subscriptionStartAt && (
              <Row label="Starts on" value={fmtDate(data.subscriptionStartAt)} />
            )}
            {data.cancelAtCycleEnd && (
              <Row label="Cancels on" value={
                <span className="text-red-500">{fmtDate(data.currentPeriodEnd)}</span>
              } />
            )}
            {data.cancelledAt && (
              <Row label="Cancelled at" value={fmtDate(data.cancelledAt)} />
            )}
            <Row label="Created" value={fmtDate(data.createdAt)} />
            <Row label="Razorpay ID" value={
              <span className="font-mono text-[11px]">{data.razorpaySubscriptionId}</span>
            } />
          </Card>

          {/* User */}
          {data.user ? (
            <Card title="User">
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#f9f3f4] flex items-center justify-center shrink-0">
                    <span className="text-sm font-black text-primary">{initials(data.user.name || data.user.username)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{data.user.name || data.user.username}</p>
                    <p className="text-xs text-gray-400">{data.user.email}</p>
                  </div>
                </div>
                <Link
                  href={`/admin/users/${data.user.id}`}
                  className="text-xs font-semibold text-primary hover:underline shrink-0 ml-3"
                >
                  View user →
                </Link>
              </div>
            </Card>
          ) : (
            <Card title="User">
              <p className="text-xs text-gray-400 py-2">User not found</p>
            </Card>
          )}
        </div>

        {/* Right — Invoices */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-black text-gray-900">Payment history</h2>
          </div>
          {data.invoices.length === 0 ? (
            <p className="px-5 py-8 text-xs text-gray-400">No payments for this subscription</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800">{inv.invoiceNumber}</p>
                    <p className="text-xs text-gray-400">
                      {inv.periodStart && inv.periodEnd
                        ? `${fmtDate(inv.periodStart)} – ${fmtDate(inv.periodEnd)}`
                        : fmtDate(inv.invoiceDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <p className="text-sm font-black text-gray-900">{fmtPaise(inv.totalAmount)}</p>
                    {inv.pdfUrl && (
                      <a
                        href={inv.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
