import { getSession } from "@/lib/session";
import { getUserById, updateUser } from "@/db/user.db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword)
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });

    if (newPassword.length < 8)
      return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });

    const user = await getUserById(session.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, (user as any).password_hash);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await updateUser(session.userId, { password_hash } as any);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/auth/change-password:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
