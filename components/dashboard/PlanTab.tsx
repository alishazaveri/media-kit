"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Button from "@/components/reusable/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import SubscribeButtonHOC from "@/components/SubscribeButtonHOC";
import { PricingCards } from "@/components/PricingCards";
import { useUser } from "@/contexts/UserContext";
import { getPricingByPlanId } from "@/lib/plans";

interface Invoice {
  _id: string;
  invoice_number: string;
  plan_name: string;
  invoice_date: string;
  total_amount: number;
  currency: string;
  pdf_url?: string;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PlanTab() {
  const { userId, subscription, scheduledSubscription, trialEndsAt, loading, refresh } = useUser();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCancelScheduledModal, setShowCancelScheduledModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  useEffect(() => {
    axios.get<{ invoices: Invoice[] }>("/api/invoices")
      .then((r) => setInvoices(r.data.invoices))
      .catch(() => {})
      .finally(() => setInvoicesLoading(false));
  }, []);

  const matched = subscription?.planId ? getPricingByPlanId(subscription.planId) : null;
  const renewalDate = formatDate(subscription?.currentPeriodEnd ?? null);
  const scheduledMatched = scheduledSubscription?.planId ? getPricingByPlanId(scheduledSubscription.planId) : null;
  const scheduledStartDate = formatDate(scheduledSubscription?.startsAt ?? null);
  const scheduledOtherBilling = scheduledMatched?.billing === "monthly" ? "yearly" : "monthly";
  const scheduledOtherPricing = scheduledMatched ? scheduledMatched.plan.pricing[scheduledOtherBilling] : null;
  const scheduledStartAt = scheduledSubscription?.startsAt ? Math.floor(new Date(scheduledSubscription.startsAt).getTime() / 1000) : undefined;

  const otherBilling = matched?.billing === "monthly" ? "yearly" : "monthly";
  const otherPricing = matched ? matched.plan.pricing[otherBilling] : null;

  async function handleCancel() {
    setCancelling(true);
    setCancelError(null);
    try {
      await axios.post("/api/payments/cancel-subscription");
      setShowCancelModal(false);
      setShowCancelScheduledModal(false);
      refresh();
    } catch (err: any) {
      setCancelError(err?.response?.data?.error ?? "Something went wrong. Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <>
      {showCancelModal && (
        <ConfirmModal
          title="Cancel your plan?"
          description={`You'll keep access until ${renewalDate ?? "the end of your billing period"}. After that, your kloot link will be deactivated.`}
          confirmLabel={cancelling ? "Cancelling…" : "Yes, cancel plan"}
          cancelLabel="Keep plan"
          onConfirm={handleCancel}
          onCancel={() => { setShowCancelModal(false); setCancelError(null); }}
        />
      )}

      {showCancelScheduledModal && (
        <ConfirmModal
          title="Cancel scheduled plan?"
          description="Your scheduled plan will be cancelled before it starts. No charges will be made."
          confirmLabel={cancelling ? "Cancelling…" : "Yes, cancel plan"}
          cancelLabel="Keep plan"
          onConfirm={handleCancel}
          onCancel={() => { setShowCancelScheduledModal(false); setCancelError(null); }}
        />
      )}

      <div className="h-full overflow-y-auto px-4 lg:px-6 py-5 pb-24 lg:pb-5">
        <div className="max-w-2xl mx-auto space-y-5">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Plans &amp; billing</h2>
            {loading ? (
              <p className="text-sm text-gray-400 mt-1">Loading…</p>
            ) : matched ? (
              <p className="text-sm text-gray-500 mt-1">
                You&apos;re on the{" "}
                <strong className="text-primary font-semibold">{matched.plan.name}</strong> plan,
                billed {matched.billing === "yearly" ? "annually" : "monthly"}.
              </p>
            ) : scheduledMatched ? (
              <p className="text-sm text-gray-500 mt-1">
                Your <strong className="text-primary font-semibold">{scheduledMatched.plan.name}</strong> plan
                {scheduledStartDate ? ` starts on ${scheduledStartDate}` : " is scheduled"}.
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-1">You don&apos;t have an active plan.</p>
            )}
          </div>

          {/* Cancel-at-cycle-end warning */}
          {subscription?.cancelAtCycleEnd && renewalDate && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800">Plan cancellation scheduled</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  Your kloot link stays active until <strong>{renewalDate}</strong>. No further charges will be made.
                </p>
              </div>
            </div>
          )}

          {/* Plan card */}
          {matched ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900 text-base">{matched.plan.name}</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">
                    ₹{matched.pricing.effectiveMonthlyPrice}
                    <span className="text-base font-normal text-gray-400"> /mo</span>
                    {matched.billing === "yearly" && (
                      <span className="text-sm font-normal text-gray-400 ml-2">
                        · ₹{matched.pricing.price}/yr
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">{matched.pricing.billingLabel}</p>
                </div>
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Active
                </span>
              </div>

              {renewalDate && !subscription?.cancelAtCycleEnd && (
                <p className="text-sm text-gray-400">
                  Renews on <span className="text-gray-600 font-medium">{renewalDate}</span>
                </p>
              )}
            </div>
          ) : scheduledMatched && !loading ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900 text-base">{scheduledMatched.plan.name}</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">
                    ₹{scheduledMatched.pricing.effectiveMonthlyPrice}
                    <span className="text-base font-normal text-gray-400"> /mo</span>
                    {scheduledMatched.billing === "yearly" && (
                      <span className="text-sm font-normal text-gray-400 ml-2">
                        · ₹{scheduledMatched.pricing.price}/yr
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">{scheduledMatched.pricing.billingLabel}</p>
                </div>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Scheduled
                </span>
              </div>
              {scheduledStartDate && (
                <p className="text-sm text-gray-400">
                  Billing starts on <span className="text-gray-600 font-medium">{scheduledStartDate}</span>
                </p>
              )}
            </div>
          ) : !loading ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center flex flex-col gap-3 items-center">
              <p className="text-gray-500 text-sm">You don&apos;t have an active plan.</p>
              <Button variant="primary" size="sm" className="rounded-xl" onClick={() => setShowActivateModal(true)}>
                Activate your kloot link
              </Button>
            </div>
          ) : null}

          {/* Scheduled plan actions — switch billing or cancel before it starts */}
          {scheduledMatched && scheduledOtherPricing && scheduledStartAt && (
            <SubscribeButtonHOC
              userId={userId}
              planId={scheduledOtherPricing.id}
              startAt={scheduledStartAt}
              onSuccess={async (v) => {
                const newSubId = v?.subscription?.razorpay_subscription_id;
                await fetch("/api/payments/cancel-subscription", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ excludeSubscriptionId: newSubId }),
                });
                refresh();
              }}
            >
              {({ onSubscribe, loading: switching }) => (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={onSubscribe}
                  disabled={switching || !userId}
                  loading={switching}
                >
                  {switching
                    ? "Processing…"
                    : scheduledOtherBilling === "yearly"
                    ? `Switch to yearly · Save ${scheduledOtherPricing.discountPct ?? 15}%`
                    : `Switch to monthly · ₹${scheduledOtherPricing.price}/mo`}
                </Button>
              )}
            </SubscribeButtonHOC>
          )}

          {scheduledMatched && (
            <div className="flex flex-col items-start gap-1">
              {cancelError && (
                <p className="text-sm text-red-500">{cancelError}</p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => setShowCancelScheduledModal(true)}
              >
                Cancel plan
              </Button>
            </div>
          )}

          {/* Activate modal */}
          {showActivateModal && (
            <div
              className="fixed inset-0 z-9999 flex items-end sm:items-center justify-center p-4"
              onClick={() => setShowActivateModal(false)}
            >
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
              <div
                className="relative bg-[#FAF7F2] rounded-3xl shadow-xl w-full max-w-2xl p-6 flex flex-col gap-5 max-h-[90dvh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Activate your kloot link</h2>
                    <p className="text-sm text-gray-500 mt-0.5">One simple plan. Cancel anytime.</p>
                  </div>
                  <button
                    onClick={() => setShowActivateModal(false)}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <PricingCards
                  userId={userId}
                  startAt={trialEndsAt && new Date(trialEndsAt) > new Date() ? Math.floor(new Date(trialEndsAt).getTime() / 1000) : undefined}
                  onSuccess={() => { setShowActivateModal(false); refresh(); }}
                />
              </div>
            </div>
          )}

          {/* Resume — below the card, only when cancellation is scheduled */}
          {matched && subscription?.cancelAtCycleEnd && subscription.currentPeriodEnd && (
            <Button
              variant="primary"
              size="sm"
              className="rounded-xl"
              onClick={() => setShowResumeModal(true)}
            >
              Resume plan
            </Button>
          )}

          {/* Resume modal */}
          {showResumeModal && subscription?.currentPeriodEnd && (
            <div
              className="fixed inset-0 z-9999 flex items-end sm:items-center justify-center p-4"
              onClick={() => setShowResumeModal(false)}
            >
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
              <div
                className="relative bg-[#FAF7F2] rounded-3xl shadow-xl w-full max-w-2xl p-6 flex flex-col gap-5 max-h-[90dvh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Resume your plan</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Pick a plan — payment starts after {renewalDate}.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowResumeModal(false)}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <PricingCards
                  userId={userId}
                  startAt={Math.floor(new Date(subscription.currentPeriodEnd).getTime() / 1000)}
                  onSuccess={() => { setShowResumeModal(false); refresh(); }}
                />
              </div>
            </div>
          )}

          {/* Switch billing — below the card, only when active and not already scheduled */}
          {matched && !subscription?.cancelAtCycleEnd && otherPricing && subscription?.currentPeriodEnd && (
            <SubscribeButtonHOC
              userId={userId}
              planId={otherPricing.id}
              startAt={Math.floor(new Date(subscription.currentPeriodEnd!).getTime() / 1000)}
              onSuccess={async (v) => {
                const newSubId = v?.subscription?.razorpay_subscription_id;
                await fetch("/api/payments/cancel-subscription", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ excludeSubscriptionId: newSubId }),
                });
                refresh();
              }}
            >
              {({ onSubscribe, loading: switching }) => (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={onSubscribe}
                  disabled={switching || !userId}
                  loading={switching}
                >
                  {switching
                    ? "Processing…"
                    : otherBilling === "yearly"
                    ? `Switch to yearly · Save ${otherPricing.discountPct ?? 15}%`
                    : `Switch to monthly · ₹${otherPricing.price}/mo`}
                </Button>
              )}
            </SubscribeButtonHOC>
          )}

          {/* Cancel — below the card, only when active and not already scheduled */}
          {matched && !subscription?.cancelAtCycleEnd && (
            <div className="flex flex-col items-start gap-1">
              {cancelError && (
                <p className="text-sm text-red-500">{cancelError}</p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel plan
              </Button>
            </div>
          )}

          {/* Invoices */}
          {(invoicesLoading || invoices.length > 0) && (
            <div className="flex flex-col gap-3 pt-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Invoices</h3>
              {invoicesLoading ? (
                <p className="text-sm text-gray-400">Loading…</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {invoices.map((inv) => (
                    <div
                      key={inv._id}
                      className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-semibold text-gray-800">{inv.plan_name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(inv.invoice_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                          <span className="mx-1.5">·</span>
                          ₹{(inv.total_amount / 100).toLocaleString("en-IN")}
                        </p>
                      </div>
                      {inv.pdf_url ? (
                        <a
                          href={`/app/invoices/${inv._id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-xs font-semibold text-primary hover:underline"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="shrink-0 text-xs text-gray-300">Processing…</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
