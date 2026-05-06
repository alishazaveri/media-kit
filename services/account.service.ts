import axios from "axios";
import {
  upsertAccount,
  getAccountsByUserId,
  getAccountById,
  getAccountByPlatform,
  updateAccount,
  deleteAccount,
} from "@/db/account.db";
import { upsertToken, getTokenByPlatform, updateTokenById } from "@/db/token.db";
import { deleteAnalyticsByAccount } from "@/db/analytics.db";

const INSTAGRAM_TOKEN_TTL_MS = 60 * 24 * 60 * 60 * 1000; // 60 days
const INSTAGRAM_REFRESH_THRESHOLD_MS = 10 * 24 * 60 * 60 * 1000; // refresh if < 10 days left

export async function connectInstagramAccount(
  userId: string,
  profile: {
    id: string;
    username?: string;
    followers_count?: number;
    follows_count?: number;
    media_count?: number;
  },
  accessToken: string
) {
  const account = await upsertAccount(userId, "instagram", profile.id, {
    platform_username: profile.username,
    followers: profile.followers_count ?? 0,
    following: profile.follows_count ?? 0,
    media_count: profile.media_count ?? 0,
  });

  await upsertToken(
    userId,
    "access",
    accessToken,
    new Date(Date.now() + INSTAGRAM_TOKEN_TTL_MS),
    "instagram",
    account._id.toString()
  );

  return account;
}

export async function refreshInstagramToken(userId: string) {
  const tokenDoc = await getTokenByPlatform(userId, "instagram", "access");
  if (!tokenDoc) throw new Error("Instagram token not found");

  const timeLeft = tokenDoc.expires_at.getTime() - Date.now();
  if (timeLeft > INSTAGRAM_REFRESH_THRESHOLD_MS) return tokenDoc; // still fresh

  const res = await axios.get("https://graph.instagram.com/refresh_access_token", {
    params: {
      grant_type: "ig_refresh_token",
      access_token: tokenDoc.token,
    },
  });

  const { access_token, expires_in } = res.data;
  const newExpiresAt = new Date(Date.now() + expires_in * 1000);

  return updateTokenById(tokenDoc._id.toString(), access_token, newExpiresAt);
}

export async function getUserAccounts(userId: string) {
  return getAccountsByUserId(userId);
}

export async function getAccount(id: string) {
  return getAccountById(id);
}

export async function getUserInstagramAccount(userId: string) {
  return getAccountByPlatform(userId, "instagram");
}

export async function updateAccountStats(
  id: string,
  stats: { followers?: number; following?: number; media_count?: number }
) {
  return updateAccount(id, stats);
}

export async function getValidInstagramToken(userId: string): Promise<string> {
  const tokenDoc = await getTokenByPlatform(userId, "instagram", "access");
  if (!tokenDoc) throw new Error("Instagram not connected");

  const timeLeft = tokenDoc.expires_at.getTime() - Date.now();
  if (timeLeft <= INSTAGRAM_REFRESH_THRESHOLD_MS) {
    const updated = await refreshInstagramToken(userId);
    return (updated as any).token as string;
  }

  return tokenDoc.token;
}

export async function disconnectAccount(id: string) {
  await deleteAnalyticsByAccount(id);
  return deleteAccount(id);
}
