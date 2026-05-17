"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ProfilePreview } from "@/components/ProfilePreview";
import { OnboardingNav } from "./OnboardingNav";

const FEATURES = [
  "Your unique kloot.io/username link",
  "Unlimited links & content blocks",
  "Instagram auto-sync",
  "4 customizable themes",
  "Mobile-optimized creator page",
  "Analytics & link insights",
  "Priority support",
];

function PreviewPanel({
  analytics,
  appUsername,
}: {
  analytics: Record<string, any> | null;
  appUsername?: string;
}) {
  const ig = analytics ?? {};
  const urlSlug = appUsername ?? "yourhandle";

  const engagementRate =
    ig.followers_count && Array.isArray(ig.posts) && ig.posts.length
      ? +(
          (((ig.total_likes ?? 0) + (ig.total_comments ?? 0)) /
            (ig.followers_count * ig.posts.length)) *
          100
        ).toFixed(1)
      : null;

  const stats = {
    followers: ig.followers_count ?? null,
    avgViews: ig.impressions_30d || null,
    engagement: engagementRate,
    avgReach: ig.reach_30d || null,
    growth: ig.follower_gain_30d || null,
  };

  const insights = {
    gender_age: Array.isArray(ig.gender_age) ? ig.gender_age : [],
    top_countries: Array.isArray(ig.top_countries) ? ig.top_countries : [],
    top_cities: Array.isArray(ig.top_cities) ? ig.top_cities : [],
  };

  const posts = Array.isArray(ig.posts) ? ig.posts : [];

  return (
    <div className="flex flex-col h-full">
      <p className="text-sm text-gray-400 text-center mb-4 shrink-0">
        Live preview of your page
      </p>
      <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="h-full overflow-y-auto p-6">
          <ProfilePreview
            name={ig.name}
            handle={ig.username ?? urlSlug}
            tagline={ig.biography}
            profilePic={ig.profile_pic}
            stats={stats}
            insights={insights}
            posts={posts}
          />
        </div>
      </div>
    </div>
  );
}

export function ActivateStep({ onNext }: { onNext: () => void }) {
  const [analytics, setAnalytics] = useState<Record<string, any> | null>(null);
  const [appUsername, setAppUsername] = useState<string | undefined>(undefined);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    axios
      .get("/api/analytics")
      .then((res) => {
        if (res.data?.data?.data) setAnalytics(res.data.data.data);
        if (res.data?.username) setAppUsername(res.data.username);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#FAF7F2] flex flex-col lg:h-[100dvh] lg:overflow-hidden">
      <OnboardingNav currentStep={4} />

      {/* Mobile preview modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-[#FAF7F2] flex flex-col lg:hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
            <p className="text-sm font-semibold text-gray-700">Live preview</p>
            <button
              onClick={() => setShowPreview(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 1L13 13M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <ProfilePreview
              name={analytics?.name}
              handle={analytics?.username ?? appUsername}
              tagline={analytics?.biography}
              profilePic={analytics?.profile_pic}
              stats={{
                followers: analytics?.followers_count ?? null,
                avgViews: analytics?.impressions_30d || null,
                engagement: null,
                avgReach: analytics?.reach_30d || null,
                growth: analytics?.follower_gain_30d || null,
              }}
              insights={{
                gender_age: Array.isArray(analytics?.gender_age)
                  ? analytics.gender_age
                  : [],
                top_countries: Array.isArray(analytics?.top_countries)
                  ? analytics.top_countries
                  : [],
                top_cities: Array.isArray(analytics?.top_cities)
                  ? analytics.top_cities
                  : [],
              }}
              posts={Array.isArray(analytics?.posts) ? analytics.posts : []}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row gap-8 px-6 lg:px-12 py-8 lg:overflow-hidden max-w-6xl mx-auto w-full">
        {/* Left — pricing */}
        <div className="w-full lg:w-[420px] shrink-0 flex flex-col">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            Activate your kloot link
          </h1>
          <p className="text-gray-400 text-base mb-6">
            One simple plan. Cancel anytime.
          </p>

          <div className="bg-white rounded-2xl border border-gray-200 p-7 flex flex-col gap-6">
            {/* Price */}
            <div>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="text-5xl font-black text-gray-900">$9</span>
                <span className="text-lg text-gray-400 mb-2">/month</span>
              </div>
              <p className="text-sm text-gray-400">
                Billed monthly · 7-day free trial
              </p>
            </div>

            {/* Features */}
            <ul className="space-y-3">
              {FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 text-sm text-gray-700"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="shrink-0"
                  >
                    <path
                      d="M3 8L6.5 11.5L13 5"
                      stroke="#E8714A"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            {/* Mobile: preview button */}
            <button
              onClick={() => setShowPreview(true)}
              className="lg:hidden w-full border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Preview my page
            </button>

            <div>
              <button
                onClick={onNext}
                className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-4 rounded-xl text-base transition-colors"
              >
                Pay $9 &amp; activate
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">
                Secure checkout. Money-back guarantee.
              </p>
            </div>
          </div>
        </div>

        {/* Right — live preview (desktop only) */}
        <div className="hidden lg:flex flex-1 min-w-0 flex-col overflow-hidden">
          <PreviewPanel analytics={analytics} appUsername={appUsername} />
        </div>
      </div>
    </div>
  );
}
