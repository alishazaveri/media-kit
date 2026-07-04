import { NextRequest, NextResponse } from "next/server";
import { fetchAllPaymentsInRange, processPayment, BackfillResults } from "@/services/billing.service";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all payments from start of yesterday IST to now (covers today + yesterday)
  const now = new Date();
  const nowIST = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const startOfYesterdayIST = new Date(nowIST);
  startOfYesterdayIST.setDate(startOfYesterdayIST.getDate() - 1);
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const from = Math.floor((Date.UTC(startOfYesterdayIST.getFullYear(), startOfYesterdayIST.getMonth(), startOfYesterdayIST.getDate()) - istOffsetMs) / 1000);
  const to = Math.floor(now.getTime() / 1000);

  console.log(`[Cron] daily-invoices: fetching payments from ${new Date(from * 1000).toISOString()} to ${new Date(to * 1000).toISOString()}`);

  let payments: Record<string, unknown>[];
  try {
    payments = await fetchAllPaymentsInRange(from, to);
  } catch (err: unknown) {
    console.error("[Cron] daily-invoices: failed to fetch payments", err);
    return NextResponse.json({ error: "Failed to fetch payments from Razorpay" }, { status: 502 });
  }

  console.log(`[Cron] daily-invoices: processing ${payments.length} payment(s)`);

  const results: BackfillResults = { generated: 0, skipped: 0, errors: [] };
  for (const paymentEntity of payments) {
    await processPayment(paymentEntity.id as string, paymentEntity, results);
  }

  console.log(`[Cron] daily-invoices: done — generated=${results.generated} skipped=${results.skipped} errors=${results.errors.length}`);

  return NextResponse.json(results);
}
