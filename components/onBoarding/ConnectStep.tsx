"use client";

import { useState } from "react";
import axios from "axios";
import { OnboardingNav } from "./OnboardingNav";
import Button from "@/components/reusable/Button";

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

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        {/* Instagram icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8"
          style={{
            background: "linear-gradient(135deg, #E8714A 0%, #D4603A 100%)",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none" />
          </svg>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-4">
          Connect your Instagram
        </h1>
        <p className="text-gray-500 text-center text-base leading-relaxed mb-10 max-w-sm">
          We&apos;ll pull in your latest posts, profile picture, and bio to
          build your kloot page automatically.
        </p>

        <div className="w-full max-w-md">
          {(externalError || error) && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 text-center">
              {externalError || error}
            </div>
          )}
          <Button variant="primary" size="lg" onClick={handleConnect} fullWidth className="rounded-2xl">
            Connect Instagram
          </Button>
          <p className="text-center text-sm text-gray-400 mt-4">
            We never post or message on your behalf.
          </p>
        </div>
      </div>
    </div>
  );
}
