import { connectDB } from "@/db";
import Insight from "@/db/models/insight";

export async function upsertInsight(
  userId: string,
  socialChannelId: string,
  platform: string,
  data: Record<string, any>,
  reach = 0
) {
  await connectDB();
  return Insight.findOneAndUpdate(
    { user_id: userId, social_channel_id: socialChannelId, platform },
    { $set: { data, reach } },
    { upsert: true, new: true }
  );
}

export async function getInsightByUserId(userId: string, platform?: string) {
  await connectDB();
  const query: Record<string, any> = { user_id: userId };
  if (platform) query.platform = platform;
  return Insight.findOne(query).lean();
}

export async function getInsightBySocialChannel(socialChannelId: string) {
  await connectDB();
  return Insight.findOne({ social_channel_id: socialChannelId }).lean();
}

export async function deleteInsightBySocialChannel(socialChannelId: string) {
  await connectDB();
  return Insight.deleteMany({ social_channel_id: socialChannelId });
}
