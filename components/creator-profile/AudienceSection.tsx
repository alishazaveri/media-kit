import dynamic from "next/dynamic";
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

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function r4(n: number) {
  return Math.round(n * 10000) / 10000;
}

function donutSlice(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  start: number,
  end: number,
): string {
  const clamped = end - start >= 360 ? 359.99 : end - start;
  const e = start + clamped;
  const s1 = polarToCartesian(cx, cy, outer, start);
  const e1 = polarToCartesian(cx, cy, outer, e);
  const s2 = polarToCartesian(cx, cy, inner, e);
  const e2 = polarToCartesian(cx, cy, inner, start);
  const large = clamped > 180 ? 1 : 0;
  return `M${r4(s1.x)} ${r4(s1.y)} A${outer} ${outer} 0 ${large} 1 ${r4(e1.x)} ${r4(e1.y)} L${r4(s2.x)} ${r4(s2.y)} A${inner} ${inner} 0 ${large} 0 ${r4(e2.x)} ${r4(e2.y)}Z`;
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

  // ── Donut chart segments ────────────────────────────────────────────────
  const rawSegments = [
    { pct: femalePct, color: accentColor, label: "Female" },
    { pct: malePct, color: contrastColor, label: "Male" },
    ...(nbPct > 0 ? [{ pct: nbPct, color: "#a1a1aa", label: "Other" }] : []),
  ];
  let cumDeg = 0;
  const genderSegments = rawSegments.map((s) => {
    const start = cumDeg;
    cumDeg += (s.pct / 100) * 360;
    return { ...s, startDeg: start, endDeg: cumDeg };
  });
  const dominantGender = rawSegments.reduce((a, b) => (a.pct >= b.pct ? a : b));

  const cardBg = darkMode ? "#1e1e1e" : "#ffffff";
  const softCardBg = darkMode ? "#2a2a2a" : "#f2f5f2";
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

        {/* ── Top locations (map) — spans full width ────────── */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 ">
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
                  className="text-sm mb-6 leading-relaxed"
                  style={{ color: subText }}
                >
                  {genZMillPct}% are Gen Z &amp; young millennials
                </p>
                <div
                  className="flex gap-3 sm:gap-6 md:gap-4 items-end"
                  style={{ height: "148px" }}
                >
                  {agePcts.map(({ label, pct }) => (
                    <div
                      key={label}
                      className="flex-1 h-full flex flex-col items-center justify-end"
                    >
                      <span
                        className="text-[10px] font-bold mb-1"
                        style={{ color: subText }}
                      >
                        {pct}%
                      </span>
                      <div
                        className="w-full rounded-xl"
                        style={{
                          height: `${Math.max((pct / 45) * 100, 3)}%`,
                          background: `linear-gradient(to bottom, ${baseColor} 0%, ${accentColor} 100%)`,
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 md:gap-3 mt-2.5">
                  {agePcts.map(({ label }) => (
                    <div
                      key={label}
                      className="flex-1 text-center text-[10px] md:text-[11px] text-gray-400"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── Card 2: Gender split (donut chart) ────────────────────── */}
          <div
            className="rounded-3xl p-6 md:p-8 shadow-sm"
            style={{ backgroundColor: "white" }}
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
                  Know your audience - position your brand right.
                </p>
                <div className="flex min-[300px]:flex-row flex-col  items-center gap-4 min-[425px]:gap-10 md:gap-8">
                  <svg
                    viewBox="0 0 160 160"
                    className="shrink-0 min-[425px]:w-[160px] min-[425px]:h-[160px] w-[120px] h-[120px]"
                  >
                    {genderSegments.map((s) => (
                      <path
                        key={s.label}
                        d={donutSlice(80, 80, 68, 35, s.startDeg, s.endDeg)}
                        fill={s.color}
                      />
                    ))}
                    {/* <text
                      x={80}
                      y={74}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={cardText}
                      // fontSize={24}
                      fontWeight={900}
                      fontFamily="sans-serif"
                      className="text-[20px] min-[425px]:text-[24px]"
                    >
                      {dominantGender.pct}%
                    </text>
                    <text
                      x={80}
                      y={96}
                      textAnchor="middle"
                      fill={subText}
                      fontSize={11}
                      fontFamily="sans-serif"
                    >
                      {dominantGender.label}
                    </text> */}
                  </svg>
                  <div className="flex flex-col gap-4 flex-1">
                    {rawSegments.map((s) => (
                      <div key={s.label} className="flex items-center gap-2.5">
                        <span
                          className="min-[425px]:w-3 min-[425px]:h-3 w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: s.color }}
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
