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
      { value: "8.9%", label: "ENGAGEMENT" },
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
      { value: "9.6%", label: "ENGAGEMENT" },
      { value: "Sold out · 9d", label: "SELL-THROUGH" },
      { value: "1.2K posts", label: "UGC" },
    ],
    gradientIdx: 3,
    caption: "the only knit you'll reach for this spring.",
    postType: "REEL",
    dotCount: 4,
  },
];

function CollabCard({
  card,
  accentColor,
  primaryColor,
}: {
  card: CardData;
  accentColor: string;
  primaryColor: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  const slides = card.posts ?? [];
  const hasSlides = slides.length > 0;
  const activeSlide = slides[activeIdx];

  const displayThumb = activeSlide?.thumbUrl ?? card.thumbUrl ?? null;
  const displayType = activeSlide?.postType ?? card.postType;
  const displayCaption = activeSlide?.caption ?? card.caption;
  const displayCount = hasSlides ? slides.length : card.dotCount;
  const permalink = activeSlide?.permalink;

  const canPrev = activeIdx > 0;
  const canNext = activeIdx < displayCount - 1;

  return (
    <div
      id={`receipts-card-${card.id}`}
      className="bg-white rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-sm"
      style={
        card.featured
          ? { border: `2px solid ${accentColor}40` }
          : { border: "2px solid transparent" }
      }
    >
      {/* Thumbnail */}
      {hasSlides && (
        <div
          className={`group relative w-full sm:w-36 md:w-44 h-48 sm:h-auto shrink-0 sm:self-stretch ${permalink ? "cursor-pointer" : ""}`}
          onClick={() => {
            if (permalink)
              window.open(permalink, "_blank", "noopener,noreferrer");
          }}
        >
          {displayThumb && (
            <img
              src={displayThumb}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[card.gradientIdx]} ${displayThumb ? "opacity-40" : ""}`}
          />

          {/* Post type badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider px-2 py-1 rounded-full font-mono">
              {displayType}
            </span>
          </div>

          {/* Counter badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-black/30 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full font-mono">
              {activeIdx + 1}/{displayCount}
            </span>
          </div>

          {/* Carousel arrows — appear on hover when multiple slides */}
          {displayCount > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIdx((n) => Math.max(n - 1, 0));
                }}
                className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white cursor-pointer transition-all duration-200 hover:bg-white hover:text-black ${canPrev ? "opacity-0 group-hover:opacity-100" : "opacity-0 pointer-events-none"}`}
                aria-label="Previous post"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M6.5 2L3.5 5l3 3"
                    stroke="currentColor"
                    strokeWidth="1.6"
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
                className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white cursor-pointer transition-all duration-200 hover:bg-white hover:text-black ${canNext ? "opacity-0 group-hover:opacity-100" : "opacity-0 pointer-events-none"}`}
                aria-label="Next post"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M3.5 2L6.5 5l-3 3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          )}

          {/* Caption + dot indicator */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 z-10">
            <p className="text-white text-[11px] font-medium leading-tight line-clamp-2">
              {displayCaption}
            </p>
            <div className="flex gap-1 mt-2">
              {Array.from({ length: displayCount }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-full h-1 bg-white transition-all duration-200"
                  style={{
                    width: i === activeIdx ? 16 : 6,
                    opacity: i === activeIdx ? 1 : 0.4,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-4 md:p-5 flex flex-col min-w-0">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            {card.featured && (
              <div
                className="flex items-center gap-1.5  text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full w-fit mb-2"
                style={{ color: primaryColor, backgroundColor: accentColor }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61z" />
                </svg>
                TOP PERFORMER
              </div>
            )}
            <h3 className="font-black text-gray-900 text-xl md:text-2xl leading-tight truncate">
              {card.brand}
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">{card.industry}</p>
          </div>
          {permalink && (
            <a
              href={permalink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-600 transition-colors shrink-0 mt-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 17L17 7M17 7H7M17 7v10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          )}
          {!permalink && <div className="w-8 h-8 shrink-0" />}
        </div>

        {/* Goal & Built */}
        <div className="space-y-1.5 mb-4">
          {card.goal && (
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                className="mt-0.5 shrink-0 text-gray-400"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              </svg>

              <p className="leading-snug">
                <span className="font-semibold">Goal:</span> {card.goal}
              </p>
            </div>
          )}
          {card.built && (
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                className="mt-0.5 shrink-0 text-gray-400"
              >
                <path
                  d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="leading-snug">
                <span className="font-semibold">Built:</span> {card.built}
              </p>
            </div>
          )}
        </div>

        {/* Metrics 2×2 */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {card.metrics.map((m) => (
            <div key={m.label} className="bg-gray-50 rounded-xl p-3">
              <p className="font-black text-gray-900 text-base md:text-lg leading-none">
                {m.value}
              </p>
              <p className="text-gray-400 text-[10px] font-semibold tracking-wider mt-1">
                {m.label}
              </p>
            </div>
          ))}
        </div>

        {/* Case verified */}
        {/* <div className="mt-auto pt-1">
          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8 12l3 3 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            CASE VERIFIED
          </div>
        </div> */}
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
  primaryColor,
}: {
  collabs?: Collaboration[];
  accentColor: string;
  primaryColor: string;
}) {
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
        }));

        // Auto-compute metrics from selected posts
        const totalLikes = rawPosts.reduce(
          (s, p) => s + (p.like_count ?? 0),
          0,
        );
        const totalComments = rawPosts.reduce(
          (s, p) => s + (p.comments_count ?? 0),
          0,
        );
        const fmtNum = (n: number) => {
          if (n >= 1_000_000)
            return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
          if (n >= 1_000)
            return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
          return String(n);
        };
        const metrics: { value: string; label: string }[] = [];
        if (totalLikes > 0)
          metrics.push({ value: fmtNum(totalLikes), label: "LIKES" });
        if (totalComments > 0)
          metrics.push({ value: fmtNum(totalComments), label: "COMMENTS" });

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
    <section id="receipts" className="py-12 md:py-20 bg-[#f0f7f2]">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">
              Receipts
            </p>
            <h2 className="font-black text-gray-900 text-3xl md:text-5xl leading-tight">
              Past collabs{" "}
              <em className="italic font-black" style={{ color: accentColor }}>
                that delivered.
              </em>
            </h2>
          </div>
          <p className="text-sm text-gray-500 max-w-xs md:text-right leading-relaxed">
            Real campaigns, real numbers, real posts. Hover any card for the
            full story.
          </p>
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
              primaryColor={primaryColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
