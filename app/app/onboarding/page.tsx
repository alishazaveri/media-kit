"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AppLogo } from "@/components/AppLogo";
import { ProfilePreview } from "@/components/ProfilePreview";

/* ─── Types ─── */
type Step = "signup" | "connect" | "activate";
type ConnectState = "idle" | "syncing" | "connected";

/* ─── Helpers ─── */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ─── Step badge ─── */
function StepBadge({ step }: { step: 2 | 3 }) {
  return (
    <div className="inline-flex items-center gap-2 border border-primary/30 rounded-full px-3 py-1.5 mb-6">
      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
      <span className="text-xs font-semibold text-primary tracking-wide uppercase">
        Step {step} of 3
      </span>
    </div>
  );
}

/* ─── Checkmark icon ─── */
function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-sm text-gray-700">
      <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M2 5L4 7L8 3"
            stroke="#0D9488"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {text}
    </li>
  );
}

/* ─── Pricing feature row ─── */
function FeatureCheck({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-1.5">
      <svg
        width="13"
        height="13"
        viewBox="0 0 13 13"
        fill="none"
        className="shrink-0 mt-0.5"
      >
        <path
          d="M2.5 6.5L5 9L10.5 3.5"
          stroke="#0D9488"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-xs text-gray-600 leading-snug">{text}</span>
    </div>
  );
}

/* ──────────────────────────────────────────────
   STEP 1 — Signup
────────────────────────────────────────────── */
function SignupStep({ onNext }: { onNext: () => void }) {
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: call signup API
    await delay(400);
    onNext();
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-8">
      <div className="mb-8">
        <AppLogo size="md" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Create your account
      </h1>
      <p className="text-gray-400 text-sm mb-7">
        Start building your creator media kit in minutes.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder:text-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Username
          </label>
          <input
            type="text"
            placeholder="sarahjcreates"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder:text-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <input
            type="password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder:text-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400 font-medium">OR</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <a href="/login" className="text-primary font-semibold hover:underline">
          Log in
        </a>
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────
   STEP 2 — Connect Instagram (idle → syncing → connected)
────────────────────────────────────────────── */
const SYNC_STEPS = [
  "Reading profile…",
  "Calculating engagement…",
  "Fetching demographics…",
];

function ConnectStep({ onNext }: { onNext: () => void }) {
  const [state, setState] = useState<ConnectState>("idle");
  const [syncIndex, setSyncIndex] = useState(0);

  const handleConnect = async () => {
    setState("syncing");
    try {
      const res = await axios.get("/api/instagram/auth/connect");
      const url = res?.data?.url;
      if (url) {
        window.location.href = url;
        return;
      }
    } catch {
      // fall through to demo flow
    }

    // Demo: animate through sync steps then show connected
    for (let i = 1; i < SYNC_STEPS.length; i++) {
      await delay(1300);
      setSyncIndex(i);
    }
    await delay(1300);
    setState("connected");
    await delay(2200);
    onNext();
  };

  /* Connected validation */
  if (state === "connected") {
    return (
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm p-12 text-center">
        <div className="flex justify-center mb-8">
          <AppLogo size="lg" />
        </div>
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                d="M9 18L15 24L27 12"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Instagram connected!
        </h2>
        <p className="text-gray-400 text-sm">
          Hi @sarahjcreates — 485K followers synced.
        </p>
      </div>
    );
  }

  /* Syncing state */
  if (state === "syncing") {
    return (
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-10 text-center">
        <div className="flex justify-center mb-8">
          <AppLogo size="lg" />
        </div>
        <div className="flex justify-center mb-8">
          <div className="relative w-16 h-16">
            <div
              className="absolute inset-0 rounded-full animate-spin-slow"
              style={{
                background:
                  "conic-gradient(from 0deg, #7C3AED, #EC4899, #F59E0B, transparent 75%)",
              }}
            />
            <div className="absolute inset-1 bg-white rounded-full" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Syncing Instagram…
        </h2>
        <p className="text-gray-400 text-sm mb-8">
          Pulling real-time stats from your account.
        </p>
        <div className="space-y-2 text-left">
          {SYNC_STEPS.map((s, i) => (
            <div
              key={s}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                i === syncIndex ? "bg-gray-50 text-gray-700" : "text-gray-300"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${i === syncIndex ? "bg-primary" : "bg-gray-200"}`}
              />
              {s}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* Idle — connect button */
  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-8">
      <div className="mb-6">
        <AppLogo size="lg" />
      </div>
      <StepBadge step={2} />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Connect Instagram
      </h1>
      <p className="text-gray-400 text-sm leading-relaxed mb-6">
        We&apos;ll auto-pull your stats and audience insights so brands see the
        real you.
      </p>
      <div className="bg-gray-50 rounded-2xl p-5 mb-6">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
          What we sync
        </p>
        <ul className="space-y-3">
          {[
            "Followers, engagement & reach",
            "Audience age, gender & countries",
            "Top posts & content breakdown",
            "Posting frequency",
          ].map((item) => (
            <CheckItem key={item} text={item} />
          ))}
        </ul>
      </div>
      <button
        onClick={handleConnect}
        className="w-full flex items-center justify-center gap-3 text-white font-semibold py-3.5 rounded-2xl"
        style={{
          background:
            "linear-gradient(90deg, #833AB4 0%, #FD1D1D 50%, #F56040 100%)",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.5" fill="white" />
        </svg>
        Connect with Instagram
      </button>
      <p className="text-center text-xs text-gray-400 mt-4">
        We never post on your behalf. Read-only access.
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────
   STEP 3 — Activate (pricing + live preview)
────────────────────────────────────────────── */
const PLAN_FEATURES = [
  ["Public profile with custom link", "Auto-pulled Instagram stats"],
  ["Audience demographics & analytics", "Content showcase & top posts"],
  ["Unlimited package & rate cards", "Past collaboration portfolio"],
  ["Brand offer inbox", "Always live, edit anytime"],
];

/* Preview panel — shared between desktop inline and mobile modal */
function PreviewPanel({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden ${className}`}
    >
      {/* Fixed browser chrome header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-400">
          mycreatorprofile.com/sarahjcreates
        </div>
      </div>
      {/* Only this inner area scrolls */}
      <div className="flex-1 overflow-y-auto p-6">
        <ProfilePreview />
      </div>
    </div>
  );
}

function ActivateStep({ onNext }: { onNext: () => void }) {
  const [billing, setBilling] = useState<"annual" | "monthly">("annual");
  const [showPreview, setShowPreview] = useState(false);

  const price =
    billing === "annual"
      ? {
          display: "$6.58",
          sub: "/mo",
          note: "Billed $79/year",
          btn: "Pay $79/year",
        }
      : {
          display: "$9",
          sub: "/mo",
          note: "Billed monthly",
          btn: "Pay $9/month",
        };

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full">
      {/* Mobile full-screen preview modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col lg:hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shrink-0">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase">
              Live Preview
            </p>
            <button
              onClick={() => setShowPreview(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
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
            <PreviewPanel />
          </div>
        </div>
      )}

      {/* Layout — fills flex-1 height given by the root page */}
      <div className="w-full flex-1 flex flex-col lg:flex-row gap-5 overflow-hidden">
        {/* Pricing card — natural height, does not stretch or scroll */}
        <div className="w-full max-w-[420px] mx-auto lg:mx-0 lg:min-w-[376px] lg:w-[376px] shrink-0 bg-white rounded-3xl shadow-sm p-7 flex flex-col self-start">
          <div className="mb-5">
            <AppLogo size="sm" />
          </div>
          <StepBadge step={3} />
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Activate your profile
          </h2>
          <p className="text-gray-400 text-xs mb-6">
            One subscription. Edit anytime. Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6 text-xs font-medium">
            <button
              onClick={() => setBilling("monthly")}
              className={`flex-1 py-2 rounded-lg transition-colors ${billing === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${billing === "annual" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              Annual
              <span className="bg-green-100 text-green-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                Save 27%
              </span>
            </button>
          </div>

          {/* Plan details */}
          <div className="border border-primary/20 rounded-2xl p-5 mb-5">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
              Creator Pro
            </p>
            <div className="flex items-end gap-1 mb-0.5">
              <span className="text-3xl font-black text-gray-900">
                {price.display}
              </span>
              <span className="text-sm text-gray-400 mb-1">{price.sub}</span>
            </div>
            <p className="text-xs text-gray-400 mb-5">{price.note}</p>
            <div className="space-y-2">
              {PLAN_FEATURES.map(([left, right]) => (
                <div key={left} className="grid grid-cols-2 gap-2">
                  <FeatureCheck text={left} />
                  <FeatureCheck text={right} />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: preview button above pay */}
          <button
            onClick={() => setShowPreview(true)}
            className="lg:hidden w-full mb-3 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <circle
                cx="8"
                cy="8"
                r="2"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
            Preview my page
          </button>

          <button
            onClick={onNext}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            🔒 {price.btn}
          </button>
          <p className="text-center text-[10px] text-gray-400 mt-3">
            256-bit SSL · Cancel anytime · No credit card form (demo)
          </p>
        </div>

        {/* Desktop: live preview — fills remaining width and height, only this scrolls */}
        <div className="hidden lg:flex flex-1 min-w-0 flex-col gap-2 overflow-hidden">
          <p className="text-xs font-semibold text-primary tracking-widest uppercase text-center shrink-0">
            Live Preview of Your Page
          </p>
          {/* flex-1 + overflow-hidden lets PreviewPanel fill height and scroll internally */}
          <div className="flex-1 overflow-hidden">
            <PreviewPanel className="h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Root onboarding page
────────────────────────────────────────────── */
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("signup");

  const isActivate = step === "activate";

  return (
    <div
      className={`bg-gray-100 p-4 ${
        isActivate
          ? "h-screen overflow-hidden flex flex-col" // page locked, only preview scrolls
          : "min-h-screen flex items-center justify-center" // centred card for signup / connect
      }`}
    >
      {step === "signup" && <SignupStep onNext={() => setStep("connect")} />}
      {step === "connect" && <ConnectStep onNext={() => setStep("activate")} />}
      {step === "activate" && (
        <ActivateStep onNext={() => router.push("/dashboard")} />
      )}
    </div>
  );
}
