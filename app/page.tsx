const APP_URL = "/onboarding";

/* ─── SVG Icons ─── */

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1L8.2 5.2L12.5 7L8.2 8.8L7 13L5.8 8.8L1.5 7L5.8 5.2L7 1Z"
        fill="white"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0 mt-0.5"
    >
      <circle cx="8" cy="8" r="8" fill="#0D9488" fillOpacity="0.12" />
      <path
        d="M4.5 8L6.8 10.3L11.5 5.5"
        stroke="#0D9488"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrendingUpIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <path
        d="M1.5 10.5L5 7L8 9.5L12.5 4"
        stroke="#16A34A"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 4H12.5V7"
        stroke="#16A34A"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon({
  size = 14,
  color = "#0D9488",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="4.5" r="2.5" stroke={color} strokeWidth="1.5" />
      <path
        d="M1.5 13C1.5 10.5 4 8.5 7 8.5C10 8.5 12.5 10.5 12.5 13"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LightningIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M11.5 2.5L5 10.5H10L8.5 17.5L15 9.5H10L11.5 2.5Z"
        fill="#0D9488"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M1.5 10C1.5 10 4.5 4 10 4C15.5 4 18.5 10 18.5 10C18.5 10 15.5 16 10 16C4.5 16 1.5 10 1.5 10Z"
        stroke="#0D9488"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="10" r="2.5" stroke="#0D9488" strokeWidth="1.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 2L4 5V10C4 13.8 6.6 17.3 10 18.5C13.4 17.3 16 13.8 16 10V5L10 2Z"
        stroke="#0D9488"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="#0D9488" strokeWidth="1.5" />
      <path
        d="M2 10H18"
        stroke="#0D9488"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 2C10 2 7 5.5 7 10C7 14.5 10 18 10 18"
        stroke="#0D9488"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 2C10 2 13 5.5 13 10C13 14.5 10 18 10 18"
        stroke="#0D9488"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="#F59E0B">
      <path d="M7 1L8.5 5.2L13 5.7L9.7 8.8L10.8 13.2L7 10.9L3.2 13.2L4.3 8.8L1 5.7L5.5 5.2L7 1Z" />
    </svg>
  );
}

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <StarIcon key={i} />
      ))}
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="#16A34A" fillOpacity="0.15" />
      <path
        d="M4.5 8L6.8 10.3L11.5 5.5"
        stroke="#16A34A"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="6" width="2.5" height="5" rx="0.5" fill="#16A34A" />
      <rect x="4.75" y="3" width="2.5" height="8" rx="0.5" fill="#16A34A" />
      <rect x="8.5" y="1" width="2.5" height="10" rx="0.5" fill="#16A34A" />
    </svg>
  );
}

function PercentIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="3.5" cy="3.5" r="2" stroke="#0D9488" strokeWidth="1.2" />
      <circle cx="8.5" cy="8.5" r="2" stroke="#0D9488" strokeWidth="1.2" />
      <path
        d="M9.5 2.5L2.5 9.5"
        stroke="#0D9488"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Phone Mockup ─── */

function PhoneMockup() {
  return (
    <div className="relative flex justify-center">
      {/* Floating badge — engagement (top right) */}
      <div className="absolute -top-3 right-0 z-20 bg-white rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2 border border-gray-100">
        <div className="w-7 h-7 bg-green-50 rounded-full flex items-center justify-center">
          <TrendingUpIcon />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-900 leading-none">8.5%</p>
          <p className="text-[10px] text-gray-400 leading-none mt-0.5">
            Engagement
          </p>
        </div>
      </div>

      {/* Floating badge — followers (right middle) */}
      <div className="absolute top-1/3 -right-4 z-20 bg-white rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2 border border-gray-100">
        <div className="w-7 h-7 bg-primary-50 rounded-full flex items-center justify-center">
          <UserIcon size={13} />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-900 leading-none">485K</p>
          <p className="text-[10px] text-gray-400 leading-none mt-0.5">
            Followers
          </p>
        </div>
      </div>

      {/* Floating badge — brand deal (bottom left) */}
      <div className="absolute -bottom-4 -left-4 z-20 bg-white rounded-2xl shadow-lg px-3 py-2.5 flex items-center gap-2 border border-gray-100">
        <div className="w-7 h-7 bg-green-50 rounded-full flex items-center justify-center">
          <CheckCircleIcon />
        </div>
        <div>
          <p className="text-[10px] text-gray-400 leading-none">Brand deal!</p>
          <p className="text-xs font-bold text-gray-900 leading-none mt-0.5">
            Now: $3,000
          </p>
        </div>
      </div>

      {/* Phone frame */}
      <div className="relative w-60 rounded-[2.8rem] bg-gray-900 p-[3px] shadow-2xl shadow-gray-400/40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-2xl z-10" />
        <div className="rounded-[2.6rem] overflow-hidden bg-white">
          {/* Screen header */}
          <div className="bg-primary h-20 relative flex items-start justify-end p-3">
            <span className="bg-white/25 text-white text-[9px] font-medium px-2 py-0.5 rounded-full mt-5">
              ● Open to work
            </span>
          </div>

          {/* Profile card */}
          <div className="px-4 pb-4">
            {/* Avatar overlapping header */}
            <div className="-mt-6 mb-2">
              <div className="w-14 h-14 bg-rose-400 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-md">
                SJ
              </div>
            </div>

            <h3 className="font-bold text-xs text-gray-900">Sarah Johnson</h3>
            <p className="text-[10px] text-gray-400">@sarahjcreates</p>
            <div className="flex items-center gap-1 mt-0.5">
              <p className="text-[10px] text-gray-600">
                Lifestyle &amp; Wellness Creator
              </p>
              <span className="text-[10px]">✓</span>
            </div>

            {/* Tags */}
            <div className="flex gap-1 mt-2 flex-wrap">
              {["Lifestyle", "Wellness", "Beauty"].map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 mt-3 text-center divide-x divide-gray-100">
              <div className="pr-2">
                <div className="flex justify-center mb-0.5">
                  <TrendingUpIcon />
                </div>
                <p className="font-bold text-[11px] text-gray-900">485K</p>
                <p className="text-[9px] text-gray-400">Followers</p>
              </div>
              <div className="px-2">
                <div className="flex justify-center mb-0.5">
                  <BarChartIcon />
                </div>
                <p className="font-bold text-[11px] text-gray-900">250K</p>
                <p className="text-[9px] text-gray-400">Avg Views</p>
              </div>
              <div className="pl-2">
                <div className="flex justify-center mb-0.5">
                  <PercentIcon />
                </div>
                <p className="font-bold text-[11px] text-gray-900">8.5%</p>
                <p className="text-[9px] text-gray-400">Engagement</p>
              </div>
            </div>

            {/* Content thumbnails */}
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mt-3">
              Content
            </p>
            <div className="flex gap-1.5 mt-1.5">
              <div className="w-16 h-16 bg-pink-300 rounded-xl" />
              <div className="w-16 h-16 bg-teal-300 rounded-xl" />
              <div className="w-16 h-16 bg-amber-300 rounded-xl" />
            </div>

            {/* Brand Collaborations */}
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mt-3">
              Brand Collaborations
            </p>
            <div className="flex items-center justify-between mt-1.5 bg-gray-50 rounded-xl p-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center text-white text-[9px] font-bold">
                  N
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-900">
                    Nike
                  </p>
                  <p className="text-[9px] text-gray-400">3-week campaign</p>
                </div>
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">
                +38%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sections ─── */

function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <SparkleIcon />
          </div>
          <span className="font-bold text-gray-900 text-2xl">cloutcheck</span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-7">
          <a
            href="#sample"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Sample Profile
          </a>
          <a
            href="#features"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Features
          </a>
          <a
            href="#reviews"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Reviews
          </a>
          <a
            href="#sample"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
          >
            View sample <span className="text-xs">›</span>
          </a>
        </nav>

        {/* CTA */}
        <a
          href={APP_URL}
          className="bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
        >
          Create Your Page
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-hero-bg pt-16 pb-20">
      <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
        {/* Left content */}
        <div className="flex-1 max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-primary-100 text-primary text-xs font-medium px-3.5 py-1.5 rounded-full mb-6 shadow-sm">
            <span className="text-primary text-sm">✦</span>
            Build your creator portfolio in 2 minutes
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-black text-gray-900 leading-[1.05] tracking-tight mb-3">
            Your brand deal
            <br />
            <span className="text-primary">magnet.</span>
          </h1>

          <p className="text-gray-500 text-base leading-relaxed mb-7">
            Create a stunning creator portfolio page that brands love. Showcase
            your stats, content, and pricing — all in one beautiful shareable
            link.
          </p>

          {/* Checklist */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mb-8">
            {[
              "No coding or design skills needed",
              "Real-time preview as you build",
              "Payment required only to go public",
              "Cancel or update anytime",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckIcon />
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-4 mb-8">
            <a
              href={APP_URL}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold text-sm px-5 py-3 rounded-full transition-colors shadow-md shadow-primary/25"
            >
              <span className="text-base">✦</span>
              Create Your Page — Free
              <span>→</span>
            </a>
            <a
              href="#sample"
              className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-sm px-5 py-3 rounded-full transition-colors"
            >
              <span className="text-xs text-gray-400">▶</span>
              View Sample
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-5">
            <div className="flex -space-x-2">
              {[
                "bg-rose-400",
                "bg-violet-400",
                "bg-amber-400",
                "bg-teal-400",
              ].map((color, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 ${color} rounded-full border-2 border-white`}
                />
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                12,000+ creators
              </p>
              <p className="text-xs text-gray-400">already using CreatorPage</p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <div className="flex items-center gap-1">
                <Stars />
                <span className="text-sm font-bold text-gray-900">4.9/5</span>
              </div>
              <p className="text-xs text-gray-400">rating</p>
            </div>
          </div>
        </div>

        {/* Right — phone mockup */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}

const stats = [
  { value: "12K+", label: "Active creators" },
  { value: "$2.4M", label: "Deals facilitated" },
  { value: "4.9★", label: "Average rating" },
  { value: "2 min", label: "Setup time" },
  { value: "50+", label: "Brand categories" },
];

function Stats() {
  return (
    <section className="border-y border-gray-100 bg-white py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-black text-gray-900">{value}</p>
              <p className="text-sm text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: <LightningIcon />,
    title: "Ready in 2 mins",
    desc: "Pre-filled with smart defaults pulled straight from your Instagram.",
  },
  {
    icon: <EyeIcon />,
    title: "Live preview",
    desc: "See your page exactly as brands will see it — as you build it.",
  },
  {
    icon: <ShieldIcon />,
    title: "Professional link",
    desc: "Share one beautiful URL with brands instantly — no PDF attachments.",
  },
  {
    icon: <GlobeIcon />,
    title: "Always online",
    desc: "Hosted on our infrastructure. Always fast, always available.",
  },
];

function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-3">
            Everything you need to land brand deals
          </h2>
          <p className="text-gray-400 text-base">
            Built for creators who want results, not complexity.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="border border-gray-100 rounded-2xl p-6 hover:border-primary-100 hover:shadow-md hover:shadow-primary/5 transition-all"
            >
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                {icon}
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote: "Got my first brand deal within a week of creating my page!",
    name: "Maya K.",
    role: "Fashion Creator",
    followers: "248K",
  },
  {
    quote: "Looks better than my website ever did. Brands love it.",
    name: "James T.",
    role: "Tech Reviewer",
    followers: "180K",
  },
  {
    quote: "Brands finally take me seriously. My inquiries tripled.",
    name: "Sofia L.",
    role: "Fitness Coach",
    followers: "92K",
  },
];

function Testimonials() {
  return (
    <section id="reviews" className="py-20 bg-section-alt">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-black text-gray-900 text-center mb-12">
          What creators say
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map(({ quote, name, role, followers }) => (
            <div
              key={name}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <Stars />
              <p className="text-gray-700 text-sm leading-relaxed mt-3 mb-5">
                &ldquo;{quote}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{name}</p>
                  <p className="text-xs text-gray-400">{role}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-primary-50 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                  <UserIcon size={11} />
                  {followers} followers
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 bg-hero-bg">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-4">
          Your creator page is{" "}
          <span className="text-primary">one click away</span>
        </h2>
        <p className="text-gray-400 text-base mb-8">
          Join 12,000+ creators who use CreatorPage to land more brand deals
          with less effort.
        </p>
        <a
          href={APP_URL}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold text-sm px-6 py-3.5 rounded-full transition-colors shadow-md shadow-primary/25"
        >
          <span className="text-base">✦</span>
          Create Your Free Page
          <span>→</span>
        </a>
        <p className="text-xs text-gray-400 mt-4">
          No credit card required · Free preview always
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <SparkleIcon />
          </div>
          <span className="font-bold text-gray-900 text-sm">CreatorPage</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          {["Privacy", "Terms", "Support"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              {link}
            </a>
          ))}
        </div>

        <p className="text-xs text-gray-400">© 2026 CreatorPage</p>
      </div>
    </footer>
  );
}

/* ─── Page ─── */

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Stats />
      <Features />
      <Testimonials />
      <CTASection />
      <Footer />
    </main>
  );
}
