import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import config from "@/lib/config";
import { SALT_ROUNDS, DUMMY_HASH } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/services/email.service";
import {
  createUser,
  getUserByEmail,
  getUserByUsername,
  updateUser,
} from "@/db/user.db";
import {
  createToken,
  getTokenByValue,
  deleteToken,
  deleteTokensByUserId,
} from "@/db/token.db";
import { upsertCustomization } from "@/db/customization.db";
import { initializeCreatorUserData } from "@/services/user_data.service";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 10 * 60 * 1000;

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string) {
  return password.length >= 8;
}

export async function registerUser(
  name: string,
  email: string,
  username: string,
  password: string
) {
  if (!name || !email || !username || !password) {
    throw new Error("All fields are required");
  }
  if (!validateEmail(email)) throw new Error("Invalid email address");
  if (!validatePassword(password))
    throw new Error("Password must be at least 8 characters");

  const [existingEmail, existingUsername] = await Promise.all([
    getUserByEmail(email),
    getUserByUsername(username),
  ]);

  if (existingEmail) throw new Error("Email already in use");
  if (existingUsername) throw new Error("Username already taken");

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser({ name, email, username, password_hash });
  const userId = user._id.toString();

  const verifyToken = crypto.randomBytes(32).toString("hex");

  await Promise.all([
    createToken(userId, verifyToken, "email_verify", new Date(Date.now() + EMAIL_VERIFY_TTL_MS)),
    upsertCustomization(userId, "draft", "default"),
    upsertCustomization(userId, "published", "default"),
    initializeCreatorUserData(userId, "instagram"),
  ]);

  // TODO: send verification email with verifyToken
  return { user, verifyToken };
}

export async function loginUser(identifier: string, password: string) {
  if (!identifier || !password) throw new Error("Identifier and password are required");

  const normalized = identifier.trim().toLowerCase();
  const isEmail = normalized.includes("@");
  const user = isEmail
    ? await getUserByEmail(normalized)
    : await getUserByUsername(normalized);
  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH); // timing-safe: same cost as a real compare
    throw new Error("Invalid credentials");
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error("Invalid credentials");

  const userId = user._id.toString();

  const accessToken = jwt.sign(
    { userId, email: user.email, username: user.username },
    config.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

  const refreshToken = jwt.sign({ userId }, config.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  await createToken(
    userId,
    refreshToken,
    "refresh",
    new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: userId,
      name: user.name,
      email: user.email,
      username: user.username,
      planId: user.plan_id?.toString() ?? null,
    },
  };
}

export async function logoutUser(refreshToken: string) {
  const tokenDoc = await getTokenByValue(refreshToken);
  if (tokenDoc) await deleteToken(tokenDoc._id.toString());
}

export async function verifyEmail(token: string) {
  if (!token) throw new Error("Token is required");

  const tokenDoc = await getTokenByValue(token);
  if (!tokenDoc || tokenDoc.type !== "email_verify")
    throw new Error("Invalid or expired token");
  if (tokenDoc.expires_at < new Date()) {
    await deleteToken(tokenDoc._id.toString());
    throw new Error("Token has expired");
  }

  await deleteToken(tokenDoc._id.toString());
}

export async function forgotPassword(email: string) {
  if (!email) throw new Error("Email is required");

  const user = await getUserByEmail(email);
  if (!user) return; // silent — don't reveal whether email exists

  await deleteTokensByUserId(user._id.toString(), "password_reset");

  const resetToken = crypto.randomBytes(32).toString("hex");
  await createToken(
    user._id.toString(),
    resetToken,
    "password_reset",
    new Date(Date.now() + PASSWORD_RESET_TTL_MS)
  );

  await sendPasswordResetEmail(user.email, resetToken);
  return { resetToken };
}

export async function resetPassword(token: string, newPassword: string) {
  if (!token || !newPassword) throw new Error("Token and new password are required");
  if (!validatePassword(newPassword))
    throw new Error("Password must be at least 8 characters");

  const tokenDoc = await getTokenByValue(token);
  if (!tokenDoc || tokenDoc.type !== "password_reset")
    throw new Error("Invalid or expired token");
  if (tokenDoc.expires_at < new Date()) {
    await deleteToken(tokenDoc._id.toString());
    throw new Error("Token has expired");
  }

  const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await updateUser(tokenDoc.user_id.toString(), { password_hash });
  await deleteToken(tokenDoc._id.toString());
}

export async function refreshAccessToken(refreshToken: string) {
  if (!refreshToken) throw new Error("Refresh token is required");

  const tokenDoc = await getTokenByValue(refreshToken);
  if (!tokenDoc || tokenDoc.type !== "refresh")
    throw new Error("Invalid refresh token");
  if (tokenDoc.expires_at < new Date()) {
    await deleteToken(tokenDoc._id.toString());
    throw new Error("Refresh token expired");
  }

  let payload: { userId: string };
  try {
    payload = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as {
      userId: string;
    };
  } catch {
    throw new Error("Invalid refresh token");
  }

  const accessToken = jwt.sign(
    { userId: payload.userId },
    config.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

  return { accessToken };
}
