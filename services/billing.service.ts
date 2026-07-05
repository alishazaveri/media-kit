import Razorpay from "razorpay";
import { getNextSequenceNumber } from "@/db/billing_sequence.db";
import { createInvoice, getInvoiceByPaymentId, updateInvoicePdfUrl } from "@/db/invoice.db";
import { getBillingProfile } from "@/db/billing_profile.db";
import { getUserById } from "@/db/user.db";
import { getSubscriptionByRazorpayId } from "@/db/subscription.db";
import { getPricingByPlanId } from "@/lib/plans";
import { generateAndUploadInvoicePdf } from "@/services/pdf.service";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

type RzpInvoices = { fetch: (id: string) => Promise<Record<string, unknown>> };

export type BackfillResults = { generated: number; skipped: number; errors: string[] };

export async function fetchAllPaymentsInRange(from: number, to: number): Promise<Record<string, unknown>[]> {
  const PAGE = 100;
  const all: Record<string, unknown>[] = [];
  let skip = 0;

  while (true) {
    const res = await (razorpay.payments as unknown as {
      all: (opts: Record<string, unknown>) => Promise<{ items: Record<string, unknown>[] }>;
    }).all({ from: Math.floor(from), to: Math.floor(to), count: PAGE, skip });

    const items = res?.items ?? [];
    all.push(...items);
    if (items.length < PAGE) break;
    skip += PAGE;
  }

  return all;
}

export async function processPayment(
  paymentId: string,
  paymentEntity: Record<string, unknown> | null,
  results: BackfillResults
) {
  if (!paymentEntity) {
    try {
      paymentEntity = await razorpay.payments.fetch(paymentId) as unknown as Record<string, unknown>;
    } catch (err: unknown) {
      results.errors.push(`${paymentId}: failed to fetch from Razorpay — ${err instanceof Error ? err.message : String(err)}`);
      return;
    }
  }

  if (paymentEntity.status !== "captured") { results.skipped++; return; }

  let razorpaySubscriptionId = paymentEntity.subscription_id as string | undefined;
  if (!razorpaySubscriptionId) {
    const invoiceId = paymentEntity.invoice_id as string | undefined;
    if (invoiceId?.startsWith("inv_")) {
      try {
        const rzpInvoice = await (razorpay as unknown as { invoices: RzpInvoices }).invoices.fetch(invoiceId);
        razorpaySubscriptionId = rzpInvoice.subscription_id as string | undefined;
      } catch (err: unknown) {
        results.errors.push(`${paymentId}: failed to fetch Razorpay invoice ${invoiceId} — ${err instanceof Error ? err.message : String(err)}`);
        return;
      }
    }
  }

  if (!razorpaySubscriptionId) { results.skipped++; return; }

  let subscriptionEntity: Record<string, unknown> | null;
  try {
    subscriptionEntity = await razorpay.subscriptions.fetch(razorpaySubscriptionId) as unknown as Record<string, unknown>;
  } catch {
    subscriptionEntity = null;
  }

  try {
    const status = await generateInvoiceForCharge(
      razorpaySubscriptionId,
      { id: paymentId, amount: paymentEntity.amount as number },
      subscriptionEntity as { current_start?: number; current_end?: number } | null,
      {
        userId: (subscriptionEntity?.notes as Record<string, string> | undefined)?.user_id,
        planId: subscriptionEntity?.plan_id as string | undefined,
      }
    );
    if (status === "generated") results.generated++; else results.skipped++;
  } catch (err: unknown) {
    results.errors.push(`${paymentId}: ${err instanceof Error ? err.message : "unknown error"}`);
    console.error("[Backfill] Failed to generate invoice for payment", paymentId, err);
  }
}

const GST_RATE = 18;
const SAC_CODE = "9983";
const PREFIX = process.env.INVOICE_PREFIX ?? "KLT";

import { getStateFromCode, getStateCodeFromName } from "@/lib/gst-states";
export { getStateFromCode, getStateCodeFromName };

export function getFinancialYear(): string {
  const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const month = nowIST.getMonth() + 1; // 1-12 in IST
  const year = nowIST.getFullYear();   // calendar year in IST
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

  const invoice = await createInvoice({
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
  } as Parameters<typeof createInvoice>[0]);

  // Generate PDF and upload — failure is non-fatal, invoice is already created
  generateAndUploadInvoicePdf(invoice)
    .then((pdfUrl) => updateInvoicePdfUrl(invoice._id.toString(), pdfUrl))
    .catch((err) => console.error("[Invoice] PDF generation failed for", invoice.invoice_number, err));

  return invoice;
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
