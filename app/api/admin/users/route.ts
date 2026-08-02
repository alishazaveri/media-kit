import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { connectDB } from "@/db";
import User from "@/db/models/user";
import SocialChannel from "@/db/models/social_channel";
import Subscription from "@/db/models/subscription";
import UserData from "@/db/models/user_data";
import { resolveSubscriptionState, computeStage } from "@/lib/user-stage";

export type { JourneyStage, SubscriptionSlotStage } from "@/lib/user-stage";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page    = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit   = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") ?? "25")));
  const search  = searchParams.get("search")?.trim() ?? "";
  const stage   = searchParams.get("stage") ?? "all";
  const sort    = searchParams.get("sort") ?? "createdAt";
  const sortDir = searchParams.get("sortDir") === "asc" ? 1 : -1;
  const skip    = (page - 1) * limit;

  await connectDB();

  const userQuery: Record<string, unknown> = {};
  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    userQuery.$or = [{ name: regex }, { email: regex }, { username: regex }];
  }

  const users = await User.find(userQuery).lean();
  const userIds = users.map((u) => u._id);

  const [socialChannels, subscriptions, userDataRecords] = await Promise.all([
    SocialChannel.find({ user_id: { $in: userIds }, platform: "instagram" }).lean(),
    Subscription.find({ user_id: { $in: userIds } }).lean(),
    UserData.find({ user_id: { $in: userIds }, platform: "profile" }).lean(),
  ]);

  const socialMap = new Map(socialChannels.map((s) => [s.user_id.toString(), s]));
  const userDataMap = new Map(userDataRecords.map((d) => [d.user_id.toString(), d]));
  const subscriptionMap = new Map<string, typeof subscriptions>();
  for (const sub of subscriptions) {
    const uid = sub.user_id.toString();
    if (!subscriptionMap.has(uid)) subscriptionMap.set(uid, []);
    subscriptionMap.get(uid)!.push(sub);
  }

  const all = users.map((u) => {
    const uid = (u._id as { toString(): string }).toString();
    const social = socialMap.get(uid) ?? null;
    const userSubs = subscriptionMap.get(uid) ?? [];
    const userData = userDataMap.get(uid) ?? null;
    const { subscriptionSlotStage, trialExpired } = resolveSubscriptionState(
      userSubs,
      u.trial_ends_at,
    );
    return {
      id: uid,
      name: u.name,
      email: u.email,
      username: u.username,
      hasTrial: !!u.trial_ends_at,
      followers: social?.followers ?? null,
      handle: social?.platform_username ?? null,
      subscriptionSlotStage,
      trialExpired,
      stage: computeStage(u, social, userSubs, userData),
      createdAt: u.created_at,
    };
  });

  all.sort((a, b) => {
    if (sort === "followers") {
      // nulls (no Instagram) always at the bottom regardless of direction
      const af = a.followers ?? (sortDir === 1 ? Infinity : -Infinity);
      const bf = b.followers ?? (sortDir === 1 ? Infinity : -Infinity);
      return sortDir === 1 ? af - bf : bf - af;
    }
    const ad = new Date(a.createdAt as Date).getTime();
    const bd = new Date(b.createdAt as Date).getTime();
    return sortDir === 1 ? ad - bd : bd - ad;
  });

  const filtered = stage === "all" ? all : all.filter((u) => u.stage === stage);
  const total = filtered.length;
  const data = filtered.slice(skip, skip + limit);

  return NextResponse.json({
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  });
}
