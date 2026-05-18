import { getSession } from "@/lib/session";
import { publishCustomization } from "@/db/customization.db";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const customization = await publishCustomization(session.userId);
    return NextResponse.json({ customization });
  } catch (err) {
    console.error("POST /api/customization/publish:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
