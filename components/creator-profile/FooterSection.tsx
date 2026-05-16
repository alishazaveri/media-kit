export function FooterSection({
  handle,
  name,
  primaryColor,
  accentColor,
  secondaryColor,
}: {
  handle: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  secondaryColor: string;
}) {
  return (
    <section className="bg-white px-4 pt-16 pb-10 md:px-8 md:pt-24">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-xs font-bold tracking-[0.3em] text-gray-400 uppercase mb-8">
          Let&apos;s Create The Next Shift
        </p>
        <div className="flex items-center justify-center gap-4 mb-8">
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
              stroke={secondaryColor}
              strokeWidth="2"
            />
            <path
              d="M2 7l10 7 10-7"
              stroke={secondaryColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <a
            href={`mailto:hello@${handle || "creator"}.com`}
            className="font-black text-gray-900 transition-colors hover:text-[var(--accent)]"
            style={
              {
                "--accent": accentColor,
                fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
                lineHeight: 1.1,
              } as React.CSSProperties
            }
          >
            hello@{handle || "creator"}.com {/* [DUMMY: no email field] */}
          </a>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 flex-wrap">
          <span>Booking via form or email</span>
          <span className="text-gray-300">•</span>
          <span>Manager: Lina Park · lina@hellostudio.co</span>{" "}
          {/* [DUMMY: no manager field] */}
          <span className="text-gray-300">•</span>
          <span>WhatsApp on request</span> {/* [DUMMY] */}
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">
          © 2026 {name} Studio. Built with intention. {/* [DUMMY: copyright] */}
        </p>
      </div>
    </section>
  );
}
