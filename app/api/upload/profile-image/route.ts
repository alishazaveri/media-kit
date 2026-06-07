import { put, del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { updateUser } from "@/db/user.db";
import { getUserData } from "@/db/user_data.db";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function isVercelBlobUrl(url: unknown): url is string {
  return typeof url === "string" && url.includes(".public.blob.vercel-storage.com");
}

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: jpeg, png, webp, gif" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5 MB" },
      { status: 400 }
    );
  }

  const ext = file.type.split("/")[1];
  const filename = `profile-images/${session.userId}-${Date.now()}.${ext}`;

  // Read existing draft/published URLs before uploading
  const userData = await getUserData(session.userId, "profile");
  const record = userData as { draft_data?: Record<string, unknown>; published_data?: Record<string, unknown> } | null;
  const oldDraftPic = record?.draft_data?.profile_pic;
  const publishedPic = record?.published_data?.profile_pic;

  const blob = await put(filename, file, { access: "public" });

  await updateUser(session.userId, { profile_image_url: blob.url });

  // Delete the previous draft blob only if it wasn't the published image
  if (isVercelBlobUrl(oldDraftPic) && oldDraftPic !== publishedPic) {
    del(oldDraftPic).catch(() => {});
  }

  return NextResponse.json({ url: blob.url });
}
