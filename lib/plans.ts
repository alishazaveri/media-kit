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

export type Plan = {
  key: string;
  name: string;
  description: string;
  features: string[];
  pricing: Record<BillingFrequency, PricingVariant>;
};

export const PLANS: Plan[] = [
  {
    key: "early_bird",
    name: "Early Bird",
    description: "One simple plan. Cancel anytime.",
    features: [
      "Your unique kloot.io link",
      "7 customizable themes",
      "Weekly updating analytics & insights",
    ],
    pricing: {
      monthly: {
        id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_EARLY_BIRD_MONTHLY ?? "",
        price: 49,
        effectiveMonthlyPrice: 49,
        billingLabel: "Billed monthly",
        maxBillingCycles: 240,
      },
      yearly: {
        id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_EARLY_BIRD_YEARLY ?? "",
        price: 499,
        effectiveMonthlyPrice: 42,
        billingLabel: "Billed annually at ₹499",
        originalMonthlyPrice: 49,
        discountPct: 15,
        savingsNote: "You save ₹89 a year",
        maxBillingCycles: 20,
      },
    },
  },
];

