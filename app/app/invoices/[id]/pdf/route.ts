import { NextRequest, NextResponse } from "next/server";
import { getInvoiceById } from "@/db/invoice.db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (!invoice.pdf_url) {
    return NextResponse.json({ error: "PDF not yet generated" }, { status: 404 });
  }

  return NextResponse.redirect(invoice.pdf_url, 307);
}
