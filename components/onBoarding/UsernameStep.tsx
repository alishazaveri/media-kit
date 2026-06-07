"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { OnboardingNav } from "./OnboardingNav";

type CheckState = "idle" | "checking" | "available" | "unavailable" | "invalid";

export function UsernameStep({
  prefill,
  onNext,
}: {
  prefill?: string;
  onNext: (username: string) => void;
}) {
  const [username, setUsername] = useState(prefill ?? "");
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prefill && !username) setUsername(prefill);
  }, [prefill]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = username.trim().toLowerCase();
    if (!trimmed) {
      setCheckState("idle");
      setErrorMsg("");
      return;
    }
    if (!/^[a-z0-9_]{1,30}$/.test(trimmed)) {
      setCheckState("invalid");
      setErrorMsg(
        "Only letters, numbers, and underscores allowed (max 30 chars)",
      );
      return;
    }
    setCheckState("checking");
    setErrorMsg("");
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(
          `/api/auth/check-username?username=${encodeURIComponent(trimmed)}`,
        );
        if (res.data.available) {
          setCheckState("available");
          setErrorMsg("");
        } else {
          setCheckState("unavailable");
          setErrorMsg(res.data.error || "That username is already taken");
        }
      } catch {
        setCheckState("idle");
        setErrorMsg("");
      }
    }, 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username]);

  const canProceed = username.trim().length > 0 && checkState === "available";

  return (
    <div className="min-h-[100dvh] bg-[#FAF7F2] flex flex-col">
      <OnboardingNav currentStep={1} />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        {/* Badge */}
        {/* <div className="inline-flex items-center gap-2 bg-[#FFE8E0] text-primary rounded-full px-4 py-2 mb-8 text-sm font-medium">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
          </svg>
          One link for everything you create
        </div> */}

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-3 leading-tight">
          Claim your <span className="text-primary">kloot</span> link
        </h1>
        <p className="text-gray-500 text-center mb-10 text-md">
          Your unique creator URL. Share once, monetize everywhere.
        </p>

        {/* Input */}
        <div className="w-full max-w-md">
          <div
            className={`flex items-center bg-white border rounded-2xl px-5 py-3 gap-3 shadow-sm transition-all ${
              checkState === "available"
                ? "border-primary/40"
                : checkState === "unavailable" || checkState === "invalid"
                  ? "border-red-300"
                  : "border-gray-200"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
            <span className="text-gray-400 text-sm shrink-0 select-none">
              kloot.io/
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="username"
              autoFocus
              autoComplete="off"
              spellCheck={false}
              className="flex-1 min-w-0 text-sm font-medium text-primary placeholder:text-primaryBF outline-none bg-transparent"
            />
            <button
              onClick={() =>
                canProceed && onNext(username.trim().toLowerCase())
              }
              disabled={!canProceed}
              className="shrink-0 bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
            >
              {checkState === "checking" ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                "Claim"
              )}
            </button>
          </div>

          {(checkState === "unavailable" || checkState === "invalid") &&
            errorMsg && (
              <p className="mt-2 text-xs text-red-500 font-medium pl-1">
                {errorMsg}
              </p>
            )}
          {checkState === "available" && (
            <p className="mt-2 text-xs text-primary font-medium pl-1 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6L4.5 8.5L10 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              kloot.io/{username.trim()} is available
            </p>
          )}
        </div>

        {/* Steps */}
        {/* <div className="flex items-center gap-8 sm:gap-12 mt-12 text-sm text-gray-400">
          <span>Connect Instagram</span>
          <span>Custom theme</span>
          <span>Get paid</span>
        </div> */}

        <p className="text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <a
            href="/app/login"
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
