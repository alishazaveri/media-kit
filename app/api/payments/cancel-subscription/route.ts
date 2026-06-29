import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { cancelActiveSubscriptions } from "@/services/subscription.service";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { excludeSubscriptionId } = body || {};

    await cancelActiveSubscriptions(session.userId, excludeSubscriptionId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const message = err?.error?.description || err?.message || "Failed to cancel subscription";
    console.error("POST /api/payments/cancel-subscription:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
