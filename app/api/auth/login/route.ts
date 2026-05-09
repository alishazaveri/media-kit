import { loginUser } from "@/services/user.service";
import { getUserInstagramChannel } from "@/services/social_channel.service";
import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_MAX_AGE = 15 * 60;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const { accessToken, refreshToken, user } = await loginUser(email, password);

    // Determine where in onboarding the user is so the client can redirect correctly
    const igAccount = await getUserInstagramChannel(user.id);
    const onboardingStatus = {
      hasInstagram: !!igAccount,
      hasPlan: !!user.planId, // extend when billing is wired
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
