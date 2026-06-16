import { connectDB } from "@/db";
import UserData from "@/db/models/user_data";

export async function getUserData(userId: string, platform: string) {
  await connectDB();
  return UserData.findOne({ user_id: userId, platform }).lean();
}

export async function mergeDraftData(
  userId: string,
  platform: string,
  patch: Record<string, unknown>
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
  const record = await UserData.findOne({ user_id: userId, platform }).lean() as { draft_data: unknown } | null;
  if (!record) throw new Error("No user data found to publish");
  return UserData.findOneAndUpdate(
    { user_id: userId, platform },
    { $set: { published_data: record.draft_data } },
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

export async function initializeUserData(userId: string, platform: string) {
  await connectDB();
  return UserData.findOneAndUpdate(
    { user_id: userId, platform },
    {
      $setOnInsert: {
        draft_data: { posts: [] },
        published_data: { posts: [] },
      },
    },
    { upsert: true, new: true }
  ).lean();
}

export async function refreshUserDataPostUrls(
  userId: string,
  platform: string,
  urlMap: Map<string, { media_url: string | null; thumbnail_url: string | null }>,
) {
  await connectDB();
  type PostRecord = { id: string; media_url?: string | null; thumbnail_url?: string | null; [key: string]: unknown };
  type CollabRecord = { collabPosts?: PostRecord[]; [key: string]: unknown };
  type SectionData = { posts?: PostRecord[]; campaign_posts?: PostRecord[]; collabs?: CollabRecord[] };
  type DataRecord = { draft_data?: SectionData; published_data?: SectionData };

  const record = await UserData.findOne({ user_id: userId, platform }).lean() as DataRecord | null;
  if (!record) return;

  const applyUrls = (posts: PostRecord[]) =>
    posts.map((p) => {
      const fresh = urlMap.get(p.id);
      if (!fresh) return p;
      return {
        ...p,
        ...(fresh.media_url != null && { media_url: fresh.media_url }),
        ...(fresh.thumbnail_url != null && { thumbnail_url: fresh.thumbnail_url }),
      };
    });

  const applyCollabUrls = (collabs: CollabRecord[]) =>
    collabs.map((c) => ({
      ...c,
      ...(Array.isArray(c.collabPosts) && { collabPosts: applyUrls(c.collabPosts) }),
    }));

  const draft = record.draft_data ?? {};
  const published = record.published_data ?? {};
  const updates: Record<string, PostRecord[] | CollabRecord[]> = {};

  if (Array.isArray(draft.posts))
    updates["draft_data.posts"] = applyUrls(draft.posts);
  if (Array.isArray(draft.campaign_posts))
    updates["draft_data.campaign_posts"] = applyUrls(draft.campaign_posts);
  if (Array.isArray(draft.collabs))
    updates["draft_data.collabs"] = applyCollabUrls(draft.collabs);
  if (Array.isArray(published.posts))
    updates["published_data.posts"] = applyUrls(published.posts);
  if (Array.isArray(published.campaign_posts))
    updates["published_data.campaign_posts"] = applyUrls(published.campaign_posts);
  if (Array.isArray(published.collabs))
    updates["published_data.collabs"] = applyCollabUrls(published.collabs);

  if (Object.keys(updates).length === 0) return;
  await UserData.findOneAndUpdate({ user_id: userId, platform }, { $set: updates });
}

export async function deleteUserData(userId: string, platform: string) {
  await connectDB();
  return UserData.deleteMany({ user_id: userId, platform });
}
