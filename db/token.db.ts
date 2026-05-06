import { connectDB } from "@/db";
import Token from "@/db/models/token";

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
    { token, expires_at: expiresAt, ...(accountId && { account_id: accountId }) },
    { upsert: true, new: true }
  );
}

export async function getTokenByPlatform(userId: string, platform: string, type: string) {
  await connectDB();
  return Token.findOne({ user_id: userId, platform, type }).lean();
}

export async function updateTokenById(id: string, token: string, expiresAt: Date) {
  await connectDB();
  return Token.findByIdAndUpdate(id, { token, expires_at: expiresAt }, { new: true });
}
