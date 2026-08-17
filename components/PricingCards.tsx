"use client";

import { useState } from "react";
import { getPlans, type BillingFrequency } from "@/lib/plans";
import { useLocale } from "@/contexts/LocaleContext";
import SubscribeButtonHOC from "@/components/SubscribeButtonHOC";
import Button from "@/components/reusable/Button";

type Props = {
  userId: string;
  onSuccess: () => void;
  startAt?: number;
  currentPlanIsFree?: boolean;
  onFreeSelect?: () => void;
};

export function PricingCards({ userId, onSuccess, startAt, currentPlanIsFree = false, onFreeSelect }: Props) {
  const [billing, setBilling] = useState<BillingFrequency>("yearly");
  const { country } = useLocale();
  const allPlans = getPlans(country);
  const freePlan = allPlans.find((p) => p.isFree) ?? null;
  const paidPlans = allPlans.filter((p) => !p.isFree);
  const symbol = paidPlans[0]?.currency === "INR" ? "₹" : "$";
  const discountPct = paidPlans[0]?.billingOptions.find((b) => b.frequency === "yearly")?.discountPct ?? 15;

  return (
    <div className="flex flex-col gap-6">
      {/* Billing toggle */}
      <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1 w-fit mx-auto">
        <button
          onClick={() => setBilling("monthly")}
          className={`cursor-pointer px-5 py-2 text-sm font-semibold rounded-lg transition-all ${billing === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling("yearly")}
          className={`cursor-pointer px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${billing === "yearly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
        >
          Yearly
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${billing === "yearly" ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-400"}`}>
            Save {discountPct}%
          </span>
        </button>
      </div>

      {/* Plan cards */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {/* Free plan card */}
        {freePlan && (
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-7 flex flex-col gap-6 sm:flex-1">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">{freePlan.name}</h2>
              <p className="text-sm text-gray-400">{freePlan.description}</p>
            </div>
            <div>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-5xl font-black text-gray-900">{symbol}0</span>
                <span className="text-lg text-gray-400 mb-2">/month</span>
              </div>
              <p className="text-sm text-gray-400">No credit card required</p>
            </div>
            <ul className="space-y-3">
              {freePlan.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                    <path d="M3 8L6.5 11.5L13 5" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            {onFreeSelect ? (
              <Button variant="default" size="lg" fullWidth className="rounded-xl mt-auto" onClick={onFreeSelect}>
                Continue for free
              </Button>
            ) : (
              <Button variant="outline" size="lg" fullWidth className="rounded-xl mt-auto" disabled>
                {currentPlanIsFree ? "Current plan" : "Free forever"}
              </Button>
            )}
          </div>
        )}

        {/* Paid plan cards */}
        {paidPlans.map((plan) => {
          const billingOption = plan.billingOptions.find((b) => b.frequency === billing);
          if (!billingOption) return null;
          return (
            <div
              key={plan.id}
              className="bg-white rounded-2xl border border-gray-200 p-7 flex flex-col gap-6 sm:flex-1"
            >
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h2>
                <p className="text-sm text-gray-400">{plan.description}</p>
              </div>

              <div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-5xl font-black text-gray-900">
                    {symbol}{billingOption.effectiveMonthlyAmount}
                  </span>
                  <span className="text-lg text-gray-400 mb-2">/month</span>
                  {billing === "yearly" && billingOption.originalMonthlyAmount && (
                    <span className="text-lg text-gray-300 line-through mb-2">
                      {symbol}{billingOption.originalMonthlyAmount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">{billingOption.billingLabel}</p>
                {billing === "yearly" && billingOption.savingsNote && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-lg">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0">
                      <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5L8 2z" fill="currentColor" />
                    </svg>
                    {billingOption.savingsNote}
                  </div>
                )}
              </div>

              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                      <path d="M3 8L6.5 11.5L13 5" stroke="#E8714A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <SubscribeButtonHOC
                userId={userId}
                planId={billingOption.razorpayDetails?.planId ?? ""}
                startAt={startAt}
                onSuccess={onSuccess}
              >
                {({ onSubscribe, loading }) => (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={onSubscribe}
                    disabled={loading || !userId}
                    loading={loading}
                    fullWidth
                    className="rounded-xl mt-auto"
                  >
                    {loading ? "Processing…" : `Pay ${symbol}${billingOption.amount} & activate`}
                  </Button>
                )}
              </SubscribeButtonHOC>
            </div>
          );
        })}
      </div>
    </div>
  );
}
