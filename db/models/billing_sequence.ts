import mongoose, { Schema, Document } from "mongoose";

export interface IBillingSequence extends Document {
  prefix: string;
  financial_year: string;
  last_number: number;
}

const BillingSequenceSchema = new Schema<IBillingSequence>({
  prefix: { type: String, required: true },
  financial_year: { type: String, required: true },
  last_number: { type: Number, required: true, default: 0 },
});

BillingSequenceSchema.index({ prefix: 1, financial_year: 1 }, { unique: true });

export default mongoose.models.BillingSequence ||
  mongoose.model<IBillingSequence>("BillingSequence", BillingSequenceSchema);
