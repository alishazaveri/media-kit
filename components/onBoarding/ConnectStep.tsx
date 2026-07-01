"use client";

import { useState } from "react";
import axios from "axios";
import { OnboardingNav } from "./OnboardingNav";
import Button from "@/components/reusable/Button";

const BENEFITS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
    title: "Posts & reels synced",
    desc: "Your latest content is auto-selected for your page",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
    title: "Profile filled in for you",
    desc: "Photo, bio and handle pulled straight from Instagram",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    title: "Live stats on your page",
    desc: "Followers, engagement & reach shown to brands",
  },
];

export function ConnectStep({
  userId,
  externalError = "",
}: {
  userId: string;
  externalError?: string;
}) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    setConnecting(true);
    setError("");
    try {
      const res = await axios.get(
        `/api/auth/instagram/connect?userId=${userId}`,
      );
      const url = res?.data?.url;
      if (url) {
        window.location.href = url;
        return;
      }
      throw new Error("No redirect URL returned");
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? "Failed to connect Instagram")
        : "Failed to connect Instagram";
      setError(msg);
      setConnecting(false);
    }
  };

  if (connecting) {
    return (
      <div className="min-h-[100dvh] bg-[#FAF7F2] flex flex-col">
        <OnboardingNav currentStep={3} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <div className="relative w-14 h-14 mb-6">
              <div
                className="absolute inset-0 rounded-full animate-spin"
                style={{
                  background:
                    "conic-gradient(from 0deg, #833AB4, #FD1D1D, #F56040, transparent 70%)",
                }}
              />
              <div className="absolute inset-1 bg-[#FAF7F2] rounded-full" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Connecting…
            </h2>
            <p className="text-sm text-gray-400">
              You&apos;ll be redirected to Instagram.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAF7F2] flex flex-col">
      <OnboardingNav currentStep={3} />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm flex flex-col items-center">

          {/* Instagram gradient icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-md"
            style={{
              background: "linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F56040 100%)",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none" />
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-2">
            Connect Instagram
          </h1>
          <p className="text-gray-500 text-center text-base leading-relaxed mb-8 max-w-xs">
            Your kloot page builds itself — we sync your content and stats automatically.
          </p>

          {/* Benefit cards */}
          <div className="w-full bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 mb-6 shadow-sm">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex items-start gap-3.5 px-4 py-3.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  {b.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{b.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Error */}
          {(externalError || error) && (
            <div className="w-full mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 text-center">
              {externalError || error}
            </div>
          )}

          {/* CTA */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleConnect}
            fullWidth
            className="rounded-2xl"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none" />
              </svg>
            }
          >
            Connect Instagram
          </Button>

          {/* Trust note */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <p className="text-sm text-gray-400">
              We never post or message on your behalf
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
