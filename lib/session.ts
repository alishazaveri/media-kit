import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import config from "@/lib/config";
import { getTokenByValue, deleteToken } from "@/db/token.db";
import { getUserById } from "@/db/user.db";

export type SessionPayload = {
  userId: string;
  email: string;
  username: string;
};

const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutes in seconds

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (accessToken) {
    try {
      return jwt.verify(accessToken, config.JWT_SECRET) as SessionPayload;
    } catch {
      // expired or invalid — fall through to refresh
    }
  }

  const refreshToken = cookieStore.get("refresh_token")?.value;
  if (!refreshToken) return null;

  const tokenDoc = await getTokenByValue(refreshToken);
  if (!tokenDoc || tokenDoc.type !== "refresh" || tokenDoc.expires_at < new Date()) {
    if (tokenDoc) await deleteToken(tokenDoc._id.toString());
    return null;
  }

  let payload: { userId: string };
  try {
    payload = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as { userId: string };
  } catch {
    return null;
  }

  const user = await getUserById(payload.userId);
  if (!user) return null;

  const newAccessToken = jwt.sign(
    { userId: user._id.toString(), email: user.email, username: user.username },
    config.JWT_SECRET,
    { expiresIn: "15m" }
  );

  cookieStore.set("access_token", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ACCESS_TOKEN_MAX_AGE,
    path: "/",
  });

  return {
    userId: user._id.toString(),
    email: user.email,
    username: user.username,
  };
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}
