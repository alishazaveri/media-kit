import { put, del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import heicConvert from "heic-convert";
import { requireSession } from "@/lib/session";
import { updateUser } from "@/db/user.db";
import { getUserData, mergeDraftData } from "@/db/user_data.db";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_DIMENSION = 1200; // px

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

  if (file.type && !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5 MB" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const name = (file.name ?? "").toLowerCase();
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif");

  // heic-convert handles HEIC/HEIF since sharp doesn't bundle libheif.
  // For all other formats sharp handles conversion + EXIF rotation.
  const inputBuffer = isHeic
    ? Buffer.from(
        await heicConvert({
          buffer: buffer as unknown as ArrayBuffer,
          format: "JPEG",
          quality: 1,
        })
      )
    : buffer;

  const jpeg = await sharp(inputBuffer)
    .rotate()
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  const filename = `profile-images/${session.userId}-${Date.now()}.jpg`;

  // Read existing draft/published URLs before uploading
  const userData = await getUserData(session.userId, "profile");
  const record = userData as { draft_data?: Record<string, unknown>; published_data?: Record<string, unknown> } | null;
  const oldDraftPic = record?.draft_data?.profile_pic;
  const publishedPic = record?.published_data?.profile_pic;

  const blob = await put(filename, jpeg, {
    access: "public",
    contentType: "image/jpeg",
  });

  // Delete the previous draft blob only if it wasn't the published image
  if (isVercelBlobUrl(oldDraftPic) && oldDraftPic !== publishedPic) {
    del(oldDraftPic).catch(() => {});
  }

  return NextResponse.json({ url: blob.url });
}

export async function DELETE() {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userData = await getUserData(session.userId, "profile");
  const record = userData as { draft_data?: Record<string, unknown>; published_data?: Record<string, unknown> } | null;
  const draftPic = record?.draft_data?.profile_pic;
  const publishedPic = record?.published_data?.profile_pic;

  // Delete the draft blob from storage unless it's also the published image
  if (isVercelBlobUrl(draftPic) && draftPic !== publishedPic) {
    del(draftPic).catch(() => {});
  }

  await Promise.all([
    updateUser(session.userId, { profile_image_url: "" }),
    mergeDraftData(session.userId, "profile", { profile_pic: null }),
  ]);

  return NextResponse.json({ ok: true });
}
