import { registerUser, loginUser } from "@/services/user.service";
import { getTrialLinkByToken, incrementTrialLinkUses } from "@/db/trial_link.db";
import { updateUser } from "@/db/user.db";
import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_MAX_AGE = 15 * 60;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

export async function POST(req: NextRequest) {
  try {
    const { email, username, password, trial_token } = await req.json();

    const { user } = await registerUser("", email, username, password);
    const userId = user._id.toString();

    // Apply trial if a valid token was provided
    if (trial_token) {
      const link = await getTrialLinkByToken(trial_token);
      const now = new Date();
      const isValid =
        link &&
        link.uses_count < link.max_uses &&
        (!link.expires_at || link.expires_at > now);

      if (isValid) {
        const trialEndsAt = new Date(now.getTime() + link.duration_days * 24 * 60 * 60 * 1000);
        await Promise.all([
          updateUser(userId, { trial_ends_at: trialEndsAt } as Parameters<typeof updateUser>[1]),
          incrementTrialLinkUses(trial_token),
        ]);
      }
    }

    const { accessToken, refreshToken, user: loggedInUser } = await loginUser(email, password);

    const res = NextResponse.json(
      { userId: loggedInUser.id, user: loggedInUser },
      { status: 201 },
    );

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
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
