"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { OnboardingNav } from "./OnboardingNav";
import Button from "@/components/reusable/Button";

const FEATURES = [
  "Your unique kloot.io/username link",
  "Unlimited links & content blocks",
  "Instagram auto-sync",
  "4 customizable themes",
  "Mobile-optimized creator page",
  "Analytics & link insights",
  "Priority support",
];

export function ActivateStep({ onNext }: { onNext: () => void }) {
  const [analytics, setAnalytics] = useState<Record<string, any> | null>(null);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [appUsername, setAppUsername] = useState<string | undefined>(undefined);
  const [showPreview, setShowPreview] = useState(false);

  const desktopIframeRef = useRef<HTMLIFrameElement>(null);
  const mobileIframeRef = useRef<HTMLIFrameElement>(null);
  const previewPropsRef = useRef<Record<string, any>>({});

  useEffect(() => {
    axios
      .get("/api/analytics")
      .then((res) => {
        if (res.data?.data?.data) setAnalytics(res.data.data.data);
        if (res.data?.draft) setDraft(res.data.draft);
        if (res.data?.username) setAppUsername(res.data.username);
      })
      .catch(() => {});
  }, []);

  const ig = analytics ?? {};
  const engagementRate =
    ig.followers_count && ig.post_count
      ? +(
          (((ig.total_likes ?? 0) + (ig.total_comments ?? 0)) /
            (ig.followers_count * ig.post_count)) *
          100
        ).toFixed(1)
      : null;

  const previewProps = {
    name: draft.display_name || ig.name || "",
    handle: ig.username ?? appUsername ?? "",
    tagline: draft.tagline || ig.biography || "",
    profilePic: ig.profile_pic ?? null,
    stats: {
      followers: ig.followers_count ?? null,
      avgViews: ig.impressions_30d || null,
      engagement: engagementRate,
      avgReach: ig.reach_30d || null,
      growth: ig.follower_gain_30d || null,
    },
    insights: {
      gender_age: Array.isArray(ig.gender_age) ? ig.gender_age : [],
      top_countries: Array.isArray(ig.top_countries) ? ig.top_countries : [],
      top_cities: Array.isArray(ig.top_cities) ? ig.top_cities : [],
    },
    posts: Array.isArray(draft.posts) ? draft.posts : [],
  };

  previewPropsRef.current = previewProps;

  // Respond to PREVIEW_READY from either iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== "PREVIEW_READY") return;
      const payload = {
        type: "PREVIEW_UPDATE",
        payload: previewPropsRef.current,
      };
      desktopIframeRef.current?.contentWindow?.postMessage(payload, "*");
      mobileIframeRef.current?.contentWindow?.postMessage(payload, "*");
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Push updates when data changes
  useEffect(() => {
    const payload = { type: "PREVIEW_UPDATE", payload: previewProps };
    desktopIframeRef.current?.contentWindow?.postMessage(payload, "*");
    mobileIframeRef.current?.contentWindow?.postMessage(payload, "*");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analytics, draft, appUsername]);

  function sendToIframe(ref: React.RefObject<HTMLIFrameElement | null>) {
    ref.current?.contentWindow?.postMessage(
      { type: "PREVIEW_UPDATE", payload: previewPropsRef.current },
      "*",
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAF7F2] flex flex-col lg:h-[100dvh] lg:overflow-hidden">
      <OnboardingNav currentStep={4} />

      {/* Mobile bottom drawer preview */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${showPreview ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setShowPreview(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute inset-x-0 bottom-0 h-[85%] bg-white rounded-t-3xl flex flex-col shadow-2xl transition-transform duration-300 ease-out ${showPreview ? "translate-y-0" : "translate-y-full"}`}
        >
          {/* Drag handle */}
          <div className="shrink-0 flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100 shrink-0">
            <p className="text-xs font-semibold text-gray-700 tracking-widest uppercase">
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

          <iframe
            ref={mobileIframeRef}
            src="/preview"
            className="flex-1 w-full border-none"
            onLoad={() => sendToIframe(mobileIframeRef)}
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 px-6 py-8 max-w-6xl mx-auto w-full flex-1 min-h-0">
        {/* Left — pricing */}
        <div className="w-full lg:w-[500px] shrink-0 flex flex-col">
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
            <Button
              variant="default"
              size="md"
              onClick={() => setShowPreview(true)}
              fullWidth
              className="rounded-xl"
            >
              Preview my page
            </Button>

            <div>
              <Button
                variant="primary"
                size="lg"
                onClick={onNext}
                fullWidth
                className="rounded-xl"
              >
                Pay $9 &amp; activate
              </Button>
              <p className="text-center text-xs text-gray-400 mt-3">
                Secure checkout. Money-back guarantee.
              </p>
            </div>
          </div>
        </div>

        {/* Right — live preview (desktop only) */}
        {/* <div className="hidden lg:flex flex-1 flex-col min-h-0 overflow-hidden h-full">
          <p className="text-sm text-gray-400 text-center mb-4 shrink-0">
            Live preview of your page
          </p>
          <div className="flex-1 rounded-2xl border border-gray-200 bg-white overflow-hidden flex flex-col shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 shrink-0">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-400">
                kloot.io/{appUsername || "yourhandle"}
              </div>
            </div>
            <iframe
              ref={desktopIframeRef}
              src="/preview"
              className="flex-1 w-full border-none"
              onLoad={() => sendToIframe(desktopIframeRef)}
            />
          </div>
        </div> */}
      </div>
    </div>
  );
}
