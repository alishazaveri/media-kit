import { connectDB } from "@/db";
import Token from "@/db/models/token";
import { encrypt, decrypt } from "@/lib/encryption";

export async function createToken(
  userId: string,
  token: string,
  type: string,
  expiresAt: Date,
  platform?: string,
  accountId?: string
) {
  await connectDB();
  return Token.create({
    user_id: userId,
    token,
    type,
    expires_at: expiresAt,
    ...(platform && { platform }),
    ...(accountId && { account_id: accountId }),
  });
}

export async function getTokenByValue(token: string) {
  await connectDB();
  return Token.findOne({ token }).lean();
}

export async function getTokenByUserId(userId: string, type: string) {
  await connectDB();
  return Token.findOne({ user_id: userId, type }).lean();
}

export async function deleteToken(id: string) {
  await connectDB();
  return Token.findByIdAndDelete(id);
}

export async function deleteTokensByUserId(userId: string, type: string) {
  await connectDB();
  return Token.deleteMany({ user_id: userId, type });
}

export async function upsertToken(
  userId: string,
  type: string,
  token: string,
  expiresAt: Date,
  platform?: string,
  accountId?: string
) {
  await connectDB();
  return Token.findOneAndUpdate(
    { user_id: userId, type, ...(platform && { platform }) },
    { token: encrypt(token), expires_at: expiresAt, ...(accountId && { account_id: accountId }) },
    { upsert: true, new: true }
  );
}

export async function getTokenByPlatform(userId: string, platform: string, type: string) {
  await connectDB();
  const doc = await Token.findOne({ user_id: userId, platform, type }).lean();
  if (!doc) return null;
  return { ...doc, token: decrypt(doc.token) };
}

export async function updateTokenById(id: string, token: string, expiresAt: Date) {
  await connectDB();
  const doc = await Token.findByIdAndUpdate(id, { token: encrypt(token), expires_at: expiresAt }, { new: true });
  if (!doc) return null;
  doc.token = decrypt(doc.token);
  return doc;
}
