import { registerUser, loginUser } from "@/services/user.service";
import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_MAX_AGE = 15 * 60;       // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export async function POST(req: NextRequest) {
  try {
    const { email, username, password } = await req.json();

    await registerUser("", email, username, password);

    const { accessToken, refreshToken, user } = await loginUser(email, password);

    const res = NextResponse.json(
      { userId: user.id, user },
      { status: 201 }
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
