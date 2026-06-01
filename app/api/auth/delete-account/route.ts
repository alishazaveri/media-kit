import { connectDB } from "@/db";
import Customization from "@/db/models/customization";
import Insight from "@/db/models/insight";
import SocialChannel from "@/db/models/social_channel";
import Subscription from "@/db/models/subscription";
import Token from "@/db/models/token";
import UserData from "@/db/models/user_data";
import User from "@/db/models/user";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.userId;
    await connectDB();

    await Promise.all([
      SocialChannel.deleteMany({ user_id: userId }),
      Insight.deleteMany({ user_id: userId }),
      UserData.deleteMany({ user_id: userId }),
      Customization.deleteMany({ user_id: userId }),
      Token.deleteMany({ user_id: userId }),
      Subscription.deleteMany({ user_id: userId }),
    ]);

    await User.findByIdAndDelete(userId);

    const res = NextResponse.json({ success: true });
    res.cookies.delete("access_token");
    res.cookies.delete("refresh_token");
    return res;
  } catch (err) {
    console.error("DELETE /api/auth/delete-account:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
