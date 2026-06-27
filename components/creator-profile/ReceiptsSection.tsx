"use client";

import { useState } from "react";
import { type Collaboration } from "./types";

const GRADIENTS = [
  "from-indigo-900 via-blue-800 to-purple-900",
  "from-sky-700 via-teal-600 to-cyan-700",
  "from-slate-700 via-gray-600 to-zinc-800",
  "from-emerald-800 via-teal-700 to-green-800",
];

type PostSlide = {
  thumbUrl: string | null;
  postType: string;
  caption: string;
  permalink?: string | null;
  views?: number;
  likes?: number;
  comments?: number;
  saves?: number;
  shares?: number;
};

type CardData = {
  id: string;
  brand: string;
  industry: string;
  featured: boolean;
  goal: string;
  built: string;
  metrics: { value: string; label: string }[];
  gradientIdx: number;
  // Static fallbacks (used for dummy cards and when no posts selected)
  caption: string;
  postType: string;
  dotCount: number;
  thumbUrl?: string | null;
  // Real per-post slides for carousel
  posts?: PostSlide[];
};

const DUMMY_CARDS: CardData[] = [
  {
    id: "d1",
    brand: "Glow Atelier",
    industry: "Clean Beauty",
    featured: true,
    goal: "Product launch awareness",
    built: "3 Reels · 1 Carousel · 6 Stories",
    metrics: [
      { value: "1.4M", label: "REACH" },
      { value: "8.9%", label: "INTERACTIONS" },
      { value: "62K", label: "SITE VISITS" },
      { value: "+34%", label: "CONVERSIONS" },
    ],
    gradientIdx: 0,
    caption: "the 7-step morning that changed my skin →",
    postType: "REEL",
    dotCount: 4,
  },
  {
    id: "d2",
    brand: "Wanderwell Travel",
    industry: "Travel · Hospitality",
    featured: false,
    goal: "Drive shoulder-season bookings",
    built: "2 Reels · 1 long-form YT",
    metrics: [
      { value: "612K", label: "VIEWS" },
      { value: "11.2%", label: "CTR" },
      { value: "2.1K", label: "BOOKINGS" },
      { value: "4.8x", label: "ROAS" },
    ],
    gradientIdx: 1,
    caption: "5 days in Lisbon, off-peak, off-script.",
    postType: "REEL",
    dotCount: 3,
  },
  {
    id: "d3",
    brand: "Northcurrent Audio",
    industry: "Consumer Tech",
    featured: false,
    goal: "Position flagship headphones with creatives",
    built: "1 Reel · 1 Carousel · 4 Stories",
    metrics: [
      { value: "980K", label: "IMPRESSIONS" },
      { value: "21K", label: "SAVES" },
      { value: "+58%", label: "ADD-TO-CART" },
      { value: "94%", label: "SENTIMENT" },
    ],
    gradientIdx: 2,
    caption: "studio set-up for a 3am edit session.",
    postType: "REEL",
    dotCount: 2,
  },
  {
    id: "d4",
    brand: "Mira Knitwear",
    industry: "Sustainable Fashion",
    featured: false,
    goal: "Capsule drop · Q2 SS collection",
    built: "4 Reels · lookbook shoot",
    metrics: [
      { value: "2.4M", label: "REACH" },
      { value: "9.6%", label: "INTERACTIONS" },
      { value: "Sold out · 9d", label: "SELL-THROUGH" },
      { value: "1.2K posts", label: "UGC" },
    ],
    gradientIdx: 3,
    caption: "the only knit you'll reach for this spring.",
    postType: "REEL",
    dotCount: 4,
  },
];

function fmt(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

function PostCard({
  slide,
  gradientIdx,
  accentColor,
}: {
  slide: PostSlide;
  gradientIdx: number;
  accentColor: string;
}) {
  return (
    <div className="rounded-2xl overflow-hidden bg-gray-50">
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ aspectRatio: "3/4" }}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[gradientIdx]}`}
        />
        {slide.thumbUrl && (
          <img
            src={slide.thumbUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="bg-gray-900/80 backdrop-blur-sm text-white text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full">
            {slide.postType}
          </span>
        </div>
        {slide.postType === "REEL" && (
          <div className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          </div>
        )}
        {(slide.views ?? 0) > 0 && (
          <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 text-white text-[10px] font-semibold bg-black/30 backdrop-blur-sm rounded-full px-2 py-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path
                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            {fmt(slide.views!)}
          </div>
        )}
        {slide.permalink && (
          <a
            href={slide.permalink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-20"
          />
        )}
      </div>
      <div className="px-3 py-2.5 grid grid-cols-2 gap-x-3 gap-y-1">
        {(slide.likes ?? 0) > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {fmt(slide.likes!)}
          </span>
        )}
        {(slide.saves ?? 0) > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {fmt(slide.saves!)}
          </span>
        )}
        {(slide.comments ?? 0) > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {fmt(slide.comments!)}
          </span>
        )}
        {(slide.shares ?? 0) > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <circle
                cx="18"
                cy="5"
                r="3"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <circle
                cx="6"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <circle
                cx="18"
                cy="19"
                r="3"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
            {fmt(slide.shares!)}
          </span>
        )}
      </div>
    </div>
  );
}

function CollabDetailModal({
  card,
  accentColor,
  onClose,
}: {
  card: CardData;
  accentColor: string;
  onClose: () => void;
}) {
  const slides = card.posts ?? [];
  const reach = card.metrics.find((m) => m.label === "REACH");
  const engagement = card.metrics.find((m) => m.label === "ENGAGEMENT");
  const metricA = reach ?? card.metrics[0];
  const metricB = engagement ?? card.metrics[1];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl rounded-t-3xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <div className="px-5 sm:px-6 pt-4 pb-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="font-black text-gray-900 text-xl sm:text-2xl">
                  {card.brand}
                </h2>
                {card.industry && (
                  <span
                    className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${accentColor}22`,
                      color: accentColor,
                    }}
                  >
                    {card.industry}
                  </span>
                )}
              </div>
              {(card.goal || card.built) && (
                <p className="text-sm text-gray-500">
                  {[card.goal, card.built].filter(Boolean).join(" — ")}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M1 1l10 10M11 1L1 11"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          {/* Summary metrics */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 sm:mb-6">
            {metricA && (
              <div className="bg-gray-50 rounded-2xl p-3 sm:p-4">
                <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  {metricA.label === "REACH" ? "Total Reach" : metricA.label}
                </p>
                <p className="font-black text-gray-900 text-lg sm:text-xl mt-0.5">
                  {metricA.value}
                </p>
              </div>
            )}
            {metricB && (
              <div className="bg-gray-50 rounded-2xl p-3 sm:p-4">
                <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  {metricB.label}
                </p>
                <p
                  className="font-black text-lg sm:text-xl mt-0.5"
                  style={{ color: accentColor }}
                >
                  {metricB.value}
                </p>
              </div>
            )}
            <div className="bg-gray-50 rounded-2xl p-3 sm:p-4">
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Pieces
              </p>
              <p className="font-black text-gray-900 text-lg sm:text-xl mt-0.5">
                {slides.length || card.dotCount}
              </p>
            </div>
          </div>
          {/* Per-post grid */}
          {slides.length > 0 && (
            <>
              <p className="font-black text-gray-900 text-base mb-3">
                Per piece performance
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {slides.map((slide, i) => (
                  <PostCard
                    key={i}
                    slide={slide}
                    gradientIdx={(card.gradientIdx + i) % GRADIENTS.length}
                    accentColor={accentColor}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function parseMetricPct(value: string, isEngagement: boolean): number {
  const num = parseFloat(value.replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return 50;
  if (isEngagement) return Math.min((num / 20) * 100, 100);
  const mult = value.includes("M")
    ? 1_000_000
    : value.includes("K")
      ? 1_000
      : 1;
  return Math.min((num * mult) / 50_000, 100);
}

function CollabCard({
  card,
  accentColor,
  baseColor,
  onOpenModal,
}: {
  card: CardData;
  accentColor: string;
  baseColor: string;
  onOpenModal: () => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  const slides = card.posts ?? [];
  const hasSlides = slides.length > 0;
  const activeSlide = slides[activeIdx];
  const displayThumb = activeSlide?.thumbUrl ?? card.thumbUrl ?? null;
  const displayCount = hasSlides ? slides.length : card.dotCount;
  const canPrev = activeIdx > 0;
  const canNext = activeIdx < displayCount - 1;
  const thumbSlides = slides.slice(0, 3);
  const views = activeSlide?.views;

  const reach = card.metrics.find(
    (m) =>
      m.label === "REACH" || m.label === "VIEWS" || m.label === "IMPRESSIONS",
  );
  const eng = card.metrics.find(
    (m) => m.label === "ENGAGEMENT" || m.label === "INTERACTIONS",
  );
  const metricA = reach ?? card.metrics[0];
  const metricB = eng ?? card.metrics[1];

  const reachPct = metricA ? parseMetricPct(metricA.value, false) : 60;
  const engPct = metricB ? parseMetricPct(metricB.value, true) : 40;

  return (
    <div
      id={`receipts-card-${card.id}`}
      className="bg-white rounded-3xl overflow-hidden flex flex-col sm:flex-row cursor-pointer hover:shadow-lg transition-shadow"
      style={{ border: "1.5px solid #ebebeb" }}
      onClick={onOpenModal}
    >
      {/* ── Left panel: live thumbnail ── */}
      <div className="h-44 sm:h-auto sm:w-36 shrink-0 relative group overflow-hidden">
        {/* Gradient base */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[card.gradientIdx]}`}
        />
        {/* Thumbnail */}
        {displayThumb && (
          <img
            src={displayThumb}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}

        {/* Industry badge — accent + base colors */}
        {card.industry && (
          <div className="absolute top-3 left-3 right-3 z-10">
            <span
              className="inline-block text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
              style={{ backgroundColor: baseColor, color: accentColor }}
            >
              {card.industry.split(" · ")[0]}
            </span>
          </div>
        )}

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#111">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          </div>
        </div>

        {/* Carousel arrows */}
        {displayCount > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx((n) => Math.max(n - 1, 0));
              }}
              className={`absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors ${canPrev ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
                <path
                  d="M6.5 2L3.5 5l3 3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx((n) => Math.min(n + 1, displayCount - 1));
              }}
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors ${canNext ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
                <path
                  d="M3.5 2L6.5 5l-3 3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}

        {/* Views + slide counter at bottom */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2.5 z-10 flex items-end justify-between">
          {(views ?? 0) > 0 ? (
            <span className="flex items-center gap-1 text-white text-[9px] font-semibold">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                <path
                  d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              {fmt(views!)}
            </span>
          ) : (
            <span />
          )}
          {displayCount > 1 && (
            <span className="text-white/70 text-[9px] font-mono">
              {activeIdx + 1}/{displayCount}
            </span>
          )}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 p-3 sm:p-5 flex flex-col gap-2.5 sm:gap-3 min-w-0">
        {/* Header: brand + top performer */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-black text-gray-900 text-base sm:text-lg leading-tight truncate">
              {card.brand}
            </h3>

            <div className="flex flex-row gap-2">
              {card.goal && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {card.goal}
                </p>
              )}
              {card.goal && card.built && (
                <span className="text-gray-400 text-sm">•</span>
              )}

              {card.built && (
                <p className=" text-xs text-gray-400 mt-0.5 truncate">
                  {card.built}
                </p>
              )}
            </div>
          </div>
          {card.featured && (
            <span
              className="flex items-center gap-1 text-[8px] font-black tracking-wider uppercase px-2 py-1 rounded-full shrink-0 whitespace-nowrap"
              style={{
                backgroundColor: `${accentColor}20`,
                color: accentColor,
              }}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61z" />
              </svg>
              Top
            </span>
          )}
        </div>

        {/* Metrics with progress bars */}
        <div className="flex gap-4">
          {metricA && (
            <div
              className="flex-1 min-w-0 rounded-lg p-2 px-4"
              style={{ backgroundColor: baseColor }}
            >
              <p className="text-[8px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-1">
                {metricA.label === "IMPRESSIONS"
                  ? "Total Reach"
                  : metricA.label === "REACH"
                    ? "Total Reach"
                    : metricA.label}
              </p>
              <p className="font-black text-gray-900 text-lg sm:text-xl leading-none">
                {metricA.value}
              </p>
              {/* <div className="mt-2 h-1 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${reachPct}%` }}
                />
              </div> */}
            </div>
          )}
          {metricB && (
            <div
              className="flex-1 min-w-0  rounded-lg p-2 px-4"
              style={{ backgroundColor: baseColor }}
            >
              <p className="text-[8px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-1">
                Engagement
              </p>
              <p className="font-black text-gray-900 text-lg sm:text-xl leading-none">
                {metricB.value}
              </p>
              {/* <div className="mt-2 h-1 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-green-500" style={{ width: `${engPct}%` }} />
              </div> */}
            </div>
          )}
        </div>

        {/* Footer: thumbnail stack + view report */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex -space-x-2">
            {(thumbSlides.length > 0
              ? thumbSlides
              : [{} as any, {} as any, {} as any]
            ).map((s, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white overflow-hidden"
                style={{ zIndex: 3 - i }}
              >
                {s.thumbUrl && (
                  <img
                    src={s.thumbUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <span className="text-xs font-bold" style={{ color: accentColor }}>
            View Report
          </span>
        </div>
      </div>
    </div>
  );
}

function toThumb(p: any): string | null {
  return (
    p.thumbnail_url ??
    (p.media_type === "IMAGE" || p.media_type === "CAROUSEL_ALBUM"
      ? p.media_url
      : null)
  );
}

function toPostType(mediaType?: string): string {
  if (mediaType === "VIDEO") return "REEL";
  if (mediaType === "CAROUSEL_ALBUM") return "CAROUSEL";
  return "POST";
}

export function ReceiptsSection({
  collabs,
  accentColor,
  baseColor,
  darkMode = false,
}: {
  collabs?: Collaboration[];
  accentColor: string;
  baseColor: string;
  darkMode?: boolean;
}) {
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const hasCollabs = collabs && collabs.length > 0;

  const cardData: CardData[] = hasCollabs
    ? collabs!.slice(0, 4).map((c, i): CardData => {
        const rawPosts: any[] = c.collabPosts ?? [];

        // Build per-slide data
        const slides: PostSlide[] = rawPosts.map((p) => ({
          thumbUrl: toThumb(p),
          postType: toPostType(p.media_type),
          caption: (p.caption ?? "").slice(0, 80),
          permalink: p.permalink ?? null,
          views: p.impressions ?? undefined,
          likes: p.like_count ?? undefined,
          comments: p.comments_count ?? undefined,
          saves: p.saved ?? undefined,
          shares: p.shares ?? undefined,
        }));

        // Auto-compute metrics from selected posts using enriched insight data
        const sum = (key: string) =>
          rawPosts.reduce((s, p) => s + (p[key] ?? 0), 0);
        const fmtNum = (n: number) => {
          if (n >= 1_000_000)
            return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
          if (n >= 1_000)
            return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
          return String(n);
        };

        const hasReels = rawPosts.some((p) => p.media_product_type === "REELS");
        // `impressions` holds views for reels or impressions for feed (mapped in posts route)
        const totalImpressions = sum("impressions");
        const totalReach = sum("reach");
        const totalInteractions = sum("total_interactions");

        const metrics: { value: string; label: string }[] = [];
        if (totalImpressions > 0)
          metrics.push({
            value: fmtNum(totalImpressions),
            label: hasReels ? "VIEWS" : "IMPRESSIONS",
          });
        if (totalReach > 0)
          metrics.push({ value: fmtNum(totalReach), label: "REACH" });
        if (totalInteractions > 0)
          metrics.push({
            value: fmtNum(totalInteractions),
            label: "INTERACTIONS",
          });
        const engagementPct =
          totalReach > 0 && totalInteractions > 0
            ? parseFloat(((totalInteractions / totalReach) * 100).toFixed(1))
            : 0;
        if (engagementPct > 0)
          metrics.push({ value: `${engagementPct}%`, label: "ENGAGEMENT" });

        // Build "built" string from explicit counts (user-editable), fall back to post detection
        const rc = c.reels_count ?? 0;
        const pc = c.posts_count ?? 0;
        const sc = c.stories_count ?? 0;
        const builtParts: string[] = [];
        if (rc > 0) builtParts.push(`${rc} Reel${rc > 1 ? "s" : ""}`);
        if (pc > 0) builtParts.push(`${pc} Post${pc > 1 ? "s" : ""}`);
        if (sc > 0) builtParts.push(`${sc} ${sc > 1 ? "Stories" : "Story"}`);
        const autoBuilt = builtParts.join(" + ");

        const firstPost = rawPosts[0];

        return {
          id: String(c.id),
          brand: c.brand || "Brand",
          industry: c.industry ?? c.campaign ?? "",
          featured: c.featured,
          goal: c.goal ?? c.contribution ?? "",
          built: c.built || autoBuilt,
          metrics,
          gradientIdx: i % GRADIENTS.length,
          caption: slides[0]?.caption || (c.industry ?? c.campaign ?? ""),
          postType: slides[0]?.postType ?? "REEL",
          dotCount: Math.max(slides.length, 1),
          thumbUrl: slides[0]?.thumbUrl ?? null,
          posts: slides.length > 0 ? slides : undefined,
        };
      })
    : DUMMY_CARDS;

  return (
    <section
      id="receipts"
      className="py-12 md:py-20 "
      style={{ backgroundColor: baseColor }}
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">
              Receipts
            </p>
            <h2
              className={`font-black text-3xl md:text-5xl leading-tight ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              Past collabs{" "}
              <em className="italic font-black" style={{ color: accentColor }}>
                that delivered.
              </em>
            </h2>
          </div>
          {/* <p className="text-sm text-gray-500 max-w-xs md:text-right leading-relaxed">
            Real campaigns, real numbers, real posts. Hover any card for the
            full story.
          </p> */}
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cardData.map((card) => (
            <CollabCard
              key={card.id}
              card={card}
              accentColor={accentColor}
              baseColor={baseColor}
              onOpenModal={() => setOpenCardId(card.id)}
            />
          ))}
        </div>
      </div>

      {openCardId &&
        (() => {
          const card = cardData.find((c) => c.id === openCardId);
          return card ? (
            <CollabDetailModal
              card={card}
              accentColor={accentColor}
              onClose={() => setOpenCardId(null)}
            />
          ) : null;
        })()}
    </section>
  );
}
