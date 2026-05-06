import config from "@/lib/config";
import instagramConnect from "@/lib/instagramConnect";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const params = new URLSearchParams({
      client_id: config.APP_ID,
      redirect_uri: config.REDIRECT_URL,
      scope: instagramConnect.authScope,
      response_type: "code",
      state: userId,
    });
    return NextResponse.json({
      url: `https://api.instagram.com/oauth/authorize?${params.toString()}`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
