import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { connectDB } from "@/db";
import User from "@/db/models/user";
import Subscription from "@/db/models/subscription";
import Invoice from "@/db/models/invoice";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    activeSubscriptions,
    trialUsers,
    revenueAgg,
    recentUsers,
    recentInvoices,
  ] = await Promise.all([
    User.countDocuments(),
    Subscription.countDocuments({ status: "active" }),
    User.countDocuments({ trial_ends_at: { $gt: now } }),
    Invoice.aggregate([
      { $match: { status: "paid", created_at: { $gte: startOfMonth } } },
      { $group: { _id: "$currency", total: { $sum: "$total_amount" } } },
    ]),
    User.find()
      .sort({ created_at: -1 })
      .limit(8)
      .select("name email username created_at")
      .lean(),
    Invoice.find({ status: "paid" })
      .sort({ created_at: -1 })
      .limit(8)
      .select("customer_name plan_name total_amount created_at invoice_number currency")
      .lean(),
  ]);

  const revenueINR = revenueAgg.find((r: any) => r._id === "INR" || r._id == null)?.total ?? 0;
  const revenueUSD = revenueAgg.find((r: any) => r._id === "USD")?.total ?? 0;

  return NextResponse.json({
    totalUsers,
    activeSubscriptions,
    trialUsers,
    revenueINR,
    revenueUSD,
    recentUsers,
    recentInvoices,
  });
}
