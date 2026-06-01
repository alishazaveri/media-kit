import config from "@/lib/config";
import instagramConnect from "@/lib/instagramConnect";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Session takes precedence over query param (handles post-login redirects)
    const session = await getSession();
    const userId = session?.userId ?? req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const returnTo = req.nextUrl.searchParams.get("returnTo") ?? "";
    const statePayload = Buffer.from(JSON.stringify({ uid: userId, ret: returnTo })).toString("base64url");

    const params = new URLSearchParams({
      client_id: config.APP_ID,
      redirect_uri: config.REDIRECT_URL,
      scope: instagramConnect.authScope,
      response_type: "code",
      state: statePayload,
    });
    return NextResponse.json({
      url: `https://api.instagram.com/oauth/authorize?${params.toString()}`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
