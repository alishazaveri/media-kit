"use client";
import dynamic from "next/dynamic";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  ResponsiveContainer,
} from "recharts";
import { type AudienceInsights } from "./types";

const WorldAudienceMap = dynamic(
  () =>
    import("./WorldAudienceMap").then((m) => ({ default: m.WorldAudienceMap })),
  { ssr: false },
);

const DUMMY_AGE = [
  { label: "18-24", pct: 42 },
  { label: "25-34", pct: 33 },
  { label: "35-44", pct: 15 },
  { label: "45+", pct: 10 },
];

function AgeBarLabel(props: {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
  labelColor?: string;
}) {
  const { x = 0, y = 0, width = 0, value, labelColor } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 4}
      textAnchor="middle"
      fill={labelColor}
      fontSize={10}
      fontWeight={700}
    >
      {value}%
    </text>
  );
}

export function AudienceSection({
  insights,
  baseColor,
  accentColor,
  contrastColor,
  darkMode = false,
}: {
  insights: AudienceInsights;
  baseColor: string;
  accentColor: string;
  contrastColor: string;
  darkMode?: boolean;
}) {
  // ── Age distribution ────────────────────────────────────────────────────
  const ageRaw = insights.age_breakdown ?? [];
  const ageFiltered = ageRaw.filter((a) => a.label !== "13-17");
  const ageTotal = ageFiltered.reduce((s, a) => s + a.value, 0);
  const agePcts =
    ageTotal > 0
      ? ageFiltered
          .sort((a, b) => parseInt(a.label) - parseInt(b.label))
          .map((a) => ({
            label: a.label,
            pct: Math.round((a.value / ageTotal) * 100),
          }))
      : DUMMY_AGE;

  const peakAge = agePcts.reduce((a, b) => (a.pct >= b.pct ? a : b));
  const genZMillPct =
    (agePcts.find((a) => a.label === "18-24")?.pct ?? 0) +
    (agePcts.find((a) => a.label === "25-34")?.pct ?? 0);
  const maxAgePct = Math.max(...agePcts.map((d) => d.pct));
  // fill embedded in data so recharts v3 picks it up per-bar without Cell
  const agePctsStyled = agePcts.map(({ label, pct }) => ({
    label,
    pct,
    fill: pct === peakAge.pct ? accentColor : "url(#barGradAge)",
  }));

  // ── Gender breakdown ────────────────────────────────────────────────────
  const genderRaw = insights.gender_breakdown ?? [];
  const genderTotal = genderRaw.reduce((s, g) => s + g.value, 0);
  const femalePct =
    genderTotal > 0
      ? Math.round(
          ((genderRaw.find((g) => g.label === "F")?.value ?? 0) / genderTotal) *
            100,
        )
      : 58;
  const malePct =
    genderTotal > 0
      ? Math.round(
          ((genderRaw.find((g) => g.label === "M")?.value ?? 0) / genderTotal) *
            100,
        )
      : 36;
  const nbPct = Math.max(0, 100 - femalePct - malePct);

  const genderSegments = [
    { pct: femalePct, fill: accentColor, label: "Female" },
    { pct: malePct, fill: contrastColor, label: "Male" },
    ...(nbPct > 0 ? [{ pct: nbPct, fill: "#a1a1aa", label: "Other" }] : []),
  ];
  const dominantGender = genderSegments.reduce((a, b) =>
    a.pct >= b.pct ? a : b,
  );

  const cardBg = darkMode ? "#1e1e1e" : "#ffffff";
  const cardText = darkMode ? "#f5f5f5" : "#111827";
  const subText = darkMode ? "#9ca3af" : "#6b7280";

  return (
    <section
      id="audience"
      className="px-4 py-14 md:px-8 md:py-20"
      style={{ backgroundColor: baseColor }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex items-start justify-between mb-8 md:mb-10 gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
              Audience DNA
            </p>
            <h2
              className="text-3xl md:text-4xl font-black leading-tight"
              style={{ color: contrastColor }}
            >
              Who&apos;s actually watching.
            </h2>
          </div>
          <span
            className="text-[11px] font-bold px-3 py-1.5 rounded-full border shrink-0 mt-1"
            style={{
              color: contrastColor,
              borderColor: `${contrastColor}30`,
              backgroundColor: `${contrastColor}08`,
            }}
          >
            LIVE · LAST 30 DAYS
          </span>
        </div>

        {/* ── Top locations (map) ────────────────────────────────────────── */}
        {(insights.top_countries ?? []).length > 0 ||
        (insights.top_cities ?? []).length > 0 ? (
          <div className="mb-8">
            <WorldAudienceMap
              topCountries={insights.top_countries ?? []}
              topCities={insights.top_cities ?? []}
              accentColor={accentColor}
              contrastColor={contrastColor}
              baseColor={baseColor}
            />
          </div>
        ) : (
          <div
            className="rounded-3xl mb-8 flex flex-col items-center justify-center py-14"
            style={{ backgroundColor: contrastColor }}
          >
            <svg
              width={40}
              height={40}
              viewBox="0 0 40 40"
              fill="none"
              className="mb-4"
            >
              <circle
                cx={20}
                cy={20}
                r={16}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={2}
              />
              <path
                d="M4 20 Q12 10 20 20 Q28 30 36 20"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={1.5}
                fill="none"
              />
              <path
                d="M4 20 Q12 28 20 20 Q28 12 36 20"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={1.5}
                fill="none"
              />
              <line
                x1={20}
                y1={4}
                x2={20}
                y2={36}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1.5}
              />
              <line
                x1={4}
                y1={20}
                x2={36}
                y2={20}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1.5}
              />
            </svg>
            <p className="text-[14px] font-semibold text-white">
              Location data not available yet
            </p>
            <p
              className="text-[12px] mt-1.5 text-center max-w-xs"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Top cities and countries will appear here once your audience data
              syncs
            </p>
          </div>
        )}

        {/* 2 × 2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {/* ── Card 1: Age distribution ──────────────────────────────── */}
          <div
            className="rounded-3xl p-6 md:p-8 shadow-sm"
            style={{ backgroundColor: cardBg }}
          >
            <div className="flex items-baseline justify-between mb-1.5">
              <h3 className="text-[17px] font-bold" style={{ color: cardText }}>
                Age distribution
              </h3>
              {ageTotal > 0 && (
                <span className="text-[11px] font-semibold text-gray-400 tracking-wider">
                  PEAK · {peakAge.label}
                </span>
              )}
            </div>

            {ageTotal === 0 ? (
              <div
                className="flex flex-col items-center justify-center rounded-2xl mt-4"
                style={{ height: "160px", backgroundColor: `${accentColor}10` }}
              >
                <svg
                  width={32}
                  height={32}
                  viewBox="0 0 32 32"
                  fill="none"
                  className="mb-3"
                >
                  <rect
                    x={4}
                    y={18}
                    width={6}
                    height={10}
                    rx={2}
                    fill={accentColor}
                    opacity={0.3}
                  />
                  <rect
                    x={13}
                    y={10}
                    width={6}
                    height={18}
                    rx={2}
                    fill={accentColor}
                    opacity={0.5}
                  />
                  <rect
                    x={22}
                    y={14}
                    width={6}
                    height={14}
                    rx={2}
                    fill={accentColor}
                    opacity={0.3}
                  />
                </svg>
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: cardText }}
                >
                  Not enough data yet
                </p>
                <p
                  className="text-[11px] mt-1 text-center px-6"
                  style={{ color: subText }}
                >
                  Age insights appear once your audience grows a bit more
                </p>
              </div>
            ) : (
              <>
                <p
                  className="text-sm mb-4 leading-relaxed"
                  style={{ color: subText }}
                >
                  {genZMillPct}% are Gen Z &amp; young millennials
                </p>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={agePctsStyled}
                      margin={{ top: 0, right: 8, left: 8, bottom: 0 }}
                      barCategoryGap="20%"
                    >
                      <defs>
                        <linearGradient
                          id="barGradAge"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="40%"
                            stopColor={accentColor}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor={accentColor}
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        hide
                        domain={[0, Math.ceil(maxAgePct * 1.35)]}
                        width={0}
                      />
                      <Bar
                        dataKey="pct"
                        radius={[6, 6, 3, 3]}
                        label={<AgeBarLabel labelColor={contrastColor} />}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>

          {/* ── Card 2: Gender split ────────────────────────────────────── */}
          <div
            className="rounded-3xl p-6 md:p-8 shadow-sm"
            style={{ backgroundColor: cardBg }}
          >
            <h3
              className="text-[17px] font-bold mb-1.5"
              style={{ color: cardText }}
            >
              Gender split
            </h3>
            {genderTotal === 0 ? (
              <div
                className="flex flex-col items-center justify-center rounded-2xl mt-4"
                style={{ height: "160px", backgroundColor: `${accentColor}10` }}
              >
                <svg
                  width={32}
                  height={32}
                  viewBox="0 0 32 32"
                  fill="none"
                  className="mb-3"
                >
                  <circle
                    cx={16}
                    cy={16}
                    r={12}
                    stroke={accentColor}
                    strokeWidth={2}
                    strokeOpacity={0.4}
                    fill="none"
                  />
                  <path
                    d="M16 4 Q22 10 22 16 Q22 22 16 28"
                    stroke={accentColor}
                    strokeWidth={1.5}
                    strokeOpacity={0.5}
                    fill="none"
                  />
                  <path
                    d="M16 4 Q10 10 10 16 Q10 22 16 28"
                    stroke={accentColor}
                    strokeWidth={1.5}
                    strokeOpacity={0.5}
                    fill="none"
                  />
                </svg>
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: cardText }}
                >
                  Not enough data yet
                </p>
                <p
                  className="text-[11px] mt-1 text-center px-6"
                  style={{ color: subText }}
                >
                  Gender insights appear once your audience grows a bit more
                </p>
              </div>
            ) : (
              <>
                <p
                  className="text-sm mb-6 leading-relaxed"
                  style={{ color: subText }}
                >
                  Know your audience — position your brand right.
                </p>
                <div className="flex min-[310px]:flex-row flex-col items-center gap-6 md:gap-8">
                  <div className="relative min-[425px]:w-[160px] min-[425px]:h-[160px] w-[120px] h-[120px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderSegments}
                          dataKey="pct"
                          innerRadius="40%"
                          outerRadius="85%"
                          startAngle={90}
                          endAngle={-270}
                          strokeWidth={0}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-4 flex-1">
                    {genderSegments.map((s) => (
                      <div key={s.label} className="flex items-center gap-2.5">
                        <span
                          className="min-[425px]:w-3 min-[425px]:h-3 w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: s.fill }}
                        />
                        <span
                          className="text-[13px]"
                          style={{ color: subText }}
                        >
                          {s.label}
                        </span>
                        <span
                          className="min-[425px]:text-[13px] text-[12px] font-bold ml-auto"
                          style={{ color: cardText }}
                        >
                          {s.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
