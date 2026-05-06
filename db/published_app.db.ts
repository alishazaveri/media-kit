import { connectDB } from "@/db";
import PublishedApp from "@/db/models/published_app";

type PublishedAppUpdateInput = Partial<{
  status: string;
  subscription_id: string;
  customization_snapshot: Record<string, any>;
  published_at: Date;
}>;

export async function createPublishedApp(
  userId: string,
  usernameSlug: string
) {
  await connectDB();
  return PublishedApp.create({ user_id: userId, username_slug: usernameSlug });
}

export async function getPublishedAppByUserId(userId: string) {
  await connectDB();
  return PublishedApp.findOne({ user_id: userId }).lean();
}

export async function getPublishedAppBySlug(slug: string) {
  await connectDB();
  return PublishedApp.findOne({ username_slug: slug, status: "live" }).lean();
}

export async function updatePublishedApp(
  userId: string,
  updates: PublishedAppUpdateInput
) {
  await connectDB();
  return PublishedApp.findOneAndUpdate({ user_id: userId }, updates, {
    new: true,
  }).lean();
}

export async function deletePublishedApp(userId: string) {
  await connectDB();
  return PublishedApp.findOneAndDelete({ user_id: userId });
}
