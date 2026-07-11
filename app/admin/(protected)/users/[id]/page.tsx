"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import type { JourneyStage, SubscriptionSlotStage } from "@/app/api/admin/users/route";
import { getPricingByPlanId } from "@/lib/plans";

type UserDetail = {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    phone: string | null;
    phoneCountryCode: string | null;
    profileImageUrl: string | null;
    trialEndsAt: string | null;
    lastDataRefreshedAt: string | null;
    createdAt: string;
  };
  social: {
    handle: string;
    followers: number;
    following: number;
    mediaCount: number;
    connectedAt: string;
  } | null;
  subscription: {
    id: string;
    status: string;
    planId: string;
    razorpaySubscriptionId: string;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    subscriptionStartAt: string | null;
    cancelAtCycleEnd: boolean;
    cancelledAt: string | null;
    createdAt: string;
  } | null;
  kit: {
    hasPublished: boolean;
    publishedName: string | null;
    hasDraft: boolean;
    draftName: string | null;
    draftTagline: string | null;
    updatedAt: string | null;
  };
  invoices: {
    id: string;
    invoiceNumber: string;
    planName: string;
    totalAmount: number;
    status: string;
    invoiceDate: string;
    pdfUrl: string | null;
  }[];
  stage: JourneyStage;
  subscriptionSlotStage: SubscriptionSlotStage;
  trialExpired: boolean;
};

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

const SUB_STATUS_BADGE: Record<string, string> = {
  active:        "bg-green-50 text-green-600",
  authenticated: "bg-orange-50 text-orange-600",
  created:       "bg-gray-100 text-gray-500",
  cancelled:     "bg-red-50 text-red-500",
  expired:       "bg-gray-100 text-gray-400",
};

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDateTime(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

function fmtPaise(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function initials(name: string) {
  return name.trim().split(/\s+/).map((p) => p[0]?.toUpperCase() ?? "").join("").slice(0, 2) || "?";
}

type SlotDef = {
  id: string;
  label: string;
  trialOnly?: boolean;
  isSubscriptionSlot?: boolean;
};

const ALL_SLOTS: SlotDef[] = [
  { id: "signed_up",        label: "Signed up" },
  { id: "instagram_connected", label: "Instagram" },
  { id: "trial_started",    label: "Trial",        trialOnly: true },
  { id: "subscription_slot", label: "Subscription", isSubscriptionSlot: true },
  { id: "published",        label: "Published" },
];

function stageToSlotId(stage: JourneyStage): string {
  if (stage === "subscribed" || stage === "cancelled" || stage === "scheduled") {
    return "subscription_slot";
  }
  if (stage === "trial_expired") return "trial_started";
  return stage;
}

function StageFlow({
  stage,
  hasTrial,
  subscriptionSlotStage,
  trialExpired,
}: {
  stage: JourneyStage;
  hasTrial: boolean;
  subscriptionSlotStage: SubscriptionSlotStage;
  trialExpired: boolean;
}) {
  const visibleSlots = ALL_SLOTS.filter((s) => !s.trialOnly || hasTrial);
  const currentSlotId = stageToSlotId(stage);
  const currentVisibleIndex = visibleSlots.findIndex((s) => s.id === currentSlotId);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 mb-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Journey</p>
      <div className="flex items-center">
        {visibleSlots.map((slot, i) => {
          const isLast = i === visibleSlots.length - 1;

          // Subscription slot only counts as completed if it was actually reached
          const isCompleted = i < currentVisibleIndex && !(slot.isSubscriptionSlot && !subscriptionSlotStage);
          const isCurrent = slot.id === currentSlotId;

          let nodeClass = "bg-gray-100";
          let labelClass = "text-gray-300";
          let label = slot.label;
          let icon: "check" | "x" | "dot" = "dot";

          if (slot.isSubscriptionSlot) {
            if (isCompleted && subscriptionSlotStage === "cancelled") {
              nodeClass = "bg-red-400";
              labelClass = "text-red-400";
              label = "Cancelled";
              icon = "x";
            } else if (isCompleted) {
              nodeClass = "bg-gray-900";
              labelClass = "text-gray-500";
              label = subscriptionSlotStage
                ? subscriptionSlotStage.charAt(0).toUpperCase() + subscriptionSlotStage.slice(1)
                : "Subscription";
              icon = "check";
            } else if (isCurrent) {
              if (subscriptionSlotStage === "subscribed") {
                nodeClass = "bg-primary ring-4 ring-[#fff4f1]";
                labelClass = "text-primary";
                label = "Subscribed";
              } else if (subscriptionSlotStage === "cancelled") {
                nodeClass = "bg-red-400 ring-4 ring-red-50";
                labelClass = "text-red-400";
                label = "Cancelled";
                icon = "x";
              } else if (subscriptionSlotStage === "scheduled") {
                nodeClass = "bg-amber-400 ring-4 ring-amber-50";
                labelClass = "text-amber-500";
                label = "Scheduled";
              }
            }
          } else if (slot.id === "trial_started") {
            if (isCompleted) {
              nodeClass = trialExpired ? "bg-red-400" : "bg-gray-900";
              icon = trialExpired ? "x" : "check";
              labelClass = trialExpired ? "text-red-400" : "text-gray-500";
              if (trialExpired) label = "Trial Expired";
            } else if (isCurrent) {
              if (trialExpired) {
                nodeClass = "bg-red-400 ring-4 ring-red-50";
                labelClass = "text-red-400";
                icon = "x";
                label = "Trial Expired";
              } else {
                nodeClass = "bg-amber-400 ring-4 ring-amber-50";
                labelClass = "text-amber-500";
              }
            }
          } else {
            if (isCompleted) {
              nodeClass = "bg-gray-900";
              labelClass = "text-gray-500";
              icon = "check";
            } else if (isCurrent) {
              if (slot.id === "instagram_connected" || slot.id === "signed_up") {
                nodeClass = "bg-gray-900";
                labelClass = "text-gray-500";
                icon = "check";
              } else {
                nodeClass = slot.id === "published" ? "bg-primary" : "bg-primary ring-4 ring-[#fff4f1]";
                labelClass = "text-primary";
                if (slot.id === "published") icon = "check";
              }
            }
          }

          const connectorFilled = i < currentVisibleIndex;

          return (
            <div key={slot.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${nodeClass}`}>
                  {icon === "check" ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : icon === "x" ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 2L8 8M8 2L2 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${isCurrent ? "bg-white" : "bg-gray-300"}`} />
                  )}
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className={`text-[10px] font-semibold whitespace-nowrap ${labelClass}`}>
                    {label}
                  </span>
                </div>
              </div>
              {!isLast && (
                <div className={`h-[2px] flex-1 mx-1 mb-5 rounded-full ${connectorFilled ? "bg-gray-900" : "bg-gray-100"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <p className="text-xs text-gray-400 shrink-0 w-36">{label}</p>
      <p className="text-xs font-semibold text-gray-800 text-right">{value ?? "—"}</p>
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

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    axios.get(`/api/admin/users/${id}`)
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
        <p className="text-sm text-gray-400">User not found.</p>
        <Link href="/admin/users" className="text-sm text-primary font-semibold mt-2 block">
          ← Back to users
        </Link>
      </div>
    );
  }

  const { user, social, subscription, kit, invoices, stage, subscriptionSlotStage, trialExpired } = data;
  const badge = STAGE_BADGE[stage];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors mb-4 inline-flex items-center gap-1"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All users
        </Link>

        <div className="flex items-center gap-4 mt-2">
          <div className="w-12 h-12 rounded-full bg-[#f9f3f4] flex items-center justify-center shrink-0">
            <span className="text-base font-black text-primary">{initials(user.name || user.username)}</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-gray-900">{user.name || user.username}</h1>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${badge.className}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>
          </div>
        </div>
      </div>

      <StageFlow stage={stage} hasTrial={!!user.trialEndsAt} subscriptionSlotStage={subscriptionSlotStage} trialExpired={trialExpired} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Account */}
          <Card title="Account">
            <Row label="Username" value={`@${user.username}`} />
            <Row label="Phone" value={user.phone ? `${user.phoneCountryCode ?? ""} ${user.phone}`.trim() : null} />
            <Row label="Joined" value={fmtDate(user.createdAt)} />
            <Row label="Last data refresh" value={fmtDateTime(user.lastDataRefreshedAt)} />
            {user.trialEndsAt && (
              <Row
                label="Trial ends"
                value={
                  <span className={new Date(user.trialEndsAt) < new Date() ? "text-red-500" : "text-amber-600"}>
                    {fmtDate(user.trialEndsAt)}
                  </span>
                }
              />
            )}
          </Card>

          {/* Instagram */}
          {social ? (
            <Card title="Instagram">
              <Row label="Handle" value={`@${social.handle}`} />
              <Row label="Followers" value={fmtFollowers(social.followers)} />
              <Row label="Following" value={fmtFollowers(social.following)} />
              <Row label="Posts" value={social.mediaCount.toLocaleString()} />
              <Row label="Connected" value={fmtDate(social.connectedAt)} />
            </Card>
          ) : (
            <Card title="Instagram">
              <p className="text-xs text-gray-400 py-2">Not connected</p>
            </Card>
          )}

          {/* Kit */}
          <Card title="Media kit">
            <Row
              label="Published"
              value={
                kit.hasPublished ? (
                  <span className="text-green-600">{kit.publishedName}</span>
                ) : (
                  <span className="text-gray-400">No</span>
                )
              }
            />
            {kit.hasDraft && <Row label="Draft name" value={kit.draftName} />}
            {kit.draftTagline && <Row label="Draft tagline" value={kit.draftTagline} />}
            {kit.updatedAt && <Row label="Last edited" value={fmtDateTime(kit.updatedAt)} />}
            {kit.hasPublished && (
              <div className="pt-2">
                <a
                  href={`/${user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View kit →
                </a>
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Subscription */}
          <Card title="Subscription">
            {subscription ? (
              <>
                <Row
                  label="Status"
                  value={
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${SUB_STATUS_BADGE[subscription.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {subscription.status}
                    </span>
                  }
                />
                <Row label="Plan" value={(() => {
                  const r = getPricingByPlanId(subscription.planId);
                  return r ? `${r.plan.name} · ${r.billing.charAt(0).toUpperCase() + r.billing.slice(1)}` : subscription.planId;
                })()} />
                <Row label="Plan ID" value={<span className="font-mono text-[11px]">{subscription.planId}</span>} />
                <Row label="Started" value={fmtDate(subscription.subscriptionStartAt)} />
                <Row label="Current period" value={
                  subscription.currentPeriodStart && subscription.currentPeriodEnd
                    ? `${fmtDate(subscription.currentPeriodStart)} – ${fmtDate(subscription.currentPeriodEnd)}`
                    : null
                } />
                {subscription.cancelAtCycleEnd && (
                  <Row label="Cancels on" value={
                    <span className="text-red-500">{fmtDate(subscription.currentPeriodEnd)}</span>
                  } />
                )}
                {subscription.cancelledAt && (
                  <Row label="Cancelled" value={fmtDate(subscription.cancelledAt)} />
                )}
                <Row label="Razorpay ID" value={
                  <span className="font-mono text-[11px]">{subscription.razorpaySubscriptionId}</span>
                } />
                <div className="pt-2">
                  <Link
                    href={`/admin/subscriptions/${subscription.id}`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View subscription →
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400 py-2">No subscription</p>
            )}
          </Card>

          {/* Invoices */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="text-sm font-black text-gray-900">Payment history</h2>
            </div>
            {invoices.length === 0 ? (
              <p className="px-5 py-6 text-xs text-gray-400">No payments yet</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800">{inv.invoiceNumber}</p>
                      <p className="text-xs text-gray-400">{inv.planName} · {fmtDate(inv.invoiceDate)}</p>
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
    </div>
  );
}
