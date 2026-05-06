import {
  upsertAnalytics,
  updateAnalyticsData,
  getAnalyticsByUserId,
  getAnalyticsByAccount,
  getAnalyticsByDateRange,
} from "@/db/analytics.db";

export async function saveAnalytics(
  userId: string,
  accountId: string,
  platform: string,
  date: Date,
  data: Record<string, any>,
  reach = 0
) {
  return upsertAnalytics({ userId, accountId, platform, date, data, reach });
}

export async function updateAnalytics(
  userId: string,
  accountId: string,
  platform: string,
  date: Date,
  data: Record<string, any>,
  reach?: number
) {
  return updateAnalyticsData(userId, accountId, platform, date, data, reach);
}

export async function getUserAnalytics(userId: string) {
  return getAnalyticsByUserId(userId);
}

export async function getAccountAnalytics(accountId: string) {
  return getAnalyticsByAccount(accountId);
}

export async function getAnalyticsInRange(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  return getAnalyticsByDateRange(userId, startDate, endDate);
}
