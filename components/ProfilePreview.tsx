/* Live preview of the creator's public profile page */

const TAG_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-green-100 text-green-700",
  "bg-pink-100 text-pink-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-teal-100 text-teal-700",
];

interface Package {
  id: number;
  title: string;
  description: string;
  price: string;
  popular: boolean;
}

interface Collaboration {
  id: number;
  brand: string;
  campaign: string;
  featured: boolean;
}

interface ProfilePreviewProps {
  name?: string;
  handle?: string;
  tagline?: string;
  location?: string;
  availableForCollabs?: boolean;
  nicheTags?: string[];
  packages?: Package[];
  collabs?: Collaboration[];
}

export function ProfilePreview({
  name = "Sarah Johnson",
  handle = "sarahjcreates",
  tagline = "Lifestyle & Wellness Creator | Inspiring authentic living through mindful content",
  location = "Los Angeles, CA",
  availableForCollabs = true,
  nicheTags = ["Lifestyle", "Wellness", "Beauty", "Travel"],
  packages = [
    { id: 1, title: "Instagram Reel", description: "Single Instagram Reel with full rights", price: "$2,500", popular: false },
    { id: 2, title: "Instagram Story", description: "Story series (3–5 frames)", price: "$800", popular: false },
    { id: 3, title: "YouTube Video", description: "Dedicated or integrated video", price: "$5,000", popular: true },
    { id: 4, title: "Campaign Bundle", description: "Multi-platform package", price: "Request Price", popular: false },
  ],
  collabs = [
    { id: 1, brand: "GlowBeauty Co.", campaign: "Product Launch — New Skincare Line", featured: true },
    { id: 2, brand: "FitLife Nutrition", campaign: "Brand Awareness Campaign", featured: false },
  ],
}: ProfilePreviewProps) {
  const initial = name.trim() ? name.trim()[0].toUpperCase() : "?";
  const visibleCollabs = [...collabs].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).slice(0, 3);
  const visiblePackages = packages.slice(0, 4);

  return (
    <div className="text-[13px] font-sans">
      {/* Profile header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-violet-300 flex items-center justify-center bg-white text-violet-600 font-bold text-base shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-gray-900 text-sm">{name || "Your name"}</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="7" fill="#3B82F6" />
              <path d="M4 7L6 9L10 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-primary text-xs">@{handle || "yourhandle"}</p>
          <p className="text-gray-500 text-xs leading-snug mt-0.5">
            {tagline || "Your tagline will appear here"}
          </p>
        </div>
      </div>

      {/* Niche tags */}
      {nicheTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {nicheTags.map((label, i) => (
            <span key={label} className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}>
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Location + collab status */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 flex-wrap">
        {location && <span>📍 {location}</span>}
        {availableForCollabs && (
          <span className="text-green-600 font-medium flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Available for collaborations
          </span>
        )}
      </div>

      {/* Platform cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { icon: "📷", platform: "Instagram", count: "485K", bg: "bg-pink-50" },
          { icon: "▶", platform: "YouTube", count: "290K", bg: "bg-violet-50" },
          { icon: "♪", platform: "TikTok", count: "620K", bg: "bg-fuchsia-50" },
        ].map(({ icon, platform, count, bg }) => (
          <div key={platform} className={`${bg} rounded-xl p-2.5 text-center`}>
            <span className="text-base">{icon}</span>
            <p className="text-[10px] text-gray-500 mt-0.5">{platform}</p>
            <p className="font-bold text-gray-900 text-xs">{count}</p>
          </div>
        ))}
      </div>

      {/* Analytics grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: "Total Followers", value: "1.4M", delta: "+12% this month", icon: "👥" },
          { label: "Avg Views", value: "250K", delta: "+8% this month", icon: "👁" },
          { label: "Engagement", value: "8.5%", delta: "+2.1% this month", icon: "💬" },
          { label: "Avg Reach", value: "680K", delta: "+15% this month", icon: "📊" },
        ].map(({ label, value, delta, icon }) => (
          <div key={label} className="border border-gray-100 rounded-xl p-3">
            <p className="text-[10px] text-gray-400 flex items-center gap-1">
              <span>{icon}</span> {label}
            </p>
            <p className="font-bold text-gray-900 text-base leading-tight">{value}</p>
            <p className="text-[10px] text-green-600">{delta}</p>
          </div>
        ))}
        <div className="col-span-2 border border-gray-100 rounded-xl p-3">
          <p className="text-[10px] text-gray-400 flex items-center gap-1"><span>🚀</span> Growth Rate</p>
          <p className="font-bold text-gray-900 text-base">+18%</p>
          <p className="text-[10px] text-gray-400">Last 30 days</p>
        </div>
      </div>

      {/* Audience Insights */}
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-gray-900 text-sm">Audience Insights</p>
        <button className="text-xs text-violet-500">Expand Details ▾</button>
      </div>
      <div className="border border-gray-100 rounded-xl p-3 mb-4 text-xs text-gray-500">
        <p className="text-[10px] text-gray-400 mb-2">Know your follower this creator</p>
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-violet-400 border-r-pink-400 border-b-gray-200 border-l-gray-200" />
          <div className="space-y-1 text-[10px]">
            <p><span className="inline-block w-2 h-2 rounded-full bg-violet-400 mr-1" />Female (41%)</p>
            <p><span className="inline-block w-2 h-2 rounded-full bg-pink-400 mr-1" />Male (31%)</p>
            <p><span className="inline-block w-2 h-2 rounded-full bg-gray-300 mr-1" />Other (1%)</p>
          </div>
        </div>
      </div>

      {/* Past Collaborations */}
      {visibleCollabs.length > 0 && (
        <>
          <p className="font-semibold text-gray-900 text-sm mb-3">Past Collaborations</p>
          <div className="space-y-2 mb-4">
            {visibleCollabs.map(({ id, brand, campaign, featured }) => (
              <div key={id} className={`border rounded-xl p-3 ${featured ? "border-violet-200 bg-violet-50/40" : "border-gray-100"}`}>
                {featured && (
                  <span className="text-[10px] font-medium text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full mb-2 inline-block">
                    ✦ Featured Campaign
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {brand ? brand[0].toUpperCase() : "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-xs truncate">{brand || "Brand name"}</p>
                    <p className="text-[10px] text-gray-400 truncate">{campaign || "Campaign name"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Packages */}
      {visiblePackages.length > 0 && (
        <>
          <p className="font-semibold text-gray-900 text-sm mb-3">Packages &amp; Pricing</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {visiblePackages.map(({ id, title, description, price, popular }) => (
              <div key={id} className="border border-gray-100 rounded-xl p-3 relative">
                {popular && (
                  <span className="absolute -top-2 left-3 text-[9px] font-semibold bg-amber-400 text-white px-2 py-0.5 rounded-full">
                    POPULAR
                  </span>
                )}
                <p className="font-semibold text-gray-900 text-xs truncate">{title || "Package"}</p>
                <p className="text-[10px] text-gray-400 line-clamp-2">{description}</p>
                <p className="font-bold text-primary text-sm mt-1">{price || "—"}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CTA footer */}
      <div className="rounded-2xl p-4 text-center" style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}>
        <p className="font-bold text-white text-sm">Ready to Start Collaborating?</p>
        <p className="text-white/80 text-[10px] mt-0.5 mb-3">
          Let&apos;s create something amazing together. Send an offer or get in touch right now.
        </p>
        <div className="flex gap-2 justify-center">
          <button className="bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
            Send Collaboration Offer
          </button>
          <button className="bg-white text-violet-700 text-xs font-medium px-3 py-1.5 rounded-lg">
            Contact Creator
          </button>
        </div>
      </div>
    </div>
  );
}
