import {
  createPublishedApp,
  getPublishedAppByUserId,
  getPublishedAppBySlug,
  updatePublishedApp,
  deletePublishedApp,
} from "@/db/published_app.db";

export async function createDraft(userId: string, usernameSlug: string) {
  const existing = await getPublishedAppByUserId(userId);
  if (existing) throw new Error("App already exists for this user");

  const slugTaken = await getPublishedAppBySlug(usernameSlug);
  if (slugTaken) throw new Error("Username slug is already taken");

  return createPublishedApp(userId, usernameSlug);
}

export async function publishApp(
  userId: string,
  customizationSnapshot: Record<string, any>
) {
  const app = await getPublishedAppByUserId(userId);
  if (!app) throw new Error("No app found for this user");

  return updatePublishedApp(userId, {
    status: "live",
    customization_snapshot: customizationSnapshot,
    published_at: new Date(),
  });
}

export async function unpublishApp(userId: string) {
  const app = await getPublishedAppByUserId(userId);
  if (!app) throw new Error("No app found for this user");

  return updatePublishedApp(userId, { status: "unpublished" });
}

export async function getUserApp(userId: string) {
  return getPublishedAppByUserId(userId);
}

export async function getPublicApp(usernameSlug: string) {
  const app = await getPublishedAppBySlug(usernameSlug);
  if (!app) throw new Error("App not found");
  return app;
}

export async function deleteApp(userId: string) {
  return deletePublishedApp(userId);
}
