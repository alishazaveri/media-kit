export function NavBar({
  initials,
  primaryColor,
  accentColor,
  secondaryColor,
}: {
  initials: string;
  primaryColor: string;
  accentColor: string;
  secondaryColor: string;
}) {
  return (
    <nav
      className={`sticky top-0 z-50 backdrop-blur-sm border-b border-gray-100 px-0 md:px-8 py-4 `}
      style={{ backgroundColor: `${primaryColor}BF` }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
        <span className="font-black text-xl text-gray-900 tracking-[-0.05em]">
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
              className="  text-gray-700 hover:text-[var(--accent)] transition-colors "
              style={{ "--accent": accentColor } as React.CSSProperties}
            >
              {label}
            </a>
          ))}
        </div>
        <button className="bg-gray-900 text-white text-xs font-bold tracking-[.1rem]  rounded-full hover:bg-gray-700 transition-colors px-4 py-2 text-[11px]">
          CONTACT
        </button>
      </div>
    </nav>
  );
}
