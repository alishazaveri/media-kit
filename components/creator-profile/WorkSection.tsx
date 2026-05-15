import { fmt, type PostItem } from "./types";

const DUMMY_GRADIENTS = [
  "from-indigo-900 via-blue-800 to-purple-900",
  "from-teal-700 via-emerald-600 to-cyan-700",
  "from-amber-700 via-orange-600 to-yellow-700",
  "from-emerald-800 via-teal-700 to-green-800",
];

function postTypeCode(mediaType?: string, index?: number) {
  const code =
    mediaType === "REELS" ? "REEL" :
    mediaType === "VIDEO" ? "VIDEO" :
    "POST";
  return `${code}_0${(index ?? 0) + 1}`;
}

export function WorkSection({
  posts,
  handle,
}: {
  posts?: PostItem[];
  handle: string;
}) {
  const displayPosts = posts && posts.length > 0 ? posts.slice(0, 4) : [];

  const cardData =
    displayPosts.length > 0
      ? displayPosts.map((p, i) => ({
          id: p.id,
          type: postTypeCode(p.media_type, i),
          thumb:
            p.thumbnail_url ??
            (p.media_type === "IMAGE" || p.media_type === "CAROUSEL_ALBUM"
              ? p.media_url
              : null),
          title: p.caption ? p.caption.split("\n")[0].slice(0, 28) : `Post ${i + 1}`,
          metric: fmt(p.like_count),
          gradient: DUMMY_GRADIENTS[i % DUMMY_GRADIENTS.length],
        }))
      : [ // [DUMMY posts: replace with real post data]
          { id: "d1", type: "REEL_01", thumb: null, title: "Cobalt Knit Capsule", metric: "2.4M", gradient: DUMMY_GRADIENTS[0] },
          { id: "d2", type: "POST_02", thumb: null, title: "Soft Futures Edit", metric: "1.1M", gradient: DUMMY_GRADIENTS[1] },
          { id: "d3", type: "STORY_03", thumb: null, title: "Desk Diaries vol.4", metric: "890K", gradient: DUMMY_GRADIENTS[2] },
          { id: "d4", type: "REEL_04", thumb: null, title: "Macro Mint Study", metric: "612K", gradient: DUMMY_GRADIENTS[3] },
        ];

  return (
    <section id="work" className="py-20 bg-[#0D1B2A]">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-8 mb-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-black text-white text-5xl mb-2">
              The Visual Lab {/* [DUMMY: could be a configurable section title] */}
            </h2>
            <p className="text-gray-500 text-sm font-mono">
              @{handle} // feed_dump.04 {/* [DUMMY: feed version] */}
            </p>
          </div>
          <button className="flex items-center gap-2 text-white font-semibold text-sm hover:text-blue-400 transition-colors">
            View Archive
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Staggered 4-col gallery */}
      <div className="max-w-6xl mx-auto px-8">
        <div className="grid grid-cols-4 gap-4 items-start">
          {cardData.map((card, i) => (
            <div
              key={card.id}
              className={`relative rounded-2xl overflow-hidden ${i % 2 === 1 ? "mt-8" : ""}`}
              style={{ aspectRatio: "3/4" }}
            >
              {card.thumb ? (
                <img
                  src={card.thumb}
                  alt={card.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${card.gradient}`} />
              )}
              <div className="absolute top-3 left-3">
                <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full font-mono">
                  {card.type}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4">
                <div className="flex items-end justify-between">
                  <p className="text-white font-bold text-sm leading-tight">{card.title}</p>
                  <p className="text-white/80 text-sm font-semibold shrink-0 ml-2">{card.metric}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
