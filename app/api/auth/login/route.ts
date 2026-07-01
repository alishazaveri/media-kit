import { loginUser } from "@/services/user.service";
import { getUserInstagramChannel } from "@/services/social_channel.service";
import isLinkActive from "@/lib/isLinkActive";
import { checkRateLimit } from "@/lib/rateLimit";
import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_MAX_AGE = 15 * 60;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
      ?? req.headers.get("x-real-ip")
      ?? "unknown";

    if (!checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again in 15 minutes." },
        { status: 429 },
      );
    }

    const { identifier, password } = await req.json();

    const { accessToken, refreshToken, user } = await loginUser(identifier, password);

    // Determine where in onboarding the user is so the client can redirect correctly
    const [igAccount, hasPlan] = await Promise.all([
      getUserInstagramChannel(user.id),
      isLinkActive(user.id),
    ]);
    const onboardingStatus = {
      hasInstagram: !!igAccount,
      hasPlan,
    };

    const res = NextResponse.json({ userId: user.id, user, onboardingStatus });

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    res.cookies.set("access_token", accessToken, { ...cookieOpts, maxAge: ACCESS_TOKEN_MAX_AGE });
    res.cookies.set("refresh_token", refreshToken, { ...cookieOpts, maxAge: REFRESH_TOKEN_MAX_AGE });

    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid credentials";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
