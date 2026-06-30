import { connectDB } from "@/db";
import Invoice, { IInvoice } from "@/db/models/invoice";

export async function createInvoice(data: Omit<IInvoice, keyof Document | "created_at" | "updated_at">) {
  await connectDB();
  return Invoice.create(data);
}

export async function getInvoicesByUserId(userId: string) {
  await connectDB();
  return Invoice.find({ user_id: userId }).sort({ created_at: -1 }).lean();
}

export async function getInvoiceByPaymentId(paymentId: string) {
  await connectDB();
  return Invoice.findOne({ razorpay_payment_id: paymentId }).lean();
}

export async function getInvoiceById(id: string) {
  await connectDB();
  return Invoice.findById(id).lean();
}

export async function updateInvoicePdfUrl(id: string, pdfUrl: string) {
  await connectDB();
  return Invoice.updateOne({ _id: id }, { pdf_url: pdfUrl });
}
