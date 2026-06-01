import { getSession } from "@/lib/session";
import { disconnectChannel, getUserInstagramChannel } from "@/services/social_channel.service";
import { NextResponse } from "next/server";

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const channel = await getUserInstagramChannel(session.userId);
    if (!channel)
      return NextResponse.json({ error: "No Instagram account connected" }, { status: 404 });

    await disconnectChannel(channel._id.toString(), session.userId, "instagram");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/auth/instagram/disconnect:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
