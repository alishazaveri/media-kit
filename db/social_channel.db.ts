import { connectDB } from "@/db";
import SocialChannel from "@/db/models/social_channel";

type ChannelUpsertInput = {
  platform_username?: string;
  followers?: number;
  following?: number;
  media_count?: number;
};

export async function upsertSocialChannel(
  userId: string,
  platform: string,
  platformUserId: string,
  data: ChannelUpsertInput
) {
  await connectDB();
  return SocialChannel.findOneAndUpdate(
    { user_id: userId, platform, platform_user_id: platformUserId },
    { ...data },
    { upsert: true, new: true }
  );
}

export async function getSocialChannelsByUserId(userId: string) {
  await connectDB();
  return SocialChannel.find({ user_id: userId }).lean();
}

export async function getSocialChannelById(id: string) {
  await connectDB();
  return SocialChannel.findById(id).lean();
}

export async function getSocialChannelByPlatform(userId: string, platform: string) {
  await connectDB();
  return SocialChannel.findOne({ user_id: userId, platform }).lean();
}

export async function updateSocialChannel(id: string, updates: ChannelUpsertInput) {
  await connectDB();
  return SocialChannel.findByIdAndUpdate(id, updates, { new: true }).lean();
}

export async function deleteSocialChannel(id: string) {
  await connectDB();
  return SocialChannel.findByIdAndDelete(id);
}

export async function getSocialChannelByPlatformUsername(
  platformUsername: string,
  platform = "instagram",
) {
  await connectDB();
  return SocialChannel.findOne({ platform, platform_username: platformUsername }).lean();
}
