import config from "@/lib/config";
import instagramConnect from "@/lib/instagramConnect";
import { connectInstagramChannel } from "@/services/social_channel.service";
import { fetchAndSaveInstagramAnalytics } from "@/services/instagram.service";
import isLinkActive from "@/lib/isLinkActive";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const rawState = request.nextUrl.searchParams.get("state") ?? "";

    let userId: string | null = null;
    let returnTo = "";
    try {
      const parsed = JSON.parse(Buffer.from(rawState, "base64url").toString());
      userId = parsed.uid ?? null;
      returnTo = parsed.ret ?? "";
    } catch {
      // legacy state: plain userId string
      userId = rawState || null;
    }

    if (!code || !userId) {
      return NextResponse.redirect(
        `${config.PUBLIC_URL}/?error=Missing+parameters`,
      );
    }

    // Step 1: Short-lived token
    const shortRes = await axios.post(
      "https://api.instagram.com/oauth/access_token",
      new URLSearchParams({
        client_id: config.APP_ID,
        client_secret: config.APP_SECRET,
        grant_type: "authorization_code",
        redirect_uri: config.REDIRECT_URL,
        code,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        transformResponse: (data) => data,
      },
    );

    const raw = shortRes.data;
    const tokenMatch = raw.match(/"access_token"\s*:\s*"([^"]+)"/);
    const igUserIdMatch = raw.match(/"user_id"\s*:\s*(\d+)/);

    const shortToken = tokenMatch?.[1];
    const igUserId = igUserIdMatch?.[1];

    // Step 2: Exchange for long-lived token
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

    // Step 3: Fetch profile
    const profile = await axios.get(
      `https://graph.instagram.com/v21.0/${igUserId}`,
      {
        params: {
          fields: instagramConnect.profileFields,
          access_token: longToken,
        },
      },
    );

    if (profile.data.error) {
      return NextResponse.redirect(
        `${config.PUBLIC_URL}/?error=${encodeURIComponent(profile.data.error.message)}`,
      );
    }

    // Step 4: Save account + token
    const account = await connectInstagramChannel(
      userId,
      profile.data,
      longToken,
    );

    // Step 5: Fetch Instagram analytics and save as draft
    console.log(
      "[Callback] Starting analytics fetch for account:",
      account._id.toString(),
    );
    try {
      await fetchAndSaveInstagramAnalytics(userId, account._id.toString());
      console.log(
        "[Callback] Analytics fetch succeeded, redirecting to onboarding.",
      );
    } catch (analyticsErr) {
      console.error("[Callback] Analytics fetch failed:", analyticsErr);
      return NextResponse.redirect(
        `${config.PUBLIC_URL}/onboarding?error=analytics_failed`,
      );
    }

    let successRedirect: string;
    if (returnTo) {
      successRedirect = `${config.PUBLIC_URL}${returnTo}`;
    } else {
      const hasPlan = await isLinkActive(userId).catch(() => false);
      successRedirect = hasPlan
        ? `${config.PUBLIC_URL}/dashboard`
        : `${config.PUBLIC_URL}/onboarding?connected=true`;
    }
    return NextResponse.redirect(successRedirect);
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
