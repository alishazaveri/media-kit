"use client";

import { useState } from "react";

interface ReferralModalProps {
  username: string;
  onClose: () => void;
}

export function ReferralModal({ username, onClose }: ReferralModalProps) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://kloot.io";
  const referralUrl = `${origin}?ref=${username}`;
  const referralDisplay = referralUrl.replace(/^https?:\/\//, "");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralDisplay);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = referralDisplay;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy"); // eslint-disable-line @typescript-eslint/no-deprecated
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#FAF7F2] rounded-3xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        {/* Header */}
        <div>
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900">Get 3 months of Pro free</h2>
          <p className="text-sm text-gray-500 mt-1">
            Your profile is live! Refer a friend and get <span className="font-semibold text-gray-700">3 months of Pro free</span>. When they sign up through your link and publish their profile.
          </p>
        </div>

        {/* Referral link */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your referral link</p>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
            <span className="flex-1 text-sm text-gray-600 truncate">{referralDisplay}</span>
            <button
              onClick={handleCopy}
              className="shrink-0 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-gray-50 rounded-2xl px-4 py-3 flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">How it works</p>
          <ol className="flex flex-col gap-1.5">
            {[
              "Share your link with a fellow creator",
              "They sign up and publish their Kloot profile",
              "You get 3 months of Pro — themes, dark mode & contact button",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="shrink-0 w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <button
          onClick={onClose}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors text-center cursor-pointer"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
