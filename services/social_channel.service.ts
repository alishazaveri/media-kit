import axios from "axios";
import {
  upsertSocialChannel,
  getSocialChannelsByUserId,
  getSocialChannelById,
  getSocialChannelByPlatform,
  updateSocialChannel,
  deleteSocialChannel,
} from "@/db/social_channel.db";
import { upsertToken, getTokenByPlatform, updateTokenById } from "@/db/token.db";
import { deleteInsightBySocialChannel } from "@/db/insight.db";
import { deleteUserData } from "@/db/user_data.db";

const INSTAGRAM_TOKEN_TTL_MS = 60 * 24 * 60 * 60 * 1000;
const INSTAGRAM_REFRESH_THRESHOLD_MS = 10 * 24 * 60 * 60 * 1000;

export async function connectInstagramChannel(
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
  const channel = await upsertSocialChannel(userId, "instagram", profile.id, {
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
    channel._id.toString()
  );

  return channel;
}

export async function refreshInstagramToken(userId: string, force = false) {
  const tokenDoc = await getTokenByPlatform(userId, "instagram", "access");
  if (!tokenDoc) throw new Error("Instagram token not found");

  const timeLeft = tokenDoc.expires_at.getTime() - Date.now();
  if (!force && timeLeft > INSTAGRAM_REFRESH_THRESHOLD_MS) return tokenDoc;

  const res = await axios.get("https://graph.instagram.com/refresh_access_token", {
    params: { grant_type: "ig_refresh_token", access_token: tokenDoc.token },
  });

  const { access_token, expires_in } = res.data;
  return updateTokenById(tokenDoc._id.toString(), access_token, new Date(Date.now() + expires_in * 1000));
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

export async function getUserChannels(userId: string) {
  return getSocialChannelsByUserId(userId);
}

export async function getChannel(id: string) {
  return getSocialChannelById(id);
}

export async function getUserInstagramChannel(userId: string) {
  return getSocialChannelByPlatform(userId, "instagram");
}

export async function updateChannelStats(
  id: string,
  stats: { followers?: number; following?: number; media_count?: number }
) {
  return updateSocialChannel(id, stats);
}

export async function disconnectChannel(id: string, userId: string, platform: string) {
  await deleteInsightBySocialChannel(id);
  await deleteUserData(userId, platform);
  return deleteSocialChannel(id);
}
