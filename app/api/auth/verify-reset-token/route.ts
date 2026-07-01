import { getTokenByValue } from "@/db/token.db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) return NextResponse.json({ valid: false, reason: "invalid" });

    const tokenDoc = await getTokenByValue(token);

    if (!tokenDoc || tokenDoc.type !== "password_reset")
      return NextResponse.json({ valid: false, reason: "invalid" });

    if (tokenDoc.expires_at < new Date())
      return NextResponse.json({ valid: false, reason: "expired" });

    return NextResponse.json({ valid: true });
  } catch (err) {
    console.error("GET /api/auth/verify-reset-token:", err);
    return NextResponse.json({ valid: false, reason: "invalid" });
  }
}
