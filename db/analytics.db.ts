import { connectDB } from "@/db";
import Analytics from "@/db/models/analytics";

type AnalyticsUpsertInput = {
  userId: string;
  accountId: string;
  platform: string;
  date: Date;
  data?: Record<string, any>;
  reach?: number;
};

export async function upsertAnalytics(input: AnalyticsUpsertInput) {
  await connectDB();
  return Analytics.findOneAndUpdate(
    {
      user_id: input.userId,
      account_id: input.accountId,
      platform: input.platform,
      date: input.date,
    },
    { data: input.data, reach: input.reach ?? 0 },
    { upsert: true, new: true }
  );
}

export async function getAnalyticsByUserId(userId: string) {
  await connectDB();
  return Analytics.find({ user_id: userId }).sort({ date: -1 }).lean();
}

export async function getAnalyticsByAccount(accountId: string) {
  await connectDB();
  return Analytics.find({ account_id: accountId }).sort({ date: -1 }).lean();
}

export async function getAnalyticsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  await connectDB();
  return Analytics.find({
    user_id: userId,
    date: { $gte: startDate, $lte: endDate },
  })
    .sort({ date: -1 })
    .lean();
}

export async function updateAnalyticsData(
  userId: string,
  accountId: string,
  platform: string,
  date: Date,
  data: Record<string, any>,
  reach?: number
) {
  await connectDB();
  return Analytics.findOneAndUpdate(
    { user_id: userId, account_id: accountId, platform, date },
    { $set: { data, ...(reach !== undefined && { reach }) } },
    { new: true }
  ).lean();
}

export async function deleteAnalyticsByAccount(accountId: string) {
  await connectDB();
  return Analytics.deleteMany({ account_id: accountId });
}
