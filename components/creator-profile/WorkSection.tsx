"use client";
import { fmt, type PostItem } from "./types";

const DUMMY_GRADIENTS = [
  "from-indigo-900 via-blue-800 to-purple-900",
  "from-teal-700 via-emerald-600 to-cyan-700",
  "from-amber-700 via-orange-600 to-yellow-700",
  "from-emerald-800 via-teal-700 to-green-800",
];

function postTypeCode(mediaType?: string, index?: number) {
  const code =
    mediaType === "REELS" ? "REEL" : mediaType === "VIDEO" ? "VIDEO" : "POST";
  return `${code}_0${(index ?? 0) + 1}`;
}

function buildCardData(posts: PostItem[] | undefined, fallback: boolean) {
  const items = posts && posts.length > 0 ? posts.slice(0, 4) : [];
  if (items.length > 0) {
    return items.map((p, i) => ({
      id: p.id,
      type: postTypeCode(p.media_type, i),
      thumb:
        p.thumbnail_url ??
        (p.media_type === "IMAGE" || p.media_type === "CAROUSEL_ALBUM"
          ? p.media_url
          : null),
      permalink: p.permalink ?? null,
      title: p.caption
        ? p.caption.split("\n")[0].slice(0, 28)
        : `Post ${i + 1}`,
      metric: fmt(p.like_count),
      gradient: DUMMY_GRADIENTS[i % DUMMY_GRADIENTS.length],
    }));
  }
  if (!fallback) return [];
  return [
    {
      id: "d1",
      type: "REEL_01",
      thumb: null,
      permalink: null,
      title: "Cobalt Knit Capsule",
      metric: "2.4M",
      gradient: DUMMY_GRADIENTS[0],
    },
    {
      id: "d2",
      type: "POST_02",
      thumb: null,
      permalink: null,
      title: "Soft Futures Edit",
      metric: "1.1M",
      gradient: DUMMY_GRADIENTS[1],
    },
    {
      id: "d3",
      type: "STORY_03",
      thumb: null,
      permalink: null,
      title: "Desk Diaries vol.4",
      metric: "890K",
      gradient: DUMMY_GRADIENTS[2],
    },
    {
      id: "d4",
      type: "REEL_04",
      thumb: null,
      permalink: null,
      title: "Macro Mint Study",
      metric: "612K",
      gradient: DUMMY_GRADIENTS[3],
    },
  ];
}

function PostGrid({
  cardData,
  handle,
  accentColor,
}: {
  cardData: ReturnType<typeof buildCardData>;
  handle: string;
  accentColor: string;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 items-start">
      {cardData.map((card, i) => {
        const cardClass = `relative rounded-2xl overflow-hidden ${i % 2 === 1 ? "md:mt-8 mt-5" : ""}`;
        const href = card.permalink ?? `https://www.instagram.com/${handle}/`;
        return (
          <a
            key={card.id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${cardClass} cursor-pointer`}
            style={{ aspectRatio: "3/4" }}
          >
            <div
              className={`w-full h-full bg-gradient-to-br ${card.gradient}`}
            />
            {card.thumb && (
              <img
                src={card.thumb}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div className="absolute top-3 left-3">
              <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full font-mono">
                {card.type}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4">
              <div className="flex items-end justify-between">
                <p className="text-white font-bold text-sm leading-tight">
                  {card.title}
                </p>
                <p className="text-white/80 text-sm font-semibold shrink-0 ml-2">
                  {card.metric}
                </p>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}

export function WorkSection({
  posts,
  campaignPosts,
  handle,
  baseColor,
  accentColor,
  contrastColor,
}: {
  posts?: PostItem[];
  campaignPosts?: PostItem[];
  handle: string;
  baseColor: string;
  accentColor: string;
  contrastColor: string;
}) {
  const featuredCardData = buildCardData(posts, true);
  const campaignCardData = buildCardData(campaignPosts, false);

  return (
    <section
      id="work"
      className="py-12 md:py-20"
      style={{ backgroundColor: contrastColor }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8 md:mb-10">
        <div className="flex items-end justify-between">
          <div>
            <h2
              className="font-black text-3xl md:text-5xl mb-2"
              style={{ color: baseColor }}
            >
              The Visual Lab
            </h2>
            <p className="text-gray-500 text-sm font-mono">@{handle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">
        <div>
          <p
            className="text-xs font-bold tracking-[0.2em] uppercase mb-6"
            style={{ color: accentColor }}
          >
            Featured Content
          </p>
          <PostGrid
            cardData={featuredCardData}
            handle={handle}
            accentColor={accentColor}
          />
        </div>

        {campaignCardData.length > 0 && (
          <div>
            <p
              className="text-xs font-bold tracking-[0.2em] uppercase mb-6"
              style={{ color: accentColor }}
            >
              Previous Campaigns
            </p>
            <PostGrid
              cardData={campaignCardData}
              handle={handle}
              accentColor={accentColor}
            />
          </div>
        )}
      </div>
    </section>
  );
}
