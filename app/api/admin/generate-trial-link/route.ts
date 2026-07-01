import { NextRequest, NextResponse } from "next/server";
import { createTrialLink } from "@/db/trial_link.db";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { duration_days, max_uses, label, expires_at } = body;

  if (!duration_days || !max_uses) {
    return NextResponse.json(
      { error: "duration_days and max_uses are required" },
      { status: 400 },
    );
  }

  const link = await createTrialLink({
    duration_days: Number(duration_days),
    max_uses: Number(max_uses),
    label: label ?? "",
    expires_at: expires_at ? new Date(expires_at) : undefined,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return NextResponse.json({
    token: link.token,
    url: `${baseUrl}/app/onboarding?trial=${link.token}`,
    duration_days: link.duration_days,
    max_uses: link.max_uses,
    label: link.label,
    expires_at: link.expires_at ?? null,
  });
}
