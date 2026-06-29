import { getNextSequenceNumber } from "@/db/billing_sequence.db";
import { createInvoice, getInvoiceByPaymentId } from "@/db/invoice.db";
import { getBillingProfile } from "@/db/billing_profile.db";
import { getUserById } from "@/db/user.db";
import { getSubscriptionByRazorpayId } from "@/db/subscription.db";
import { getPricingByPlanId } from "@/lib/plans";

const GST_RATE = 18;
const SAC_CODE = "998315";
const PREFIX = process.env.INVOICE_PREFIX ?? "KLT";

// Indian GST state codes — first 2 digits of GSTIN (source: CBIC / gst.gov.in)
const STATE_CODE_MAP: Record<string, string> = {
  "01": "Jammu and Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  // 25 — Daman and Diu (discontinued 2020, merged into 26)
  "26": "Dadra and Nagar Haveli and Daman and Diu",
  "27": "Maharashtra",
  // 28 — Not Assigned
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman and Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "38": "Ladakh",
  "97": "Other Territory",
  "99": "Centre Jurisdiction",
};

export function getStateFromCode(code: string): string {
  return STATE_CODE_MAP[code] ?? "Unknown";
}

export function getFinancialYear(): string {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();
  const fyStart = month >= 4 ? year : year - 1;
  const fyEnd = fyStart + 1;
  return `${String(fyStart).slice(2)}-${String(fyEnd).slice(2)}`; // "24-25"
}

export function formatInvoiceNumber(prefix: string, fy: string, seq: number): string {
  return `${prefix}/${fy}/${String(seq).padStart(6, "0")}`;
}

function getSupplierDetails() {
  return {
    supplier_name: process.env.SUPPLIER_NAME ?? "",
    supplier_gstin: process.env.SUPPLIER_GSTIN ?? "",
    supplier_address_line1: process.env.SUPPLIER_ADDRESS_LINE1 ?? "",
    supplier_address_line2: process.env.SUPPLIER_ADDRESS_LINE2,
    supplier_city: process.env.SUPPLIER_CITY ?? "",
    supplier_state: process.env.SUPPLIER_STATE ?? "",
    supplier_pincode: process.env.SUPPLIER_PINCODE ?? "",
    supplier_state_code: process.env.SUPPLIER_STATE_CODE ?? "",
  };
}

export async function generateInvoice({
  userId,
  razorpayPaymentId,
  razorpaySubscriptionId,
  planId,
  totalAmountPaise,
  subscriptionPeriodStart,
  subscriptionPeriodEnd,
}: {
  userId: string;
  razorpayPaymentId: string;
  razorpaySubscriptionId: string;
  planId: string;
  totalAmountPaise: number;
  subscriptionPeriodStart?: Date;
  subscriptionPeriodEnd?: Date;
}) {
  const [user, billingProfile] = await Promise.all([
    getUserById(userId),
    getBillingProfile(userId),
  ]);

  if (!user) throw new Error(`User not found: ${userId}`);

  const planData = getPricingByPlanId(planId);
  const planName = planData ? `${planData.plan.name} (${planData.billing})` : planId;
  const serviceDescription = `Kloot – ${planName} Subscription`;

  // Tax calculation
  const supplierStateCode = process.env.SUPPLIER_STATE_CODE ?? "";
  const customerStateCode = billingProfile?.state_code ?? "";
  const isIntraState = customerStateCode !== "" && customerStateCode === supplierStateCode;

  // Work backwards from total (which includes GST) to get taxable amount
  // total = taxable * (1 + GST_RATE/100)
  const taxableAmountPaise = Math.round(totalAmountPaise / (1 + GST_RATE / 100));
  const taxAmountPaise = totalAmountPaise - taxableAmountPaise;

  const taxFields = isIntraState
    ? {
        tax_type: "cgst_sgst" as const,
        cgst_rate: GST_RATE / 2,
        cgst_amount: Math.round(taxAmountPaise / 2),
        sgst_rate: GST_RATE / 2,
        sgst_amount: Math.round(taxAmountPaise / 2),
      }
    : {
        tax_type: "igst" as const,
        igst_rate: GST_RATE,
        igst_amount: taxAmountPaise,
      };

  // Place of supply
  const customerStateCode2 = billingProfile?.state_code ?? supplierStateCode;
  const placeOfSupply = getStateFromCode(customerStateCode2);

  // Invoice number
  const fy = getFinancialYear();
  const seq = await getNextSequenceNumber(PREFIX, fy);
  const invoiceNumber = formatInvoiceNumber(PREFIX, fy, seq);

  return createInvoice({
    invoice_number: invoiceNumber,
    prefix: PREFIX,
    financial_year: fy,
    sequence_number: seq,
    invoice_date: new Date(),

    ...getSupplierDetails(),

    user_id: user._id,
    customer_name: billingProfile?.name ?? user.name,
    customer_email: user.email,
    customer_phone: billingProfile
      ? `${billingProfile.phone_country_code}${billingProfile.phone}`
      : (user.phone ?? ""),
    customer_gstin: billingProfile?.gstin,
    customer_company_name: billingProfile?.company_name,
    customer_address_line1: billingProfile?.address_line1,
    customer_address_line2: billingProfile?.address_line2,
    customer_city: billingProfile?.city,
    customer_state: billingProfile?.state,
    customer_pincode: billingProfile?.pincode,
    customer_state_code: billingProfile?.state_code,

    place_of_supply: placeOfSupply,
    reverse_charge: false,

    razorpay_payment_id: razorpayPaymentId,
    razorpay_subscription_id: razorpaySubscriptionId,

    plan_id: planId,
    plan_name: planName,
    service_description: serviceDescription,
    sac_code: SAC_CODE,
    subscription_period_start: subscriptionPeriodStart,
    subscription_period_end: subscriptionPeriodEnd,

    taxable_amount: taxableAmountPaise,
    ...taxFields,
    total_amount: totalAmountPaise,
    currency: "INR",

    status: "paid",
  } as any);
}

export async function generateInvoiceForCharge(
  razorpaySubscriptionId: string,
  paymentEntity: { id: string; amount: number },
  subscriptionEntity: { current_start?: number; current_end?: number } | null,
  fallback?: { userId?: string; planId?: string }
): Promise<"generated" | "skipped"> {
  const paymentId = paymentEntity.id;

  const existing = await getInvoiceByPaymentId(paymentId);
  if (existing) {
    console.info("[Invoice] Already exists for payment", paymentId);
    return "skipped";
  }

  const localSub = await getSubscriptionByRazorpayId(razorpaySubscriptionId);
  const userId = localSub?.user_id?.toString() ?? fallback?.userId;
  const planId = localSub?.plan_id ?? fallback?.planId;

  if (!userId) {
    throw new Error(`Could not determine user_id for subscription ${razorpaySubscriptionId}`);
  }
  if (!planId) {
    throw new Error(`Could not determine plan_id for subscription ${razorpaySubscriptionId}`);
  }

  console.info("[Invoice] Generating for payment", paymentId, "subscription", razorpaySubscriptionId, "plan", planId);

  await generateInvoice({
    userId,
    razorpayPaymentId: paymentId,
    razorpaySubscriptionId,
    planId,
    totalAmountPaise: paymentEntity.amount,
    subscriptionPeriodStart: subscriptionEntity?.current_start
      ? new Date(subscriptionEntity.current_start * 1000)
      : undefined,
    subscriptionPeriodEnd: subscriptionEntity?.current_end
      ? new Date(subscriptionEntity.current_end * 1000)
      : undefined,
  });

  return "generated";
}
