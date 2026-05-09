import { connectDB } from "@/db";
import UserData from "@/db/models/user_data";

export async function getUserData(userId: string, platform: string) {
  await connectDB();
  return UserData.findOne({ user_id: userId, platform }).lean();
}

export async function mergeDraftData(
  userId: string,
  platform: string,
  patch: Record<string, any>
) {
  await connectDB();
  const setFields = Object.fromEntries(
    Object.entries(patch).map(([k, v]) => [`draft_data.${k}`, v])
  );
  return UserData.findOneAndUpdate(
    { user_id: userId, platform },
    { $set: setFields },
    { upsert: true, new: true }
  ).lean();
}

export async function publishDraftData(userId: string, platform: string) {
  await connectDB();
  const record = await UserData.findOne({ user_id: userId, platform }).lean();
  if (!record) throw new Error("No user data found to publish");
  return UserData.findOneAndUpdate(
    { user_id: userId, platform },
    { $set: { published_data: (record as any).draft_data } },
    { new: true }
  ).lean();
}

export async function linkInsight(userId: string, platform: string, insightsId: string) {
  await connectDB();
  return UserData.findOneAndUpdate(
    { user_id: userId, platform },
    { insights_id: insightsId },
    { upsert: true, new: true }
  );
}

export async function deleteUserData(userId: string, platform: string) {
  await connectDB();
  return UserData.deleteMany({ user_id: userId, platform });
}
