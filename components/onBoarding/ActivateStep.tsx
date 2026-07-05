"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { OnboardingNav } from "./OnboardingNav";
import Button from "@/components/reusable/Button";
import SubscribeButtonHOC from "@/components/SubscribeButtonHOC";
import { PLANS, type BillingFrequency } from "@/lib/plans";
import { useUser } from "@/contexts/UserContext";
import { getDefaultPackages } from "@/lib/default-packages";

export function ActivateStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const { userId } = useUser();
  const [analytics, setAnalytics] = useState<Record<string, any> | null>(null);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [appUsername, setAppUsername] = useState<string | undefined>(undefined);
  const [showPreview, setShowPreview] = useState(false);
  const [billing, setBilling] = useState<BillingFrequency>("yearly");

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
    location: draft.location ?? "",
    email: draft.display_email ?? "",
    profilePic: draft.profile_pic ?? ig.profile_pic ?? null,
    availableForCollabs: draft.available_for_collabs ?? true,
    nicheTags: Array.isArray(draft.niche_tags) ? draft.niche_tags : [],
    collabs: Array.isArray(draft.collabs) ? draft.collabs : [],
    prefIndustries: Array.isArray(draft.pref_industries)
      ? draft.pref_industries
      : [],
    restrictedIndustries: Array.isArray(draft.restricted_industries)
      ? draft.restricted_industries
      : [],
    deliverables: Array.isArray(draft.deliverables) ? draft.deliverables : [],
    turnaround: draft.turnaround ?? "",
    servicesVisible: draft.services_visible ?? true,
    receiptsVisible: draft.receipts_visible ?? true,
    theme: draft.theme ?? null,
    stats: {
      followers: ig.followers_count ?? null,
      avgViews: ig.impressions_30d || null,
      engagement: engagementRate,
      avgReach: ig.reach_30d || null,
      growth: ig.follower_gain_30d || null,
      reach_daily_30d:
        ig.reach_daily_30d && typeof ig.reach_daily_30d === "object"
          ? ig.reach_daily_30d
          : null,
    },
    insights: {
      gender_age: Array.isArray(ig.gender_age) ? ig.gender_age : [],
      top_countries: Array.isArray(ig.top_countries) ? ig.top_countries : [],
      top_cities: Array.isArray(ig.top_cities) ? ig.top_cities : [],
      age_breakdown: Array.isArray(ig.age_breakdown) ? ig.age_breakdown : [],
      gender_breakdown: Array.isArray(ig.gender_breakdown)
        ? ig.gender_breakdown
        : [],
    },
    posts:
      Array.isArray(draft.featured_posts) && draft.featured_posts.length > 0
        ? draft.featured_posts
        : Array.isArray(ig.top_content_by_views) &&
            ig.top_content_by_views.length > 0
          ? ig.top_content_by_views.slice(0, 4).map((p: any) => ({
              id: p.id,
              caption: p.caption,
              media_type: p.media_type,
              thumbnail_url: p.thumbnail_url ?? null,
              media_url: p.media_url ?? null,
              permalink: p.permalink ?? null,
              like_count: p.like_count,
              comments_count: p.comments_count,
              view_count: p.impressions,
            }))
          : Array.isArray(draft.posts) && draft.posts.length > 0
            ? draft.posts
            : [],
    packages:
      Array.isArray(draft.packages) && draft.packages.length
        ? draft.packages
        : getDefaultPackages(ig.followers_count ?? 0),
  };

  useEffect(() => {
    previewPropsRef.current = previewProps;
  });

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
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
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

      <div className="flex flex-col items-center px-4 sm:px-6 py-6 sm:py-8 max-w-lg mx-auto w-full flex-1">
        <div className="w-full flex flex-col">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-1">
            Activate your kloot link
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mb-5">
            One simple plan. Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1 mb-5">
            <button
              onClick={() => setBilling("monthly")}
              className={`cursor-pointer flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${billing === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`cursor-pointer flex-1 text-sm font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${billing === "yearly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
            >
              Yearly
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${billing === "yearly" ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-400"}`}
              >
                Save 15%
              </span>
            </button>
          </div>

          {/* Plan cards */}
          <div className="flex flex-col gap-4 w-full">
            {PLANS.map((plan) => {
              const pricing = plan.pricing[billing];
              return (
                <div
                  key={plan.key}
                  className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-7 flex flex-col gap-4 sm:gap-6"
                >
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5">
                      {plan.name}
                    </h2>
                    <p className="text-sm text-gray-400">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div>
                    <div className="flex items-end gap-2 mb-1">
                      <span className="text-4xl sm:text-5xl font-black text-gray-900">
                        ₹{pricing.effectiveMonthlyPrice}
                      </span>
                      <span className="text-base sm:text-lg text-gray-400 mb-1 sm:mb-2">
                        /month
                      </span>
                      {billing === "yearly" && pricing.originalMonthlyPrice && (
                        <span className="text-base sm:text-lg text-gray-300 line-through mb-1 sm:mb-2">
                          ₹{pricing.originalMonthlyPrice}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      {pricing.billingLabel}
                    </p>
                    {billing === "yearly" && pricing.savingsNote && (
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-lg">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="shrink-0"
                        >
                          <path
                            d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5L8 2z"
                            fill="currentColor"
                          />
                        </svg>
                        {pricing.savingsNote}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 sm:space-y-3">
                    {plan.features.map((f) => (
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

                  <SubscribeButtonHOC
                    userId={userId}
                    planId={pricing.id}
                    onSuccess={() => onNext()}
                  >
                    {({ onSubscribe, loading }) => (
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={onSubscribe}
                        disabled={loading || !userId}
                        loading={loading}
                        fullWidth
                        className="rounded-xl"
                      >
                        {loading
                          ? "Processing…"
                          : `Pay ₹${pricing.price} & activate`}
                      </Button>
                    )}
                  </SubscribeButtonHOC>

                  <Button
                    variant="default"
                    size="md"
                    onClick={() => setShowPreview(true)}
                    fullWidth
                    className="rounded-xl"
                  >
                    Preview my page
                  </Button>
                </div>
              );
            })}
          </div>

          <button
            onClick={onSkip}
            className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer mx-auto"
          >
            I&apos;ll do it later →
          </button>
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
