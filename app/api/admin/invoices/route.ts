import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { connectDB } from "@/db";
import Invoice from "@/db/models/invoice";
import User from "@/db/models/user";

const SORT_MAP: Record<string, string> = {
  invoiceDate: "invoice_date",
  totalAmount: "total_amount",
};

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page    = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit   = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") ?? "25")));
  const search  = searchParams.get("search")?.trim() ?? "";
  const prefix  = searchParams.get("prefix") ?? "";
  const planId  = searchParams.get("planId") ?? "";
  const from    = searchParams.get("from") ?? "";
  const to      = searchParams.get("to") ?? "";
  const sort    = searchParams.get("sort") ?? "invoiceDate";
  const sortDir = searchParams.get("sortDir") === "asc" ? 1 : -1;
  const sortField = SORT_MAP[sort] ?? "invoice_date";

  await connectDB();

  const query: Record<string, unknown> = {};

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    query.$or = [
      { invoice_number: regex },
      { customer_name: regex },
      { customer_email: regex },
    ];
  }

  if (prefix) query.prefix = prefix;
  if (planId) query.plan_id = planId;

  if (from || to) {
    const dateFilter: Record<string, Date> = {};
    if (from) {
      const d = new Date(from);
      if (!isNaN(d.getTime())) dateFilter.$gte = d;
    }
    if (to) {
      const d = new Date(to);
      d.setHours(23, 59, 59, 999);
      if (!isNaN(d.getTime())) dateFilter.$lte = d;
    }
    if (Object.keys(dateFilter).length) query.invoice_date = dateFilter;
  }

  const [total, invoices, totalsAgg] = await Promise.all([
    Invoice.countDocuments(query),
    Invoice.find(query)
      .sort({ [sortField]: sortDir })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Invoice.aggregate([
      { $match: query },
      { $group: { _id: "$currency", total: { $sum: "$total_amount" } } },
    ]),
  ]);

  const pageUserIds = [
    ...new Set(invoices.map((i) => i.user_id?.toString()).filter(Boolean)),
  ];
  const users = pageUserIds.length
    ? await User.find({ _id: { $in: pageUserIds } }).select("name email username").lean()
    : [];
  const userMap = new Map(users.map((u) => [(u._id as any).toString(), u]));

  const inrTotal = totalsAgg.find((r: any) => r._id === "INR" || r._id == null)?.total ?? 0;
  const usdTotal = totalsAgg.find((r: any) => r._id === "USD")?.total ?? 0;

  const data = invoices.map((inv) => {
    const user = userMap.get(inv.user_id?.toString()) ?? null;
    return {
      id: (inv._id as any).toString(),
      invoiceNumber: inv.invoice_number,
      financialYear: inv.financial_year,
      invoiceDate: inv.invoice_date,
      customerName: inv.customer_name,
      customerEmail: inv.customer_email,
      planId: inv.plan_id,
      planName: inv.plan_name,
      periodStart: inv.subscription_period_start ?? null,
      periodEnd: inv.subscription_period_end ?? null,
      totalAmount: inv.total_amount,
      currency: inv.currency ?? "INR",
      prefix: inv.prefix,
      status: inv.status,
      pdfUrl: inv.pdf_url ?? null,
      razorpaySubscriptionId: inv.razorpay_subscription_id,
      user: user
        ? {
            id: (user._id as any).toString(),
            name: user.name,
            email: user.email,
            username: user.username,
          }
        : null,
    };
  });

  return NextResponse.json({
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    totals: { inrTotal, usdTotal },
  });
}
