import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { generateInvoiceForCharge } from "@/services/billing.service";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

type RzpInvoices = { fetch: (id: string) => Promise<Record<string, unknown>> };

// ── Date range helpers ────────────────────────────────────────────────────────

type RangeLabel = "yesterday" | "this_week" | "last_week" | "this_month" | "last_month";

function resolveRange(label: RangeLabel): { from: number; to: number } {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  switch (label) {
    case "yesterday": {
      const d = startOfDay(now);
      d.setDate(d.getDate() - 1);
      return { from: d.getTime() / 1000, to: (d.getTime() / 1000) + 86399 };
    }
    case "this_week": {
      const d = startOfDay(now);
      d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
      return { from: d.getTime() / 1000, to: now.getTime() / 1000 };
    }
    case "last_week": {
      const monday = startOfDay(now);
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) - 7);
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);
      return { from: monday.getTime() / 1000, to: (sunday.getTime() / 1000) + 86399 };
    }
    case "this_month": {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: d.getTime() / 1000, to: now.getTime() / 1000 };
    }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0); // last day of prev month
      return { from: start.getTime() / 1000, to: (end.getTime() / 1000) + 86399 };
    }
  }
}

// ── Fetch all Razorpay payments in a time window (handles pagination) ─────────

async function fetchAllPaymentsInRange(from: number, to: number): Promise<Record<string, unknown>[]> {
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

// ── Core: process a single payment ID ────────────────────────────────────────

async function processPayment(
  paymentId: string,
  payment: Record<string, unknown> | null,
  results: { generated: number; skipped: number; errors: string[] }
) {
  if (!payment) {
    try {
      payment = await razorpay.payments.fetch(paymentId) as unknown as Record<string, unknown>;
    } catch (err: unknown) {
      results.errors.push(`${paymentId}: failed to fetch from Razorpay — ${err instanceof Error ? err.message : String(err)}`);
      return;
    }
  }

  if (payment.status !== "captured") { results.skipped++; return; }

  // Resolve subscription ID — may be direct or via Razorpay invoice
  let razorpaySubscriptionId = payment.subscription_id as string | undefined;
  if (!razorpaySubscriptionId) {
    const invoiceId = payment.invoice_id as string | undefined;
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

  if (!razorpaySubscriptionId) {
    results.skipped++;
    return;
  }

  let razorSub: Record<string, unknown> | null;
  try {
    razorSub = await razorpay.subscriptions.fetch(razorpaySubscriptionId) as unknown as Record<string, unknown>;
  } catch {
    razorSub = null;
  }

  try {
    const status = await generateInvoiceForCharge(
      razorpaySubscriptionId,
      { id: paymentId, amount: payment.amount as number },
      razorSub as { current_start?: number; current_end?: number } | null,
      {
        userId: (razorSub?.notes as Record<string, string> | undefined)?.user_id,
        planId: razorSub?.plan_id as string | undefined,
      }
    );
    if (status === "generated") results.generated++; else results.skipped++;
  } catch (err: unknown) {
    results.errors.push(`${paymentId}: ${err instanceof Error ? err.message : "unknown error"}`);
    console.error("[Backfill] Failed to generate invoice for payment", paymentId, err);
  }
}

// ── Route ─────────────────────────────────────────────────────────────────────

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { payment_ids, range, from, to } = body ?? {};

  const results = { generated: 0, skipped: 0, errors: [] as string[] };

  if (Array.isArray(payment_ids) && payment_ids.length > 0) {
    // Mode 1: explicit payment IDs
    for (const id of payment_ids) {
      await processPayment(id, null, results);
    }
  } else if (range || (from && to)) {
    // Mode 2: date range
    let fromTs: number, toTs: number;

    if (range) {
      const VALID: RangeLabel[] = ["yesterday", "this_week", "last_week", "this_month", "last_month"];
      if (!VALID.includes(range)) {
        return NextResponse.json({ error: `range must be one of: ${VALID.join(", ")}` }, { status: 400 });
      }
      ({ from: fromTs, to: toTs } = resolveRange(range as RangeLabel));
    } else {
      fromTs = new Date(from).getTime() / 1000;
      toTs = new Date(to).getTime() / 1000;
      if (isNaN(fromTs) || isNaN(toTs)) {
        return NextResponse.json({ error: "Invalid from/to dates" }, { status: 400 });
      }
    }

    let payments: Record<string, unknown>[];
    try {
      payments = await fetchAllPaymentsInRange(fromTs, toTs);
    } catch (err: unknown) {
      return NextResponse.json({ error: `Failed to fetch payments from Razorpay: ${err instanceof Error ? err.message : String(err)}` }, { status: 502 });
    }

    for (const payment of payments) {
      await processPayment(payment.id as string, payment, results);
    }
  } else {
    return NextResponse.json(
      { error: "Provide payment_ids, a range (yesterday/this_week/last_week/this_month/last_month), or from+to dates" },
      { status: 400 }
    );
  }

  return NextResponse.json(results);
}
