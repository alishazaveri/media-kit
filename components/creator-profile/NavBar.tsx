import { buildMailto } from "./mailtoLink";

export function NavBar({
  initials,
  name,
  email,
  baseColor,
  accentColor,
  contrastColor,
  darkMode = false,
}: {
  initials: string;
  name: string;
  email: string;
  baseColor: string;
  accentColor: string;
  contrastColor: string;
  darkMode?: boolean;
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
        <a
          href={email ? buildMailto(email, name) : undefined}
          className={`${darkMode ? "text-gray-900" : "text-white"} text-xs font-bold tracking-[.1rem] rounded-full transition-colors px-4 py-2 text-[11px]`}
          style={{ backgroundColor: darkMode ? accentColor : contrastColor }}
        >
          CONTACT
        </a>
      </div>
    </nav>
  );
}
