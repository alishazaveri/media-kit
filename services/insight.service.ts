import {
  upsertInsight,
  getInsightByUserId,
  getInsightBySocialChannel,
} from "@/db/insight.db";

export async function saveInsight(
  userId: string,
  socialChannelId: string,
  platform: string,
  data: Record<string, any>,
  reach = 0
) {
  return upsertInsight(userId, socialChannelId, platform, data, reach);
}

export async function getInsight(userId: string, platform = "instagram") {
  return getInsightByUserId(userId, platform);
}

export async function getChannelInsight(socialChannelId: string) {
  return getInsightBySocialChannel(socialChannelId);
}
