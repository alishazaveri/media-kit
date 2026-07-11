import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export type AdminSessionPayload = {
  adminId: string;
  email: string;
  name: string;
};

const COOKIE_NAME = "admin_session";
const MAX_AGE = 8 * 60 * 60; // 8 hours

export function signAdminToken(payload: AdminSessionPayload): string {
  return jwt.sign(payload, process.env.ADMIN_JWT_SECRET!, { expiresIn: "8h" });
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.ADMIN_JWT_SECRET!) as AdminSessionPayload;
  } catch {
    return null;
  }
}

export function setAdminSessionCookie(token: string): Record<string, string | boolean | number> {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: MAX_AGE,
    path: "/",
  };
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
