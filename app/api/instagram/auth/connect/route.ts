import config from "@/lib/config";
import instagramConnect from "@/lib/instagram-connect";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const params = new URLSearchParams({
      client_id: config.APP_ID,
      redirect_uri: config.REDIRECT_URL,
      scope: instagramConnect.authScope,
      response_type: "code",
    });
    return NextResponse.json({
      url: `https://api.instagram.com/oauth/authorize?${params.toString()}`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
