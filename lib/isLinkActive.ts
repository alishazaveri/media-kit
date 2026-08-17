import { getUserById } from "@/db/user.db";

export default async function isLinkActive(userId?: string) {
  if (!userId) return false;
  try {
    const user = await getUserById(userId);
    return !!user;
  } catch {
    return false;
  }
}
