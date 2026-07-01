"use client";

import { useState } from "react";
import { PLANS, type BillingFrequency } from "@/lib/plans";
import SubscribeButtonHOC from "@/components/SubscribeButtonHOC";
import Button from "@/components/reusable/Button";

type Props = {
  userId: string;
  onSuccess: () => void;
  startAt?: number;
};

export function PricingCards({ userId, onSuccess, startAt }: Props) {
  const [billing, setBilling] = useState<BillingFrequency>("yearly");

  return (
    <div className="flex flex-col gap-6">
      {/* Billing toggle */}
      <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1 max-w-sm">
        <button
          onClick={() => setBilling("monthly")}
          className={`cursor-pointer flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${billing === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling("yearly")}
          className={`cursor-pointer flex-1 text-sm font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${billing === "yearly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
        >
          Yearly
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${billing === "yearly" ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-400"}`}>
            Save 15%
          </span>
        </button>
      </div>

      {/* Plan cards */}
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        {PLANS.map((plan) => {
          const pricing = plan.pricing[billing];
          return (
            <div
              key={plan.key}
              className="bg-white rounded-2xl border border-gray-200 p-7 flex flex-col gap-6 lg:flex-1"
            >
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h2>
                <p className="text-sm text-gray-400">{plan.description}</p>
              </div>

              <div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-5xl font-black text-gray-900">
                    ₹{pricing.effectiveMonthlyPrice}
                  </span>
                  <span className="text-lg text-gray-400 mb-2">/month</span>
                  {billing === "yearly" && pricing.originalMonthlyPrice && (
                    <span className="text-lg text-gray-300 line-through mb-2">
                      ₹{pricing.originalMonthlyPrice}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">{pricing.billingLabel}</p>
                {billing === "yearly" && pricing.savingsNote && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-lg">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0">
                      <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5L8 2z" fill="currentColor" />
                    </svg>
                    {pricing.savingsNote}
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
                planId={pricing.id}
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
                    className="rounded-xl"
                  >
                    {loading ? "Processing…" : `Pay ₹${pricing.price} & activate`}
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
