import {
  getUserData,
  mergeDraftData,
  publishDraftData,
  linkInsight,
  initializeUserData,
  refreshUserDataPostUrls,
} from "@/db/user_data.db";

export async function saveDraft(
  userId: string,
  platform: string,
  patch: Record<string, any>
) {
  return mergeDraftData(userId, platform, patch);
}

export async function publishUserData(userId: string, platform: string) {
  return publishDraftData(userId, platform);
}

export async function getDraft(userId: string, platform = "instagram") {
  return getUserData(userId, platform);
}

export async function initializeCreatorUserData(userId: string, platform: string) {
  return initializeUserData(userId, platform);
}

export async function refreshPostMediaUrls(
  userId: string,
  platform: string,
  urlMap: Map<string, { media_url: string | null; thumbnail_url: string | null }>,
) {
  return refreshUserDataPostUrls(userId, platform, urlMap);
}

export async function linkInsightToUserData(
  userId: string,
  platform: string,
  insightsId: string
) {
  return linkInsight(userId, platform, insightsId);
}
