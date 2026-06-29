import mongoose, { Schema, Document } from "mongoose";

export interface IInvoice extends Document {
  // Identity
  invoice_number: string;
  prefix: string;
  financial_year: string;
  sequence_number: number;
  invoice_date: Date;

  // Supplier snapshot
  supplier_name: string;
  supplier_gstin: string;
  supplier_address_line1: string;
  supplier_address_line2?: string;
  supplier_city: string;
  supplier_state: string;
  supplier_pincode: string;
  supplier_state_code: string;

  // Customer snapshot
  user_id: mongoose.Types.ObjectId;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_gstin?: string;
  customer_company_name?: string;
  customer_address_line1?: string;
  customer_address_line2?: string;
  customer_city?: string;
  customer_state?: string;
  customer_pincode?: string;
  customer_state_code?: string;

  // GST mandatory fields
  place_of_supply: string;
  reverse_charge: boolean;

  // Razorpay
  razorpay_payment_id: string;
  razorpay_subscription_id: string;

  // Service
  plan_id: string;
  plan_name: string;
  service_description: string;
  sac_code: string;
  subscription_period_start?: Date;
  subscription_period_end?: Date;

  // Amounts in paise
  taxable_amount: number;
  tax_type: "cgst_sgst" | "igst";
  cgst_rate?: number;
  cgst_amount?: number;
  sgst_rate?: number;
  sgst_amount?: number;
  igst_rate?: number;
  igst_amount?: number;
  total_amount: number;
  currency: string;

  // Status
  status: "paid" | "refunded";
  refund_reason?: string;
  pdf_url?: string;

  created_at: Date;
  updated_at: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoice_number: { type: String, required: true, unique: true },
    prefix: { type: String, required: true },
    financial_year: { type: String, required: true },
    sequence_number: { type: Number, required: true },
    invoice_date: { type: Date, required: true },

    supplier_name: { type: String, required: true },
    supplier_gstin: { type: String, required: true },
    supplier_address_line1: { type: String, required: true },
    supplier_address_line2: { type: String },
    supplier_city: { type: String, required: true },
    supplier_state: { type: String, required: true },
    supplier_pincode: { type: String, required: true },
    supplier_state_code: { type: String, required: true },

    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customer_name: { type: String, required: true },
    customer_email: { type: String, required: true },
    customer_phone: { type: String, required: true },
    customer_gstin: { type: String },
    customer_company_name: { type: String },
    customer_address_line1: { type: String },
    customer_address_line2: { type: String },
    customer_city: { type: String },
    customer_state: { type: String },
    customer_pincode: { type: String },
    customer_state_code: { type: String },

    place_of_supply: { type: String, required: true },
    reverse_charge: { type: Boolean, required: true, default: false },

    razorpay_payment_id: { type: String, required: true, unique: true },
    razorpay_subscription_id: { type: String, required: true },

    plan_id: { type: String, required: true },
    plan_name: { type: String, required: true },
    service_description: { type: String, required: true },
    sac_code: { type: String, required: true },
    subscription_period_start: { type: Date },
    subscription_period_end: { type: Date },

    taxable_amount: { type: Number, required: true },
    tax_type: { type: String, enum: ["cgst_sgst", "igst"], required: true },
    cgst_rate: { type: Number },
    cgst_amount: { type: Number },
    sgst_rate: { type: Number },
    sgst_amount: { type: Number },
    igst_rate: { type: Number },
    igst_amount: { type: Number },
    total_amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "INR" },

    status: { type: String, enum: ["paid", "refunded"], required: true, default: "paid" },
    refund_reason: { type: String },
    pdf_url: { type: String },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

InvoiceSchema.index({ user_id: 1, created_at: -1 });
InvoiceSchema.index({ financial_year: 1, prefix: 1, sequence_number: 1 });

export default mongoose.models.Invoice ||
  mongoose.model<IInvoice>("Invoice", InvoiceSchema);
