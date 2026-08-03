import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { connectDB } from "@/db";
import DailyMetric from "@/db/models/daily_metric";

const EMPTY_SUBS = { activeINR: 0, activeUSD: 0, newINR: 0, newUSD: 0, cancelledINR: 0, cancelledUSD: 0 };

function dateKey(d: Date) {
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}

function monthKey(d: Date) {
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const { searchParams } = new URL(req.url);
  const granularity = searchParams.get("granularity") === "monthly" ? "monthly" : "daily";

  if (granularity === "monthly") {
    const months = Math.min(24, Math.max(3, parseInt(searchParams.get("months") ?? "12")));

    const since = new Date();
    since.setUTCMonth(since.getUTCMonth() - months);
    since.setUTCDate(1);
    since.setUTCHours(0, 0, 0, 0);

    const rows = await DailyMetric.aggregate([
      { $match: { type: "subscriptions", date: { $gte: since } } },
      { $sort: { date: 1 } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          activeINR: { $last: "$subscriptions.activeINR" },
          activeUSD: { $last: "$subscriptions.activeUSD" },
          newINR:       { $sum: "$subscriptions.newINR" },
          newUSD:       { $sum: "$subscriptions.newUSD" },
          cancelledINR: { $sum: "$subscriptions.cancelledINR" },
          cancelledUSD: { $sum: "$subscriptions.cancelledUSD" },
        },
      },
      { $addFields: { date: { $dateFromParts: { year: "$_id.year", month: "$_id.month", day: 1 } } } },
      { $sort: { date: 1 } },
      {
        $project: {
          _id: 0,
          date: 1,
          subscriptions: {
            activeINR: "$activeINR", activeUSD: "$activeUSD",
            newINR: "$newINR", newUSD: "$newUSD",
            cancelledINR: "$cancelledINR", cancelledUSD: "$cancelledUSD",
          },
        },
      },
    ]);

    const rowMap = new Map(
      rows.map((r: { date: Date; subscriptions: typeof EMPTY_SUBS }) => [monthKey(new Date(r.date)), r.subscriptions])
    );

    // Generate complete month range
    const allMonths: Date[] = [];
    const cursor = new Date(since);
    const now = new Date();
    while (
      cursor.getUTCFullYear() < now.getUTCFullYear() ||
      (cursor.getUTCFullYear() === now.getUTCFullYear() && cursor.getUTCMonth() <= now.getUTCMonth())
    ) {
      allMonths.push(new Date(cursor));
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }

    const data = allMonths.map((date) => ({
      date,
      subscriptions: rowMap.get(monthKey(date)) ?? EMPTY_SUBS,
    }));

    return NextResponse.json({ granularity: "monthly", data });
  }

  // daily (default)
  const days = Math.min(365, Math.max(7, parseInt(searchParams.get("days") ?? "30")));

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  since.setUTCHours(0, 0, 0, 0);

  const rows = await DailyMetric.find(
    { type: "subscriptions", date: { $gte: since } },
    { date: 1, subscriptions: 1 }
  ).sort({ date: 1 }).lean();

  const rowMap = new Map(
    rows.map((r) => [dateKey(new Date(r.date as Date)), r.subscriptions])
  );

  // Cap at the last date we actually have data for (avoids a trailing zero for today)
  const lastRow = rows.at(-1);
  const end = lastRow ? new Date(lastRow.date as Date) : since;
  end.setUTCHours(0, 0, 0, 0);

  // Generate complete date range
  const allDates: Date[] = [];
  const cursor = new Date(since);
  while (cursor <= end) {
    allDates.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const data = allDates.map((date) => ({
    date,
    subscriptions: rowMap.get(dateKey(date)) ?? EMPTY_SUBS,
  }));

  return NextResponse.json({ granularity: "daily", data });
}
