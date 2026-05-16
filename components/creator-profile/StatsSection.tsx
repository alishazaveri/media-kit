import { fmt, type Stats } from "./types";

export function StatsSection({
  stats,
  primaryColor,
  accentColor,
  secondaryColor,
}: {
  stats: Stats;
  primaryColor: string;
  accentColor: string;
  secondaryColor: string;
}) {
  const endVal = stats.followers ?? 1_200_000;
  const startVal = Math.round(endVal * 0.575);
  const ratios = [0, 0.09, 0.19, 0.28, 0.39, 0.51, 0.64, 0.8, 1.0];
  const data = ratios.map((r) =>
    Math.round(startVal + (endVal - startVal) * r),
  );
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
  ];
  const maxY = Math.ceil((endVal * 1.17) / 350_000) * 350_000;
  const yLabels = [0, 350_000, 700_000, 1_050_000, 1_400_000].filter(
    (v) => v <= maxY + 1,
  );
  const W = 620,
    H = 160;
  const px = (i: number) => ((i / (data.length - 1)) * W).toFixed(1);
  const py = (v: number) => (H - (v / maxY) * H).toFixed(1);
  const pts = data.map((v, i) => `${px(i)},${py(v)}`);
  const linePath = `M ${pts.join(" L ")}`;
  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`;

  const bigStats = [
    { value: fmt(stats.followers), label: "ACTIVE COMMUNITY", blue: true },
    {
      value: stats.engagement != null ? `${stats.engagement}%` : "—",
      label: "AVG. ENGAGEMENT",
      blue: false,
    },
    {
      value: stats.growth != null ? fmt(stats.growth) : "42K", // [DUMMY if no growth data]
      label: "WEEKLY GROWTH",
      blue: false,
    },
  ];

  const metricCards = [
    {
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="#6B7280" strokeWidth="1.5" />
          <path
            d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"
            stroke="#6B7280"
            strokeWidth="1.5"
          />
        </svg>
      ),
      label: "AVG VIEWS",
      value: fmt(stats.avgViews),
    },
    {
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            stroke="#6B7280"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      label: "AVG LIKES",
      value: fmt(stats.avgReach ? Math.round(stats.avgReach * 0.13) : null), // [DUMMY approximation]
    },
    {
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            stroke="#6B7280"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      label: "COMMENTS",
      value: "—", // [DUMMY: no comments aggregate]
    },
    {
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path
            d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
            stroke="#6B7280"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      label: "SAVES",
      value: "—", // [DUMMY: no saves field]
    },
    {
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <circle cx="18" cy="5" r="3" stroke="#6B7280" strokeWidth="1.5" />
          <circle cx="6" cy="12" r="3" stroke="#6B7280" strokeWidth="1.5" />
          <circle cx="18" cy="19" r="3" stroke="#6B7280" strokeWidth="1.5" />
          <path
            d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"
            stroke="#6B7280"
            strokeWidth="1.5"
          />
        </svg>
      ),
      label: "SHARES",
      value: "—", // [DUMMY: no shares field]
    },
  ];

  return (
    <section
      id="stats"
      className="px-4 py-12 md:px-8 md:py-20"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 md:gap-12 items-start">
        {/* Left: big numbers */}
        <div className="md:w-64 shrink-0">
          <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-4 md:mb-6">
            Impact Metrics
          </p>
          <div className="grid grid-cols-3 md:grid-cols-1 gap-4 md:gap-0 md:space-y-6">
            {bigStats.map(({ value, label, blue }, i) => (
              <div key={label}>
                {i > 0 && (
                  <div className="hidden md:block border-t border-gray-300/50 mb-6" />
                )}
                <p
                  className={`text-3xl md:text-5xl font-black leading-none mb-1 md:mb-2 ${blue ? "" : "text-gray-900"}`}
                  style={blue ? { color: accentColor } : undefined}
                >
                  {value}
                </p>
                <p className="text-[10px] md:text-xs font-bold tracking-[0.15em] text-gray-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Follower Growth card */}
        <div className="flex-1 bg-white rounded-3xl p-4 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="font-black text-gray-900 text-2xl">
              Follower Growth
            </h2>
            <div className="flex items-center gap-2">
              <span
                className="bg-blue-100 text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ color: accentColor }}
              >
                YTD +97% {/* [DUMMY: no YTD data] */}
              </span>
              <span className="bg-green-100 text-green-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M23 6l-9.5 9.5-5-5L1 18"
                    stroke="#16A34A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                TRENDING UP {/* [DUMMY] */}
              </span>
            </div>
          </div>

          {/* SVG line chart */}
          <div className="mb-6">
            <div className="flex gap-3">
              <div className="flex flex-col-reverse justify-between text-[10px] text-gray-400 pr-1 h-40 shrink-0 text-right w-12">
                {yLabels.map((v) => (
                  <span key={v}>{v === 0 ? "0K" : `${v / 1000}K`}</span>
                ))}
              </div>
              <div className="flex-1">
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  className="w-full h-40"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={accentColor}
                        stopOpacity="0.18"
                      />
                      <stop
                        offset="100%"
                        stopColor={accentColor}
                        stopOpacity="0.02"
                      />
                    </linearGradient>
                  </defs>
                  <path d={areaPath} fill="url(#growthGrad)" />
                  <path
                    d={linePath}
                    fill="none"
                    stroke={accentColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  {months.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {metricCards.map(({ icon, label, value }) => (
              <div
                key={label}
                className="bg-gray-50 rounded-2xl p-3 flex flex-col gap-1"
              >
                <div className="flex items-center gap-1 text-gray-400">
                  {icon}
                  <span className="text-[9px] font-bold tracking-wider uppercase">
                    {label}
                  </span>
                </div>
                <p className="font-black text-gray-900 text-lg leading-none">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
