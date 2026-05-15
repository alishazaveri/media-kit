interface HeroSectionProps {
  firstName: string;
  lastName: string;
  initial: string;
  name: string;
  handle: string;
  tagline?: string;
  location?: string;
  profilePic?: string | null;
  availableForCollabs: boolean;
  nicheTags: string[];
}

export function HeroSection({
  firstName,
  lastName,
  initial,
  name,
  handle,
  tagline,
  location,
  profilePic,
  availableForCollabs,
  nicheTags,
}: HeroSectionProps) {
  return (
    <section className="bg-[#E8F5F0] px-8 py-20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-20">
        {/* Photo */}
        <div className="relative shrink-0">
          <div className="w-72 h-[400px] rounded-[2.5rem] overflow-hidden shadow-lg bg-amber-100">
            {profilePic ? (
              <img src={profilePic} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-200 text-7xl font-black text-amber-500">
                {initial}
              </div>
            )}
          </div>
          {availableForCollabs && (
            <div className="absolute bottom-8 -right-3 bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-xl whitespace-nowrap">
              Open for Q3 {/* [DUMMY: no quarter field yet] */}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Available row */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <span className="text-xs font-bold tracking-[0.18em] text-blue-600 uppercase">
              {availableForCollabs ? "Available Worldwide" : "Not Currently Available"}
            </span>
            <div className="h-px w-10 bg-blue-400 shrink-0" />
            <span className="text-sm text-gray-500">
              she/her · {location || "Worldwide"} {/* [DUMMY: pronouns field] */}
            </span>
          </div>

          {/* Name */}
          <h1 className="text-6xl font-black leading-none mb-5 flex items-center gap-3 flex-wrap">
            <span className="text-gray-900">{firstName || "Creator"}</span>
            {lastName && <span className="text-blue-600">{lastName}</span>}
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="shrink-0">
              <circle cx="22" cy="22" r="22" fill="#3B5BDB" />
              <path
                d="M13 22l6.5 6.5L31 15"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </h1>

          {/* Tagline */}
          <p className="text-lg text-gray-600 leading-relaxed mb-7 max-w-xl">
            {tagline || "Your tagline will appear here"}
          </p>

          {/* Tags */}
          <div className="flex items-center gap-2.5 flex-wrap mb-8">
            <span className="flex items-center gap-1.5 border border-gray-200 bg-white rounded-full px-4 py-2 text-sm text-gray-700">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="#374151" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="4" stroke="#374151" strokeWidth="1.5" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="#374151" />
              </svg>
              @{handle || "yourhandle"}
            </span>

            {nicheTags.length > 0 && (
              <span className="border border-gray-200 bg-white rounded-full px-4 py-2 text-sm text-gray-700">
                {nicheTags.slice(0, 2).join(" · ")}
              </span>
            )}

            {location && (
              <span className="flex items-center gap-1.5 border border-gray-200 bg-white rounded-full px-4 py-2 text-sm text-gray-700">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#374151">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                {location}
              </span>
            )}

            {/* [DUMMY: no languages field yet] */}
            <span className="flex items-center gap-1.5 border border-gray-200 bg-white rounded-full px-4 py-2 text-sm text-gray-700">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 8l6 6M4 14l6-6 2-3M2 5h7M10 2v3M22 22l-5-10-5 10M14 18h6"
                  stroke="#374151"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              EN · FR · KR
            </span>
          </div>

          {/* CTA buttons */}
          <div className="flex items-center gap-4 flex-wrap">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-full flex items-center gap-2 transition-colors text-sm tracking-wide">
              Work With Me
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 17L17 7M17 7H7M17 7v10"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="border-2 border-gray-900 text-gray-900 font-bold px-8 py-4 rounded-full hover:bg-gray-900 hover:text-white transition-colors text-sm tracking-wide">
              Media Kit PDF
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
