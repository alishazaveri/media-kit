import { connectDB } from "@/db";
import Customization, { CustomizationStatus } from "@/db/models/customization";

export async function getCustomization(userId: string, status: CustomizationStatus) {
  await connectDB();
  return Customization.findOne({ user_id: userId, status }).lean();
}

export async function upsertCustomization(
  userId: string,
  status: CustomizationStatus,
  themeIdentifier: string = "default"
) {
  await connectDB();
  return Customization.findOneAndUpdate(
    { user_id: userId, status },
    { $set: { theme_identifier: themeIdentifier } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();
}

export async function publishCustomization(userId: string) {
  await connectDB();
  const draft = await Customization.findOne({ user_id: userId, status: "draft" }).lean();
  if (!draft) throw new Error("No draft customization found");
  return Customization.findOneAndUpdate(
    { user_id: userId, status: "published" },
    { $set: { theme_identifier: draft.theme_identifier } },
    { new: true, upsert: true }
  ).lean();
}
