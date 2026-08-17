import { buildMailto } from "./mailtoLink";

export function FooterSection({
  handle,
  name,
  email,
  accentColor,
  contrastColor,
  showEmail = true,
  isPreview = false,
  onUpgradeClick,
}: {
  handle: string;
  name: string;
  email?: string;
  accentColor: string;
  contrastColor: string;
  showEmail?: boolean;
  isPreview?: boolean;
  onUpgradeClick?: () => void;
}) {
  const showEmailSection = showEmail || isPreview;

  return (
    <section className={`bg-white px-4 pb-10 md:px-8 ${showEmailSection ? "pt-16 md:pt-24" : "pt-8"}`}>
      {showEmailSection && (
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.3em] text-gray-400 uppercase mb-8">
            Let&apos;s Create The Next Shift
          </p>
          <div className="flex items-start md:items-center justify-center gap-4 mb-8">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              className="shrink-0"
            >
              <rect
                x="2"
                y="4"
                width="20"
                height="16"
                rx="2"
                stroke={showEmail ? contrastColor : "#d1d5db"}
                strokeWidth="2"
              />
              <path
                d="M2 7l10 7 10-7"
                stroke={showEmail ? contrastColor : "#d1d5db"}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {showEmail ? (
              <a
                href={email ? buildMailto(email, name) : undefined}
                className="font-black text-gray-900 transition-colors hover:text-[var(--accent)] break-all"
                style={
                  {
                    "--accent": accentColor,
                    fontSize: "clamp(1.5rem, 4vw, 2.8rem)",
                    lineHeight: 1.1,
                  } as React.CSSProperties
                }
              >
                {email || `hello@${handle || "creator"}.com`}
              </a>
            ) : (
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <span
                  className="font-black text-gray-300 break-all select-none"
                  style={{ fontSize: "clamp(1.5rem, 4vw, 2.8rem)", lineHeight: 1.1 }}
                >
                  {email || `hello@${handle || "creator"}.com`}
                </span>
                <button
                  type="button"
                  onClick={onUpgradeClick}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md hover:bg-amber-100 transition-colors cursor-pointer shrink-0"
                >
                  <svg width="9" height="9" viewBox="0 0 16 16" fill="none" className="shrink-0">
                    <path d="M8 1a2 2 0 0 1 2 2v2H6V3a2 2 0 0 1 2-2zm3 4V3A3 3 0 1 0 5 3v2H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2z" fill="currentColor"/>
                  </svg>
                  Pro
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <div className={`max-w-7xl mx-auto pt-6 border-t border-gray-100 text-center ${showEmail ? "mt-16" : ""}`}>
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()}{" "}
          <a href="/" className="hover:underline">Kloot</a>
          {" "}X {name}.
        </p>
      </div>
    </section>
  );
}
