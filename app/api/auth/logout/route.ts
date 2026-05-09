import { logoutUser } from "@/services/user.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("refresh_token")?.value;
    if (refreshToken) await logoutUser(refreshToken);

    const res = NextResponse.json({ message: "Logged out" });
    res.cookies.delete("access_token");
    res.cookies.delete("refresh_token");
    return res;
  } catch {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
