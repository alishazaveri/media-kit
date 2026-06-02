import { getSession } from "@/lib/session";
import { publishUserData } from "@/services/user_data.service";
import { NextResponse } from "next/server";

/** POST /api/analytics/publish — copies draft profile data to the published entry. */
export async function POST() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const published = await publishUserData(session.userId, "profile");
    return NextResponse.json({ data: published });
  } catch (err) {
    console.error("POST /api/analytics/publish:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
