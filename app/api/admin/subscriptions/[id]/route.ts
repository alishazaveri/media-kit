import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAdminSession } from "@/lib/admin-session";
import { connectDB } from "@/db";
import Subscription from "@/db/models/subscription";
import User from "@/db/models/user";
import Invoice from "@/db/models/invoice";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  await connectDB();

  const sub = await Subscription.findById(id).lean();
  if (!sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

  const [user, invoices] = await Promise.all([
    User.findById(sub.user_id).select("name email username").lean(),
    Invoice.find({ razorpay_subscription_id: sub.razorpay_subscription_id })
      .sort({ created_at: -1 })
      .lean(),
  ]);

  return NextResponse.json({
    data: {
      id: (sub._id as any).toString(),
      razorpaySubscriptionId: sub.razorpay_subscription_id,
      planId: sub.plan_id,
      status: sub.status ?? "created",
      currentPeriodStart: sub.current_period_start ?? null,
      currentPeriodEnd: sub.current_period_end ?? null,
      subscriptionStartAt: sub.subscription_start_at ?? null,
      cancelAtCycleEnd: sub.cancel_at_cycle_end ?? false,
      cancelledAt: sub.cancelled_at ?? null,
      createdAt: sub.created_at,
      user: user
        ? {
            id: (user._id as any).toString(),
            name: user.name,
            email: user.email,
            username: user.username,
          }
        : null,
      invoices: invoices.map((inv) => ({
        id: (inv._id as any).toString(),
        invoiceNumber: inv.invoice_number,
        planName: inv.plan_name,
        totalAmount: inv.total_amount,
        status: inv.status,
        invoiceDate: inv.invoice_date,
        periodStart: inv.subscription_period_start ?? null,
        periodEnd: inv.subscription_period_end ?? null,
        pdfUrl: inv.pdf_url ?? null,
      })),
    },
  });
}
