import { THEMES } from "@/constants/themes";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ themes: THEMES });
}
