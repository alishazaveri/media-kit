import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { put } from "@vercel/blob";
import { InvoicePDF } from "@/lib/invoice-pdf";
import { IInvoice } from "@/db/models/invoice";

export async function generateAndUploadInvoicePdf(invoice: IInvoice): Promise<string> {
  const buffer = await renderToBuffer(<InvoicePDF invoice={invoice} />);

  const safeNumber = invoice.invoice_number.replace(/\//g, "-");
  const pathname = `invoices/${invoice._id}-${safeNumber}.pdf`;

  const blob = await put(pathname, buffer, {
    access: "public",
    contentType: "application/pdf",
  });

  return blob.url;
}
