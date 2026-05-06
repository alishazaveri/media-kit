import { connectDB } from "@/db";
import Account from "@/db/models/account";

type AccountUpsertInput = {
  platform_username?: string;
  followers?: number;
  following?: number;
  media_count?: number;
};

export async function upsertAccount(
  userId: string,
  platform: string,
  platformUserId: string,
  data: AccountUpsertInput
) {
  await connectDB();
  return Account.findOneAndUpdate(
    { user_id: userId, platform, platform_user_id: platformUserId },
    { ...data },
    { upsert: true, new: true }
  );
}

export async function getAccountsByUserId(userId: string) {
  await connectDB();
  return Account.find({ user_id: userId }).lean();
}

export async function getAccountById(id: string) {
  await connectDB();
  return Account.findById(id).lean();
}

export async function getAccountByPlatform(userId: string, platform: string) {
  await connectDB();
  return Account.findOne({ user_id: userId, platform }).lean();
}

export async function updateAccount(id: string, updates: AccountUpsertInput) {
  await connectDB();
  return Account.findByIdAndUpdate(id, updates, { new: true }).lean();
}

export async function deleteAccount(id: string) {
  await connectDB();
  return Account.findByIdAndDelete(id);
}
