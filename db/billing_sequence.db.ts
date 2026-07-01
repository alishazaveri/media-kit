import { connectDB } from "@/db";
import BillingSequence from "@/db/models/billing_sequence";

export async function getNextSequenceNumber(prefix: string, financialYear: string): Promise<number> {
  await connectDB();
  const doc = await BillingSequence.findOneAndUpdate(
    { prefix, financial_year: financialYear },
    { $inc: { last_number: 1 } },
    { upsert: true, new: true }
  );
  return doc.last_number;
}
