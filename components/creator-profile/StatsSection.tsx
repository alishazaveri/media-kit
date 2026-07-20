"use client";
import { useEffect, useRef, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fmt, type Stats } from "./types";

export function StatsSection({
  stats,
  baseColor,
  accentColor,
  contrastColor,
  darkMode = false,
}: {
  stats: Stats;
  baseColor: string;
  accentColor: string;
  contrastColor: string;
  darkMode?: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          const start = performance.now();
          const duration = 1500;
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            setProgress(1 - Math.pow(1 - t, 3));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const reachEntries = Object.entries(stats.reach_daily_30d ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));

  const DUMMY_REACH = [
    800, 1200, 950, 1400, 1100, 1800, 1350, 900, 1650, 2100, 1750, 1300, 1950,
    1600, 1100, 1850, 2200, 1700, 1400, 1950, 2300, 1800, 1500, 2100, 1750,
    1200, 1950, 2400, 2000, 1600,
  ].map((value) => ({ date: "", value }));
  const chartData = reachEntries.length > 0 ? reachEntries : DUMMY_REACH;

  const maxReach = Math.max(...chartData.map((d) => d.value), 1);
  const maxY = Math.ceil(maxReach * 1.15);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Only show date ticks for real data — dummy entries all have date="" which
  // causes Recharts to generate duplicate tick keys
  const xTicks =
    reachEntries.length > 0
      ? chartData
          .map((d) => d.date)
          .filter((_, i, arr) => i % 5 === 0 || i === arr.length - 1)
      : [];

  const followersTarget = stats.followers ?? 1_200_000;
  const engagementTarget = stats.engagement;
  const growthTarget = stats.growth ?? 42_000;

  const bigStats = [
    {
      value: fmt(Math.round(followersTarget * progress)),
      label: "FOLLOWERS",
      blue: true,
    },
    {
      value:
        engagementTarget != null
          ? `${(engagementTarget * progress).toFixed(1)}%`
          : "—",
      label: "AVG. ENGAGEMENT",
      blue: false,
    },
    {
      value: fmt(Math.round(growthTarget * progress)),
      label: "WEEKLY GROWTH",
      blue: false,
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="stats"
      className="px-4 py-12 md:px-8 md:py-20"
      style={{ backgroundColor: baseColor }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 md:gap-12 md:items-start">
        {/* Left: big numbers */}
        <div className="flex flex-col justify-center md:w-1/3 mx-4">
          <div style={{ opacity: 1, transform: "none" }} className="mb-10">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted">
              Impact Metrics
            </h2>
          </div>
          <div className="flex flex-wrap min-[400px]:flex-nowrap md:flex-col gap-y-4 min-[400px]:gap-y-0">
            {bigStats.map(({ value, label }, i) => (
              <div
                key={label}
                style={{ opacity: 1, transform: "none" }}
                className={`flex-1 min-w-[42%] min-[400px]:min-w-0 md:flex-none mb-0 md:mb-10 cursor-default min-[400px]:px-4 md:px-0 min-[400px]:first:pl-0 min-[400px]:last:pr-0 min-[400px]:border-r last:border-r-0 md:border-r-0 ${darkMode ? "border-white/10" : "border-[#1d293d]/10"}`}
              >
                <div className="font-display text-xl min-[425px]:text-2xl md:text-5xl font-extrabold tracking-tighter leading-none transition-transform hover:translate-x-2">
                  <span
                    style={{
                      color:
                        i > 0
                          ? darkMode
                            ? contrastColor
                            : "#1d293d"
                          : accentColor,
                    }}
                  >
                    {value}
                  </span>
                </div>
                <p
                  className={`text-[10px] lg:text-xs font-bold uppercase tracking-widest mt-2 ${darkMode ? "text-white/60" : "text-[#1d293d]/70"}`}
                >
                  {label}
                </p>
                <div
                  className={`hidden md:block w-full h-px mt-5 ${darkMode ? "bg-white/10" : "bg-[#1d293d]/10"}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Daily Reach card */}
        <div className="flex-1 min-w-0 bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-[#1d293d]/5">
          <div className="flex flex-row flex-wrap md:items-center justify-between gap-3 mb-6">
            <h2 className="font-display text-lg min-[425px]:text-2xl md:text-3xl font-bold">
              Daily Reach
            </h2>
            <span
              className="text-xs min-[425px]:font-bold font-semibold min-[425px]:px-3 min-[425px]:py-1.5 px-2 py-1 rounded-full flex items-center mb-0"
              style={{ color: accentColor, backgroundColor: baseColor }}
            >
              LAST 30 DAYS
            </span>
          </div>

          <div className="w-full">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="reachGradRc" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={accentColor}
                      stopOpacity={0.18}
                    />
                    <stop
                      offset="100%"
                      stopColor={accentColor}
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  ticks={xTicks}
                  tickFormatter={formatDate}
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, maxY]}
                  tickCount={8}
                  tickFormatter={fmt}
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #f0f0f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: 12,
                  }}
                  labelFormatter={(label) => formatDate(String(label ?? ""))}
                  formatter={(value) => [
                    fmt(typeof value === "number" ? value : null),
                    "Reach",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={accentColor}
                  strokeWidth={2.5}
                  fill="url(#reachGradRc)"
                  dot={false}
                  activeDot={{ r: 4, fill: accentColor, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
