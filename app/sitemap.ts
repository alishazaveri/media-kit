import type { MetadataRoute } from "next";
import { getAllUsers } from "@/db/user.db";

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
  const users = await getAllUsers();

  const profileUrls: MetadataRoute.Sitemap = (users as {
    username: string;
    updatedAt?: Date;
  }[]).map(user => ({
    url: `${BASE}/${user.username}`,
    lastModified: user.updatedAt ?? new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...STATIC, ...profileUrls];
}
