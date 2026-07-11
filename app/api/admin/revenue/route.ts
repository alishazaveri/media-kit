import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { connectDB } from "@/db";
import Invoice from "@/db/models/invoice";
import { PLANS } from "@/lib/plans";

function fyStart(now: Date): Date {
  const m = now.getMonth() + 1;
  const y = now.getFullYear();
  return new Date(m >= 4 ? y : y - 1, 3, 1);
}

function quarterStart(now: Date): Date {
  const m = now.getMonth() + 1;
  const y = now.getFullYear();
  if (m >= 4 && m <= 6)  return new Date(y, 3, 1);
  if (m >= 7 && m <= 9)  return new Date(y, 6, 1);
  if (m >= 10 && m <= 12) return new Date(y, 9, 1);
  return new Date(y, 0, 1); // Jan–Mar = Q4
}

function weekStart(now: Date): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d;
}

type PeriodResult = { revenue: number; count: number };

function aggregate(
  invs: { plan_id: string; total_amount: number; created_at: Date }[],
  from: Date,
): { all: PeriodResult; byPlan: Record<string, PeriodResult> } {
  const filtered = invs.filter((inv) => new Date(inv.created_at) >= from);
  const all: PeriodResult = { revenue: 0, count: 0 };
  const byPlan: Record<string, PeriodResult> = {};
  for (const inv of filtered) {
    all.revenue += inv.total_amount;
    all.count += 1;
    if (!byPlan[inv.plan_id]) byPlan[inv.plan_id] = { revenue: 0, count: 0 };
    byPlan[inv.plan_id].revenue += inv.total_amount;
    byPlan[inv.plan_id].count += 1;
  }
  return { all, byPlan };
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const now = new Date();
  const fy = fyStart(now);

  const rawInvoices = await Invoice.find({ status: "paid", created_at: { $gte: fy } })
    .select("plan_id total_amount created_at")
    .lean();

  const invoices = rawInvoices.map((inv) => ({
    plan_id: inv.plan_id,
    total_amount: inv.total_amount,
    created_at: inv.created_at,
  }));

  // Period stats
  const stats = {
    week:    aggregate(invoices, weekStart(now)),
    month:   aggregate(invoices, new Date(now.getFullYear(), now.getMonth(), 1)),
    quarter: aggregate(invoices, quarterStart(now)),
    fy:      aggregate(invoices, fy),
  };

  // Monthly breakdown from FY start to now
  const monthly: Array<{
    month: number; year: number; label: string;
    all: PeriodResult; byPlan: Record<string, PeriodResult>;
  }> = [];
  let cursor = new Date(fy);
  while (cursor <= now) {
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const end   = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    const slice = invoices.filter((inv) => {
      const d = new Date(inv.created_at);
      return d >= start && d < end;
    });
    const { all, byPlan } = aggregate(slice, start);
    monthly.push({
      month: cursor.getMonth() + 1,
      year: cursor.getFullYear(),
      label: cursor.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      all,
      byPlan,
    });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  // Plans from lib/plans (NEXT_PUBLIC ids may be empty in prod SSR — still useful for labels)
  const plans = PLANS.flatMap((p) =>
    (Object.entries(p.pricing) as [string, { id: string }][]).map(([billing, pricing]) => ({
      id: pricing.id,
      name: `${p.name} · ${billing.charAt(0).toUpperCase() + billing.slice(1)}`,
    })),
  ).filter((p) => p.id);

  return NextResponse.json({ data: { plans, stats, monthly } });
}
