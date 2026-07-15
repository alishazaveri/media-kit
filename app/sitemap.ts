import type { MetadataRoute } from "next";
import { getAllUsers } from "@/db/user.db";
import { getActiveSubscriptionUserIds } from "@/db/subscription.db";

export const revalidate = 86400; // regenerate once per day

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "https://kloot.io").replace(/\/$/, "");

const STATIC: MetadataRoute.Sitemap = [
  { url: BASE,                   changeFrequency: "monthly", priority: 1.0 },
  { url: `${BASE}/o/pricing`,    changeFrequency: "weekly",  priority: 0.7 },
  { url: `${BASE}/o/about`,      changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE}/o/privacy`,    changeFrequency: "yearly",  priority: 0.3 },
  { url: `${BASE}/o/terms`,      changeFrequency: "yearly",  priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [users, activeSubIds] = await Promise.all([
    getAllUsers(),
    getActiveSubscriptionUserIds(),
  ]);

  const activeSubSet = new Set(activeSubIds);
  const now = new Date();

  const profileUrls: MetadataRoute.Sitemap = (users as {
    _id: { toString(): string };
    username: string;
    trial_ends_at?: Date | null;
    updatedAt?: Date;
  }[])
    .filter(user => {
      if (user.trial_ends_at && new Date(user.trial_ends_at) > now) return true;
      return activeSubSet.has(user._id.toString());
    })
    .map(user => ({
      url: `${BASE}/${user.username}`,
      lastModified: user.updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...STATIC, ...profileUrls];
}
