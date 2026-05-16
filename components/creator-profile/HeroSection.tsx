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
  primaryColor,
  accentColor,
  secondaryColor,
}: HeroSectionProps & {
  primaryColor: string;
  accentColor: string;
  secondaryColor: string;
}) {
  return (
    <section className="" style={{ backgroundColor: primaryColor }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-10 pt-12 md:pt-20 px-6 pb-20 ">
        {/* Photo */}
        <div className="relative shrink-0">
          <div className="relative w-64 md:w-80 aspect-[4/5] bg-white rounded-[3rem] shadow-2xl overflow-hidden ring-8 ring-white/60">
            {profilePic ? (
              <img
                src={profilePic}
                alt={name}
                width={800}
                height={1024}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-200 text-7xl font-black text-amber-500">
                {initial}
              </div>
            )}
          </div>
          {/* {availableForCollabs && (
            <div
              className="absolute bottom-6 -right-2 md:bottom-8 md:-right-3 text-white text-sm font-bold px-4 py-2 md:px-5 md:py-2.5 rounded-full shadow-xl whitespace-nowrap"
              style={{ backgroundColor: accentColor }}
            >
              Open for Q3 
            </div>
          )} */}
        </div>

        {/* Info */}
        <div className="flex-1 mb-2">
          {/* Available row */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <span
              className="text-xs font-bold tracking-[0.25em] uppercase"
              style={{ color: accentColor }}
            >
              {availableForCollabs
                ? "Available for Collab"
                : "Not Currently Available"}
            </span>
            <div
              className="h-px w-14 shrink-0"
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-sm text-gray-500">
              she/her · {location || "Worldwide"}{" "}
              {/* [DUMMY: pronouns field] */}
            </span>
          </div>

          {/* Name */}
          <h1
            className="text-5xl md:text-8xl font-black leading-[0.85] mb-5 flex items-center gap-3 flex-wrap tracking-[-0.05em]"
            style={{ fontFamily: "Outfit,ui-sans-serif,system-ui,sans-serif" }}
          >
            <span className="text-gray-900">{firstName || "Creator"}</span>
            {lastName && <span style={{ color: accentColor }}>{lastName}</span>}
          </h1>

          {/* Tagline */}
          <p className="text-lg text-gray-600 leading-relaxed mb-6 max-w-xl whitespace-pre-line">
            {tagline || "Your tagline will appear here"}
          </p>

          {/* Tags */}
          <div className="flex items-center gap-2.5 flex-wrap mb-6 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#1d293d]/5 text-[#1d293d]/80 ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="5"
                  stroke="#374151"
                  strokeWidth="1.5"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  stroke="#374151"
                  strokeWidth="1.5"
                />
                <circle cx="17.5" cy="6.5" r="1.5" fill="#374151" />
              </svg>
              @{handle || "yourhandle"}
            </span>

            {nicheTags.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#1d293d]/5 text-[#1d293d]/80 text-xs">
                {nicheTags.slice(0, 2).join(" · ")}
              </span>
            )}

            {location && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#1d293d]/5 text-[#1d293d]/80  text-xs">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#374151">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                {location}
              </span>
            )}

            {/* [DUMMY: no languages field yet] */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#1d293d]/5 text-[#1d293d]/80  text-xs">
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              style={
                {
                  "--primary": primaryColor,
                  "--secondary": secondaryColor,
                  "--accent": accentColor,
                  "--accent-shadow": `color-mix(in srgb, ${accentColor} 75%, black)`,
                  backgroundColor: accentColor,
                } as React.CSSProperties
              }
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-[0_8px_0_var(--accent-shadow)] hover:translate-y-0.5 hover:shadow-[0_4px_0_var(--accent-shadow)] active:translate-y-1 active:shadow-none transition-all"
            >
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
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-surface border border-[#1d293d]/10 text-[#1d293d] font-bold text-sm hover:bg-mint-pill transition-colors">
              Media Kit PDF
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
