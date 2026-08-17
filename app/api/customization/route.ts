import { getSession } from "@/lib/session";
import { getCustomization, upsertCustomization } from "@/db/customization.db";
import { getSubscriptionsByUserId } from "@/db/subscription.db";
import { getUserById } from "@/db/user.db";
import { getThemeByIdentifier } from "@/constants/themes";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [draft, published] = await Promise.all([
      getCustomization(session.userId, "draft"),
      getCustomization(session.userId, "published"),
    ]);
    return NextResponse.json({ draft, published });
  } catch (err) {
    console.error("GET /api/customization:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { theme_identifier, dark_mode } = await req.json();
    if (!theme_identifier) return NextResponse.json({ error: "theme_identifier is required" }, { status: 400 });

    const theme = getThemeByIdentifier(theme_identifier);
    if (theme?.is_premium) {
      const now = new Date();
      const [subs, user] = await Promise.all([
        getSubscriptionsByUserId(session.userId),
        getUserById(session.userId),
      ]);
      const activeSub = (subs as any[]).find(
        (s) => s.current_period_end && new Date(s.current_period_end) > now
      );
      const trialEndsAt = (user as any)?.trial_ends_at ?? null;
      const isFreePlan = !activeSub && !(trialEndsAt && new Date(trialEndsAt) > now);
      if (isFreePlan) {
        return NextResponse.json({ error: "Premium themes require a paid plan" }, { status: 403 });
      }
    }

    const customization = await upsertCustomization(session.userId, "draft", theme_identifier, dark_mode ?? false);
    return NextResponse.json({ customization });
  } catch (err) {
    console.error("PATCH /api/customization:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
