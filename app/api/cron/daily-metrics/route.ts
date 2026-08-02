import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db";
import Subscription from "@/db/models/subscription";
import DailyMetric from "@/db/models/daily_metric";
import { findPlanByGatewayPlanId } from "@/lib/plans";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const istOffsetMs = 5.5 * 60 * 60 * 1000;

  // Derive "yesterday" in IST
  const now = new Date();
  const nowIST = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const prevDayIST = new Date(nowIST);
  prevDayIST.setDate(prevDayIST.getDate() - 1);

  // Stored date key: midnight UTC of the IST calendar date (e.g. 2026-08-01T00:00:00Z)
  const metricDate = new Date(
    Date.UTC(prevDayIST.getFullYear(), prevDayIST.getMonth(), prevDayIST.getDate())
  );

  // Query boundaries: actual IST midnight in UTC (for subscription date comparisons)
  const prevDayStartUTC = new Date(metricDate.getTime() - istOffsetMs);
  const prevDayEndUTC = new Date(prevDayStartUTC.getTime() + 24 * 60 * 60 * 1000);

  console.log(
    `[Cron] daily-metrics: computing subscriptions for IST day ${prevDayIST.toDateString()} ` +
    `(UTC ${prevDayStartUTC.toISOString()} → ${prevDayEndUTC.toISOString()})`
  );

  function currency(planId: string): "INR" | "USD" | null {
    return findPlanByGatewayPlanId("razorpay", planId)?.currency ?? null;
  }

  // Active count at cron time
  const activeSubs = await Subscription.find({ status: "active" }, { plan_id: 1 }).lean();
  let activeINR = 0, activeUSD = 0;
  for (const sub of activeSubs) {
    const c = currency(sub.plan_id);
    if (c === "INR") activeINR++;
    else if (c === "USD") activeUSD++;
  }

  // New subscriptions: created yesterday IST, status is active / authenticated / cancelled
  const newSubs = await Subscription.find(
    {
      created_at: { $gte: prevDayStartUTC, $lt: prevDayEndUTC },
      status: { $in: ["active", "authenticated", "cancelled"] },
    },
    { plan_id: 1 }
  ).lean();
  let newINR = 0, newUSD = 0;
  for (const sub of newSubs) {
    const c = currency(sub.plan_id);
    if (c === "INR") newINR++;
    else if (c === "USD") newUSD++;
  }

  // Cancelled subscriptions: cancelled_at within yesterday IST
  const cancelledSubs = await Subscription.find(
    { cancelled_at: { $gte: prevDayStartUTC, $lt: prevDayEndUTC } },
    { plan_id: 1 }
  ).lean();
  let cancelledINR = 0, cancelledUSD = 0;
  for (const sub of cancelledSubs) {
    const c = currency(sub.plan_id);
    if (c === "INR") cancelledINR++;
    else if (c === "USD") cancelledUSD++;
  }

  await DailyMetric.findOneAndUpdate(
    { type: "subscriptions", date: metricDate },
    {
      $set: {
        subscriptions: { activeINR, activeUSD, newINR, newUSD, cancelledINR, cancelledUSD },
      },
    },
    { upsert: true }
  );

  const result = { activeINR, activeUSD, newINR, newUSD, cancelledINR, cancelledUSD };
  console.log("[Cron] daily-metrics: done", result);

  return NextResponse.json({ success: true, date: metricDate, ...result });
}
