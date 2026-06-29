import { connectDB } from "@/db";
import BillingProfile from "@/db/models/billing_profile";

export async function getBillingProfile(userId: string) {
  await connectDB();
  return BillingProfile.findOne({ user_id: userId }).lean();
}

export async function upsertBillingProfile(
  userId: string,
  data: {
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
  }
) {
  await connectDB();
  return BillingProfile.findOneAndUpdate(
    { user_id: userId },
    { ...data, user_id: userId },
    { upsert: true, new: true }
  ).lean();
}
