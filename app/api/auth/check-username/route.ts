import { getUserByUsername } from "@/db/user.db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username")?.trim().toLowerCase();
  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }
  if (!/^[a-z0-9_]{1,30}$/.test(username)) {
    return NextResponse.json({ available: false, error: "Only letters, numbers, and underscores allowed (max 30 chars)" }, { status: 200 });
  }
  const existing = await getUserByUsername(username);
  return NextResponse.json({ available: !existing });
}
