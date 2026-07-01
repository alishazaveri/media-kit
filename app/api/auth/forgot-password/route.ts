import { forgotPassword } from "@/services/user.service";
import { checkRateLimit } from "@/lib/rateLimit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
      ?? req.headers.get("x-real-ip")
      ?? "unknown";

    if (!checkRateLimit(`forgot-password:${ip}`, 3, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in 15 minutes." },
        { status: 429 },
      );
    }

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    await forgotPassword(email);

    // Always return success to avoid revealing whether the email exists
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/auth/forgot-password:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
