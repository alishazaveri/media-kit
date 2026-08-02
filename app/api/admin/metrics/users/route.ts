import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { connectDB } from "@/db";
import User from "@/db/models/user";

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

    const [baseline, grouped] = await Promise.all([
      User.countDocuments({ created_at: { $lt: since } }),
      User.aggregate([
        { $match: { created_at: { $gte: since } } },
        { $group: { _id: { year: { $year: "$created_at" }, month: { $month: "$created_at" } }, new: { $sum: 1 } } },
        { $addFields: { date: { $dateFromParts: { year: "$_id.year", month: "$_id.month", day: 1 } } } },
        { $sort: { date: 1 } },
        { $project: { _id: 0, date: 1, new: 1 } },
      ]),
    ]);

    const groupedMap = new Map<string, number>(
      grouped.map((r: { date: Date; new: number }) => [monthKey(new Date(r.date)), r.new])
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

    let running = baseline;
    const data = allMonths.map((date) => {
      const newCount = groupedMap.get(monthKey(date)) ?? 0;
      running += newCount;
      return { date, total: running, new: newCount };
    });

    return NextResponse.json({ granularity: "monthly", data });
  }

  // daily (default)
  const days = Math.min(365, Math.max(7, parseInt(searchParams.get("days") ?? "30")));

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  since.setUTCHours(0, 0, 0, 0);

  const [baseline, grouped] = await Promise.all([
    User.countDocuments({ created_at: { $lt: since } }),
    User.aggregate([
      { $match: { created_at: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: "$created_at" }, month: { $month: "$created_at" }, day: { $dayOfMonth: "$created_at" } },
          new: { $sum: 1 },
        },
      },
      { $addFields: { date: { $dateFromParts: { year: "$_id.year", month: "$_id.month", day: "$_id.day" } } } },
      { $sort: { date: 1 } },
      { $project: { _id: 0, date: 1, new: 1 } },
    ]),
  ]);

  const groupedMap = new Map<string, number>(
    grouped.map((r: { date: Date; new: number }) => [dateKey(new Date(r.date)), r.new])
  );

  // Generate complete date range
  const allDates: Date[] = [];
  const cursor = new Date(since);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  while (cursor <= today) {
    allDates.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  let running = baseline;
  const data = allDates.map((date) => {
    const newCount = groupedMap.get(dateKey(date)) ?? 0;
    running += newCount;
    return { date, total: running, new: newCount };
  });

  return NextResponse.json({ granularity: "daily", data });
}
