import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { connectDB } from "@/db";
import Invoice from "@/db/models/invoice";
import User from "@/db/models/user";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const [invoices, users] = await Promise.all([
    Invoice.find()
      .sort({ created_at: -1 })
      .lean(),
    User.find().select("_id name email username").lean(),
  ]);

  const userMap = new Map(users.map((u) => [(u._id as any).toString(), u]));

  const result = invoices.map((inv) => {
    const user = userMap.get(inv.user_id.toString()) ?? null;
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

  return NextResponse.json({ data: result });
}
