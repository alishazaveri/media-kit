import { connectDB } from "@/db";
import TrialLink from "@/db/models/trial_link";
import crypto from "crypto";

export async function createTrialLink({
  label,
  duration_days,
  max_uses,
  expires_at,
}: {
  label?: string;
  duration_days: number;
  max_uses: number;
  expires_at?: Date;
}) {
  await connectDB();
  const token = crypto.randomBytes(16).toString("hex");
  return TrialLink.create({ token, label: label ?? "", duration_days, max_uses, expires_at });
}

export async function getTrialLinkByToken(token: string) {
  await connectDB();
  return TrialLink.findOne({ token }).lean();
}

export async function incrementTrialLinkUses(token: string) {
  await connectDB();
  return TrialLink.findOneAndUpdate({ token }, { $inc: { uses_count: 1 } });
}
