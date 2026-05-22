import { NextRequest, NextResponse } from "next/server";
import isLinkActive from "@/lib/isLinkActive";

export async function GET(req: NextRequest) {
  console.log("Received request to check active link status");
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId query parameter" }, { status: 400 });
    }

    const active = await isLinkActive(userId);
    return NextResponse.json({ active });
  } catch (err: any) {
    const message = err?.message || "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
