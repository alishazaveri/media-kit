"use client";

import { useState } from "react";
import Nav from "@/components/website/Nav";
import Footer from "@/components/website/Footer";
import { PLANS, type BillingFrequency } from "@/lib/plans";

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your dashboard at any time. You keep access until the end of your billing period — no questions asked.",
  },
  {
    q: "What happens to my link if I cancel?",
    a: "Your kloot.io link stays live until your billing period ends. After that it goes inactive — but all your data is preserved, so reactivating is instant.",
  },
  {
    q: "Do you charge GST?",
    a: "Yes, 18% GST is included in the price shown. A proper GST invoice is generated for every payment.",
  },
  {
    q: "Can I switch between monthly and yearly?",
    a: "Yes. You can switch billing frequency anytime from the Plans & Billing page. The change takes effect at the start of your next billing cycle.",
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingFrequency>("yearly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Nav />

      <main className="pt-32 pb-20 px-4">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-gray-500 text-lg">
            One plan. Everything included. Cancel anytime.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`cursor-pointer px-5 py-2 text-sm font-semibold rounded-lg transition-all ${billing === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`cursor-pointer flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${billing === "yearly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
            >
              Yearly
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${billing === "yearly" ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-400"}`}>
                Save 15%
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="max-w-sm mx-auto flex flex-col gap-4">
          {PLANS.map((plan) => {
            const pricing = plan.pricing[billing];
            return (
              <div
                key={plan.key}
                className="bg-white rounded-3xl border border-gray-200 p-8 flex flex-col gap-6 shadow-sm"
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
                        <path d="M3 8L6.5 11.5L13 5" stroke="#ff7350" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="/app/onboarding"
                  className="block w-full bg-primary hover:bg-primary-hover text-white text-sm font-semibold text-center py-3 rounded-xl transition-colors"
                >
                  Get started
                </a>
              </div>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="max-w-2xl mx-auto mt-20">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="flex flex-col divide-y divide-gray-100">
            {FAQS.map((faq, i) => (
              <div key={i} className="py-4">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                >
                  <span className="text-sm font-semibold text-gray-900">{faq.q}</span>
                  <svg
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                    className={`shrink-0 text-gray-400 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                  >
                    <path d="M3 6L8 11L13 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {openFaq === i && (
                  <p className="mt-3 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
