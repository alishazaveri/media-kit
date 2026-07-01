import mongoose, { Schema, Document } from "mongoose";

export interface IBillingProfile extends Document {
  user_id: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  phone_country_code: string;
  gstin?: string;
  company_name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  state_code?: string;
  country?: string;
  created_at: Date;
  updated_at: Date;
}

const BillingProfileSchema = new Schema<IBillingProfile>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    phone_country_code: { type: String, required: true, default: "+91" },
    gstin: { type: String },
    company_name: { type: String },
    address_line1: { type: String },
    address_line2: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    state_code: { type: String },
    country: { type: String, default: "IN" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.models.BillingProfile ||
  mongoose.model<IBillingProfile>("BillingProfile", BillingProfileSchema);
