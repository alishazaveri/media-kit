import config from "@/lib/config";
import instagramConnect from "@/lib/instagram-connect";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");

    // Step 1: Short-lived token
    const shortRes = await axios.post(
      "https://api.instagram.com/oauth/access_token",
      new URLSearchParams({
        client_id: config.APP_ID,
        client_secret: config.APP_SECRET,
        grant_type: "authorization_code",
        redirect_uri: config.REDIRECT_URL,
        code: code!,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        transformResponse: (data) => data,
      },
    );

    const raw = shortRes.data;
    const tokenMatch = raw.match(/"access_token"\s*:\s*"([^"]+)"/);
    const userIdMatch = raw.match(/"user_id"\s*:\s*(\d+)/);

    const shortToken = tokenMatch?.[1];
    const user_id = userIdMatch?.[1]; //

    const longRes = await axios.get(
      "https://graph.instagram.com/access_token",
      {
        params: {
          grant_type: "ig_exchange_token",
          client_secret: config.APP_SECRET,
          access_token: shortToken,
        },
      },
    );

    const { access_token: longToken } = longRes.data;

    const profile = await axios.get(
      `https://graph.instagram.com/v21.0/${user_id.toString()}`,
      {
        params: {
          fields: instagramConnect.profileFields,
          access_token: longToken,
        },
      },
    );

    console.log("Profile = ", profile.data);

    if (profile.data.error) {
      return NextResponse.redirect(
        `${config.PUBLIC_URL}/?error=${encodeURIComponent(profile.data.error.message)}`,
      );
    }

    return NextResponse.redirect(`${config.PUBLIC_URL}`);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("Instagram API error:", err.response?.data);
    } else {
      console.error("Callback error:", err);
    }
    return NextResponse.redirect(
      `${config.PUBLIC_URL}/?error=Something+went+wrong`,
    );
  }
}
