import { NextRequest, NextResponse } from "next/server";
import { fetchAllPaymentsInRange, processPayment, BackfillResults } from "@/services/billing.service";

// ── Date range helpers ────────────────────────────────────────────────────────

type RangeLabel = "today" | "yesterday" | "this_week" | "last_week" | "this_month" | "last_month";

function resolveRange(label: RangeLabel): { from: number; to: number } {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const now = new Date();
  // Express current time as IST calendar values
  const nowIST = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const nowTs = Math.floor(now.getTime() / 1000);

  // Returns UTC Unix timestamp for midnight IST of the given IST-calendar date
  const midnightIST = (d: Date): number =>
    (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - IST_OFFSET_MS) / 1000;

  switch (label) {
    case "today":
      return { from: midnightIST(nowIST), to: nowTs };

    case "yesterday": {
      const yesterday = new Date(nowIST);
      yesterday.setDate(yesterday.getDate() - 1);
      return { from: midnightIST(yesterday), to: midnightIST(nowIST) - 1 };
    }

    case "this_week": {
      const monday = new Date(nowIST);
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
      return { from: midnightIST(monday), to: nowTs };
    }

    case "last_week": {
      const monday = new Date(nowIST);
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) - 7);
      const nextMonday = new Date(monday);
      nextMonday.setDate(nextMonday.getDate() + 7);
      return { from: midnightIST(monday), to: midnightIST(nextMonday) - 1 };
    }

    case "this_month": {
      const firstDay = new Date(nowIST.getFullYear(), nowIST.getMonth(), 1);
      return { from: midnightIST(firstDay), to: nowTs };
    }

    case "last_month": {
      const firstDayLastMonth = new Date(nowIST.getFullYear(), nowIST.getMonth() - 1, 1);
      const firstDayThisMonth = new Date(nowIST.getFullYear(), nowIST.getMonth(), 1);
      return { from: midnightIST(firstDayLastMonth), to: midnightIST(firstDayThisMonth) - 1 };
    }
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

  const results: BackfillResults = { generated: 0, skipped: 0, errors: [] };

  if (Array.isArray(payment_ids) && payment_ids.length > 0) {
    // Mode 1: explicit payment IDs
    for (const id of payment_ids) {
      await processPayment(id, null, results);
    }
  } else if (range || (from && to)) {
    // Mode 2: date range
    let fromTs: number, toTs: number;

    if (range) {
      const VALID: RangeLabel[] = ["today", "yesterday", "this_week", "last_week", "this_month", "last_month"];
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

    for (const paymentEntity of payments) {
      await processPayment(paymentEntity.id as string, paymentEntity, results);
    }
  } else {
    return NextResponse.json(
      { error: "Provide payment_ids, a range (yesterday/this_week/last_week/this_month/last_month), or from+to dates" },
      { status: 400 }
    );
  }

  return NextResponse.json(results);
}
