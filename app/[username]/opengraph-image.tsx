import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";
import { getUserByUsername } from "@/db/user.db";
import { getSocialChannelByPlatform } from "@/db/social_channel.db";
import { getUserData } from "@/db/user_data.db";
import { getInsightBySocialChannel } from "@/db/insight.db";
import { getCustomization } from "@/db/customization.db";
import { getThemeByIdentifier } from "@/constants/themes";
import isLinkActive from "@/lib/isLinkActive";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAME_SIZE = 96;
const HIIM_SIZE = 72;
const PHOTO_W = 340;
const PHOTO_H = Math.round(PHOTO_W * (5 / 4));

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

function getInitial(name: string) {
  return name.trim()[0]?.toUpperCase() ?? "?";
}

let _fontData: ArrayBuffer | null | undefined;

async function loadFont(): Promise<ArrayBuffer | null> {
  if (_fontData !== undefined) return _fontData;

  // 1. Try local WOFF file — validate magic bytes before using
  const localPath = path.join(process.cwd(), "public/fonts/Outfit-Black.woff");
  if (fs.existsSync(localPath)) {
    const buf = fs.readFileSync(localPath);
    const magic = buf.slice(0, 4).toString("ascii");
    if (magic === "wOFF" || magic === "\x00\x01\x00\x00" || magic === "OTTO") {
      _fontData = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
      return _fontData;
    }
  }

  // 2. Fetch WOFF from Google Fonts gstatic (stable versioned URL)
  try {
    const res = await fetch(
      "https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4ZmyO4a0FQ.woff",
      { signal: AbortSignal.timeout(5000) }
    );
    if (res.ok) {
      _fontData = await res.arrayBuffer();
      return _fontData;
    }
  } catch {
    // fall through
  }

  _fontData = null;
  return null;
}

export default async function OGImage(props: { params: Promise<{ username: string }> }) {
  const { username } = await props.params;

  let name       = username;
  let handle     = username;
  let tagline: string | null    = null;
  let location: string | null   = null;
  let followers: string | null  = null;
  let engagement: string | null = null;
  let niches: string[]          = [];
  let avatarSrc: string | null  = null;
  let accentColor = "#ff7350";
  let baseColor   = "#fff4ef";

  const fontData = await loadFont();

  try {
    const user = await getUserByUsername(username);
    const userId = user ? (user as any)._id.toString() : null;
    const active = userId ? await isLinkActive(userId) : false;

    if (user && active && userId) {
      const [channel, userData, customization] = await Promise.all([
        getSocialChannelByPlatform(userId, "instagram"),
        getUserData(userId, "profile"),
        getCustomization(userId, "published"),
      ]);

      const themeId = (customization as any)?.theme_identifier;
      const theme   = themeId ? getThemeByIdentifier(themeId) : undefined;
      if (theme) {
        accentColor = theme.accent_color;
        baseColor   = theme.base_color;
      }

      const published: Record<string, any> = (userData as any)?.published_data ?? {};
      const channelId = channel ? (channel as any)._id.toString() : null;
      const insight   = channelId ? await getInsightBySocialChannel(channelId) : null;
      const ig: Record<string, any> = (insight as any)?.data ?? {};

      name     = published.display_name ?? ig.name ?? username;
      handle   = ig.username ?? username;
      tagline  = published.tagline ?? null;
      location = published.location ?? null;
      niches   = (Array.isArray(published.niche_tags) ? published.niche_tags : []).slice(0, 3);

      if (ig.followers_count) followers = fmt(ig.followers_count);

      const postCount = ig.post_count || (Array.isArray(ig.posts) ? ig.posts.length : 0);
      if (ig.followers_count && postCount) {
        const er =
          (((ig.total_likes ?? 0) + (ig.total_comments ?? 0)) / (ig.followers_count * postCount)) * 100;
        if (er > 0) engagement = `${er.toFixed(1)}%`;
      }

      const picUrl = published.profile_pic ?? (user as { profile_image_url?: string | null }).profile_image_url ?? ig.profile_pic ?? null;
      if (picUrl) {
        try {
          const res = await fetch(picUrl, { signal: AbortSignal.timeout(4000) });
          const buf = await res.arrayBuffer();
          const mime = res.headers.get("content-type") ?? "image/jpeg";
          avatarSrc = `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;
        } catch {
          avatarSrc = null;
        }
      }
    }
  } catch {
    // render fallback
  }

  const parts     = name.trim().split(/\s+/);
  const firstName = parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0];
  const lastName  = parts.length > 1 ? parts[parts.length - 1] : null;

  const outfit = {
    fontFamily: fontData ? "Outfit" : "sans-serif",
    fontWeight: 900,
    letterSpacing: "-0.04em",
    lineHeight: 0.9,
  };

  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, background: baseColor, display: "flex" }}>

        {/* Left: photo with rotated card */}
        <div
          style={{
            width: 460,
            height: 630,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px 40px 60px",
          }}
        >
          <div style={{ position: "relative", width: PHOTO_W, height: PHOTO_H, display: "flex" }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: PHOTO_W,
                height: PHOTO_H,
                background: accentColor,
                borderRadius: 36,
                transform: "rotate(-4deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: PHOTO_W,
                height: PHOTO_H,
                borderRadius: 36,
                overflow: "hidden",
                display: "flex",
              }}
            >
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarSrc}
                  width={PHOTO_W}
                  height={PHOTO_H}
                  style={{ objectFit: "cover", objectPosition: "center", borderRadius: 36 }}
                  alt=""
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 100,
                    fontWeight: 900,
                    color: accentColor,
                  }}
                >
                  {getInitial(name)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "48px 56px 48px 24px",
          }}
        >
          {niches.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
              {niches.map((niche, i) => (
                <div key={niche} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: accentColor, letterSpacing: 2 }}>
                    {niche.toUpperCase()}
                  </div>
                  {i < niches.length - 1 ? (
                    <div style={{ fontSize: 18, color: accentColor, padding: "0 10px" }}>•</div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          <div style={{ ...outfit, fontSize: HIIM_SIZE, color: "rgba(17,24,39,0.3)", marginBottom: 4 }}>
            {"Hi, I'm"}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "baseline" }}>
            <div style={{ ...outfit, fontSize: NAME_SIZE, color: "#111827" }}>{firstName}</div>
            {lastName ? (
              <div style={{ ...outfit, fontSize: NAME_SIZE, color: accentColor }}>{lastName}</div>
            ) : null}
          </div>

          {tagline ? (
            <div style={{ fontSize: 17, color: "#4b5563", fontWeight: 500, marginTop: 14, lineHeight: 1.5 }}>
              {tagline.length > 75 ? tagline.slice(0, 72) + "…" : tagline}
            </div>
          ) : null}

          <div style={{ display: "flex", gap: 8, marginTop: 18, alignItems: "center" }}>
            <div
              style={{
                background: "white",
                border: "1px solid rgba(0,0,0,0.06)",
                borderRadius: 100,
                padding: "6px 12px",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              {handle}
            </div>
            {location ? (
              <div
                style={{
                  background: "white",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: 100,
                  padding: "6px 12px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#374151">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                {location}
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: 32, marginTop: 22 }}>
            {followers ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ ...outfit, fontSize: 34, color: "#111827", letterSpacing: "-0.02em" }}>{followers}</div>
                <div style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Followers</div>
              </div>
            ) : null}
            {engagement ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ ...outfit, fontSize: 34, color: "#111827", letterSpacing: "-0.02em" }}>{engagement}</div>
                <div style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Engagement</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData ? [{ name: "Outfit", data: fontData, weight: 900, style: "normal" as const }] : [],
    }
  );
}
