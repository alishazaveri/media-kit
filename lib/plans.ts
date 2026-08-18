export type BillingFrequency = "monthly" | "yearly";
export type Currency = "INR" | "USD";

export type BillingOption = {
  id: string;                                    // internal: "creator_pro_monthly_inr"
  frequency: BillingFrequency;
  amount: number;                                // total billing amount in display units (e.g. 599, 59.99)
  effectiveMonthlyAmount: number;                // per-month display (e.g. 50, 5.00)
  billingLabel: string;
  originalMonthlyAmount?: number;
  discountPct?: number;
  savingsNote?: string;
  maxBillingCycles?: number;
  paymentGateways: string[];
  razorpayDetails?: { planId: string };
  stripeDetails?: { priceId: string };
};

export type LocalizedPlan = {
  id: string;                                    // internal: "creator_pro"
  name: string;
  description: string;
  features: string[];
  currency: Currency;
  billingOptions: BillingOption[];
  isFree?: boolean;
};

export type PlanLookupResult = {
  plan: LocalizedPlan;
  billingOption: BillingOption;
  currency: Currency;
};

const CREATOR_PRO_FEATURES = [
  "Everything in free",
  "7 customizable themes + dark mode",
  "Work with me button",
];

const FREE_PLAN: LocalizedPlan = {
  id: "free",
  name: "Free",
  description: "Get started at no cost.",
  features: [
    "Your unique kloot.io link",
    "1 theme (Default)",
    "Daily updating analytics & insights",
  ],
  currency: "INR",
  billingOptions: [],
  isFree: true,
};

const COUNTRY_PLANS: Record<string, LocalizedPlan[]> = {
  IN: [
    FREE_PLAN,
    {
      id: "creator_pro",
      name: "Creator Pro",
      description: "One simple plan. Cancel anytime.",
      features: CREATOR_PRO_FEATURES,
      currency: "INR",
      billingOptions: [
        {
          id: "creator_pro_monthly_inr",
          frequency: "monthly",
          amount: 59,
          effectiveMonthlyAmount: 59,
          billingLabel: "Billed monthly",
          maxBillingCycles: 240,
          paymentGateways: ["razorpay"],
          razorpayDetails: { planId: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_CREATOR_PRO_MONTHLY ?? "" },
        },
        {
          id: "creator_pro_yearly_inr",
          frequency: "yearly",
          amount: 599,
          effectiveMonthlyAmount: 50,
          billingLabel: "Billed annually at ₹599",
          originalMonthlyAmount: 59,
          discountPct: 15,
          savingsNote: "You save ₹109 a year",
          maxBillingCycles: 20,
          paymentGateways: ["razorpay"],
          razorpayDetails: { planId: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_CREATOR_PRO_YEARLY ?? "" },
        },
      ],
    },
  ],
  US: [
    { ...FREE_PLAN, currency: "USD" },
    {
      id: "creator_pro",
      name: "Creator Pro",
      description: "One simple plan. Cancel anytime.",
      features: CREATOR_PRO_FEATURES,
      currency: "USD",
      billingOptions: [
        {
          id: "creator_pro_monthly_usd",
          frequency: "monthly",
          amount: 5.99,
          effectiveMonthlyAmount: 5.99,
          billingLabel: "Billed monthly",
          maxBillingCycles: 240,
          paymentGateways: ["razorpay"],
          razorpayDetails: { planId: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_CREATOR_PRO_MONTHLY_USD ?? "" },
        },
        {
          id: "creator_pro_yearly_usd",
          frequency: "yearly",
          amount: 59.99,
          effectiveMonthlyAmount: 5,
          billingLabel: "Billed annually at $59.99",
          originalMonthlyAmount: 5.99,
          discountPct: 16,
          savingsNote: "You save $11.89 a year",
          maxBillingCycles: 20,
          paymentGateways: ["razorpay"],
          razorpayDetails: { planId: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_CREATOR_PRO_YEARLY_USD ?? "" },
        },
      ],
    },
  ],
};

export function getPlans(country = "US"): LocalizedPlan[] {
  return COUNTRY_PLANS[country] ?? COUNTRY_PLANS["US"];
}

function getGatewayPlanId(opt: BillingOption, gateway: string): string | undefined {
  if (gateway === "razorpay") return opt.razorpayDetails?.planId;
  if (gateway === "stripe") return opt.stripeDetails?.priceId;
  return undefined;
}

export function findPlanByGatewayPlanId(gateway: string, gatewayPlanId: string): PlanLookupResult | null {
  if (!gatewayPlanId) return null;
  for (const plans of Object.values(COUNTRY_PLANS)) {
    for (const plan of plans) {
      for (const billingOption of plan.billingOptions) {
        if (getGatewayPlanId(billingOption, gateway) === gatewayPlanId) {
          return { plan, billingOption, currency: plan.currency };
        }
      }
    }
  }
  return null;
}

export function findPlanByBillingId(billingId: string): PlanLookupResult | null {
  for (const plans of Object.values(COUNTRY_PLANS)) {
    for (const plan of plans) {
      for (const billingOption of plan.billingOptions) {
        if (billingOption.id === billingId) {
          return { plan, billingOption, currency: plan.currency };
        }
      }
    }
  }
  return null;
}

export function getAllBillingOptions(): { plan: LocalizedPlan; billingOption: BillingOption }[] {
  const result: { plan: LocalizedPlan; billingOption: BillingOption }[] = [];
  for (const plans of Object.values(COUNTRY_PLANS)) {
    for (const plan of plans) {
      for (const billingOption of plan.billingOptions) {
        result.push({ plan, billingOption });
      }
    }
  }
  return result;
}
