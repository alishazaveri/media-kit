import { buildMailto } from "./mailtoLink";

export function NavBar({
  initials,
  name,
  email,
  baseColor,
  accentColor,
  contrastColor,
  darkMode = false,
  showContact = true,
  onUpgradeClick,
  isPreview = false,
}: {
  initials: string;
  name: string;
  email: string;
  baseColor: string;
  accentColor: string;
  contrastColor: string;
  darkMode?: boolean;
  showContact?: boolean;
  onUpgradeClick?: () => void;
  isPreview?: boolean;
}) {
  return (
    <nav
      className={`sticky top-0 z-50 backdrop-blur-sm border-b border-gray-100 px-0 md:px-8 py-4 `}
      style={{ backgroundColor: `${baseColor}BF` }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
        <span className={`font-black text-xl tracking-[-0.05em] ${darkMode ? "text-white" : "text-gray-900"}`}>
          {initials?.split("").length > 1 ? (
            <>
              {initials.split("")[0]}
              <span style={{ color: accentColor }}>
                {initials.split("")[1]}
              </span>
            </>
          ) : (
            initials || ""
          )}
        </span>
        <div className="hidden md:flex items-center gap-8 text-xs font-bold tracking-[0.18em]">
          {[
            { label: "STATS", href: "#stats" },
            { label: "AUDIENCE", href: "#audience" },
            { label: "WORK", href: "#work" },
            { label: "PARTNER", href: "#partner" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className={`${darkMode ? "text-gray-200" : "text-gray-700"} hover:text-[var(--accent)] transition-colors`}
              style={{ "--accent": accentColor } as React.CSSProperties}
            >
              {label}
            </a>
          ))}
        </div>
        {showContact ? (
          email && (
            <a
              href={buildMailto(email, name)}
              className={`${darkMode ? "text-gray-900" : "text-white"} text-xs font-bold tracking-[.1rem] rounded-full transition-colors px-4 py-2 text-[11px]`}
              style={{ backgroundColor: darkMode ? accentColor : contrastColor }}
            >
              CONTACT
            </a>
          )
        ) : isPreview ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold tracking-[.1rem] rounded-full px-4 py-2 text-[11px] bg-gray-100 text-gray-300 cursor-not-allowed select-none">
              CONTACT
            </span>
            <button
              type="button"
              onClick={onUpgradeClick}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <svg width="9" height="9" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M8 1a2 2 0 0 1 2 2v2H6V3a2 2 0 0 1 2-2zm3 4V3A3 3 0 1 0 5 3v2H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2z" fill="currentColor"/>
              </svg>
              Pro
            </button>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
