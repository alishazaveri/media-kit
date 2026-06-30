import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getInvoicesByUserId } from "@/db/invoice.db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoices = await getInvoicesByUserId(session.userId);
  return NextResponse.json({ invoices });
}
