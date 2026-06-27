"use client";

import { useState } from "react";
import axios from "axios";
import Button from "@/components/reusable/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import SubscribeButtonHOC from "@/components/SubscribeButtonHOC";
import { useUser } from "@/contexts/UserContext";
import { getPricingByPlanId } from "@/lib/plans";

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PlanTab() {
  const { userId, subscription, loading, refresh } = useUser();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const matched = subscription?.planId ? getPricingByPlanId(subscription.planId) : null;
  const renewalDate = formatDate(subscription?.currentPeriodEnd ?? null);

  async function handleCancel() {
    setCancelling(true);
    setCancelError(null);
    try {
      await axios.post("/api/payments/cancel-subscription");
      setShowCancelModal(false);
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

          {/* Active plan card */}
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
          ) : !loading ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center flex flex-col gap-3 items-center">
              <p className="text-gray-500 text-sm">No active subscription.</p>
              <Button variant="primary" size="sm" className="rounded-xl" onClick={() => window.location.href = "/app/onboarding"}>
                Activate my link
              </Button>
            </div>
          ) : null}

          {/* Resume — below the card, only when cancellation is scheduled */}
          {matched && subscription?.cancelAtCycleEnd && subscription.currentPeriodEnd && (
            <SubscribeButtonHOC
              userId={userId}
              planId={matched.pricing.id}
              startAt={Math.floor(new Date(subscription.currentPeriodEnd).getTime() / 1000)}
              onSuccess={() => refresh()}
            >
              {({ onSubscribe, loading: resuming }) => (
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-xl"
                  onClick={onSubscribe}
                  disabled={resuming || !userId}
                  loading={resuming}
                >
                  {resuming ? "Processing…" : "Resume plan"}
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
        </div>
      </div>
    </>
  );
}
