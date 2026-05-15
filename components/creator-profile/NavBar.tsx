export function NavBar({ initials }: { initials: string }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-8 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <span className="font-black text-xl text-gray-900 tracking-tight">
          {initials || "MK"}
        </span>
        <div className="hidden md:flex items-center gap-10">
          {[
            { label: "STATS", href: "#stats" },
            { label: "AUDIENCE", href: "#audience" },
            { label: "WORK", href: "#work" },
            { label: "PARTNER", href: "#partner" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-xs font-semibold tracking-widest text-gray-700 hover:text-blue-600 transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
        <button className="bg-gray-900 text-white text-xs font-bold tracking-widest px-6 py-2.5 rounded-full hover:bg-gray-700 transition-colors">
          CONTACT
        </button>
      </div>
    </nav>
  );
}
