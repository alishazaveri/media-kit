export type BillingFrequency = "monthly" | "yearly";

export type PricingVariant = {
  id: string;
  price: number;
  effectiveMonthlyPrice: number;
  billingLabel: string;
  originalMonthlyPrice?: number;
  discountPct?: number;
  savingsNote?: string;
  maxBillingCycles?: number;
};

export type Currency = "INR" | "USD";

export type Plan = {
  key: string;
  name: string;
  description: string;
  features: string[];
  pricingINR: Record<BillingFrequency, PricingVariant>;
  pricingUSD: Record<BillingFrequency, PricingVariant>;
};

export function getPricingByPlanId(planId: string): { plan: Plan; billing: BillingFrequency; pricing: PricingVariant; currency: Currency } | null {
  for (const plan of PLANS) {
    for (const [billing, pricing] of Object.entries(plan.pricingINR) as [BillingFrequency, PricingVariant][]) {
      if (pricing.id === planId) return { plan, billing, pricing, currency: "INR" };
    }
    for (const [billing, pricing] of Object.entries(plan.pricingUSD) as [BillingFrequency, PricingVariant][]) {
      if (pricing.id === planId) return { plan, billing, pricing, currency: "USD" };
    }
  }
  return null;
}

export const PLANS: Plan[] = [
  {
    key: "creator_pro",
    name: "Creator Pro",
    description: "One simple plan. Cancel anytime.",
    features: [
      "Your unique kloot.io link",
      "7 customizable themes",
      "Daily updating analytics & insights",
    ],
    pricingINR: {
      monthly: {
        id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_CREATOR_PRO_MONTHLY ?? "",
        price: 59,
        effectiveMonthlyPrice: 59,
        billingLabel: "Billed monthly",
        maxBillingCycles: 240,
      },
      yearly: {
        id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_CREATOR_PRO_YEARLY ?? "",
        price: 599,
        effectiveMonthlyPrice: 50,
        billingLabel: "Billed annually at ₹599",
        originalMonthlyPrice: 59,
        discountPct: 15,
        savingsNote: "You save ₹109 a year",
        maxBillingCycles: 20,
      },
    },
    pricingUSD: {
      monthly: {
        id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_CREATOR_PRO_MONTHLY_USD ?? "",
        price: 5.99,
        effectiveMonthlyPrice: 5.99,
        billingLabel: "Billed monthly",
        maxBillingCycles: 240,
      },
      yearly: {
        id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_CREATOR_PRO_YEARLY_USD ?? "",
        price: 59.99,
        effectiveMonthlyPrice: 5,
        billingLabel: "Billed annually at $59.99",
        originalMonthlyPrice: 5.99,
        discountPct: 16,
        savingsNote: "You save $11.89 a year",
        maxBillingCycles: 20,
      },
    },
  },
];

