import { type AudienceInsights } from "./types";
import { WorldAudienceMap } from "./WorldAudienceMap";

// Static 24-hour activity curve (index 0 = 12AM … index 19 = 7PM peak)
const ACTIVE_HOURS = [
  2, 1, 1, 1, 1, 2, 4, 6, 7, 8, 8, 8, 8, 7, 7, 7, 9, 11, 13, 14, 10, 8, 6, 3,
];
const PEAK_HOUR_IDX = 19;

const DUMMY_AGE = [
  { label: "13-17", pct: 10 },
  { label: "18-24", pct: 38 },
  { label: "25-34", pct: 30 },
  { label: "35-44", pct: 14 },
  { label: "45+", pct: 8 },
];

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
  const ageTotal = ageRaw.reduce((s, a) => s + a.value, 0);
  const AGE_LABELS = ["13-17", "18-24", "25-34", "35-44", "45+"];
  const agePcts =
    ageTotal > 0
      ? AGE_LABELS.map((label) => ({
          label,
          pct: Math.round(
            ((ageRaw.find((a) => a.label === label)?.value ?? 0) / ageTotal) *
              100,
          ),
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

  const maxActiveHour = Math.max(...ACTIVE_HOURS);
  const cardBg = darkMode ? "#1e1e1e" : "#ffffff";
  const softCardBg = darkMode ? "#2a2a2a" : "#f2f5f2";
  const cardText = darkMode ? "#f5f5f5" : "#111827";
  const subText = darkMode ? "#9ca3af" : "#6b7280";
  const dividerColor = darkMode ? "#3f3f46" : "#f3f4f6";
  const activeHourInactiveColor = darkMode ? "#3f3f46" : "#e5e7eb";

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
              Who's actually watching.
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
              <span className="text-[11px] font-semibold text-gray-400 tracking-wider">
                PEAK · {peakAge.label}
              </span>
            </div>
            <p
              className="text-sm mb-6 leading-relaxed"
              style={{ color: subText }}
            >
              {genZMillPct}% are Gen Z &amp; young millennials
            </p>

            {/* Bar chart */}
            <div
              className="flex gap-2 md:gap-3 items-end"
              style={{ height: "128px" }}
            >
              {agePcts.map(({ label, pct }) => (
                <div key={label} className="flex-1 h-full flex items-end">
                  <div
                    className="w-full rounded-2xl"
                    style={{
                      height: `${Math.max((pct / 40) * 100, 3)}%`,
                      background: `linear-gradient(to bottom, ${baseColor} 0%, ${accentColor} 100%)`,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* X-axis labels */}
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
          </div>

          {/* ── Card 2: Active hours (static) ─────────────────────────── */}
          <div
            className="rounded-3xl p-6 md:p-8 shadow-sm"
            style={{ backgroundColor: cardBg }}
          >
            <div className="flex items-baseline justify-between mb-1.5">
              <h3 className="text-[17px] font-bold" style={{ color: cardText }}>
                Active hours
              </h3>
              <span className="text-[11px] font-semibold text-gray-400 tracking-wider">
                24H · EST
              </span>
            </div>
            <p
              className="text-sm mb-6 leading-relaxed"
              style={{ color: subText }}
            >
              When the feed is actually scrolling — schedule drops accordingly.
            </p>

            {/* Bar chart */}
            <div className="flex gap-0.5 items-end" style={{ height: "80px" }}>
              {ACTIVE_HOURS.map((val, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${(val / maxActiveHour) * 100}%`,
                    backgroundColor:
                      i === PEAK_HOUR_IDX ? "#4f46e5" : activeHourInactiveColor,
                    minHeight: "3px",
                  }}
                />
              ))}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-[10px] text-gray-400 mt-2 mb-4">
              <span>12AM</span>
              <span>6AM</span>
              <span>12PM</span>
              <span>6PM</span>
              <span>11PM</span>
            </div>

            {/* Footer stats */}
            <div
              className="flex items-center justify-between pt-4 border-t"
              style={{ borderColor: dividerColor }}
            >
              <div>
                <p className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">
                  Peak Window
                </p>
                <p
                  className="text-2xl font-black mt-0.5"
                  style={{ color: cardText }}
                >
                  7pm{" "}
                  <span className="text-sm font-bold text-gray-400">EST</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">
                  Online · Live
                </p>
                <p className="text-2xl font-black mt-0.5 text-indigo-500">
                  96%
                </p>
              </div>
            </div>
          </div>

          {/* ── Card 3: Gender split ───────────────────────────────────── */}
          <div
            className="rounded-3xl p-6 md:p-8"
            style={{ backgroundColor: softCardBg }}
          >
            <h3
              className="text-[17px] font-bold mb-1.5"
              style={{ color: cardText }}
            >
              Gender split
            </h3>
            <p
              className="text-sm mb-5 leading-relaxed"
              style={{ color: subText }}
            >
              Beauty, fashion &amp; lifestyle skew, balanced enough for tech.
            </p>

            {/* Segmented bar: female | male | nb */}
            <div className="h-4 rounded-full overflow-hidden mb-3">
              <div
                className="h-full w-full"
                style={{
                  background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${femalePct}%, ${contrastColor} ${femalePct}%, ${contrastColor} ${femalePct + malePct}%, #a1a1aa ${femalePct + malePct}%, #a1a1aa 100%)`,
                }}
              />
            </div>

            {/* Legend */}
            <div
              className="flex items-center gap-4 text-sm font-medium mb-6"
              style={{ color: subText }}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: accentColor }}
                />
                Female <strong style={{ color: cardText }}>{femalePct}%</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: contrastColor }}
                />
                Male <strong style={{ color: cardText }}>{malePct}%</strong>
              </span>
              <span>
                Non-binary <strong style={{ color: cardText }}>{nbPct}%</strong>
              </span>
            </div>

            {/* Mobile / Desktop bars (static) */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] font-bold tracking-wider text-gray-400 mb-1.5">
                  <span>MOBILE</span>
                  <span>94%</span>
                </div>
                <div
                  className="h-2.5 rounded-full overflow-hidden"
                  style={{
                    backgroundColor: darkMode ? "#3f3f46" : "rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: "94%", backgroundColor: accentColor }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-bold tracking-wider text-gray-400 mb-1.5">
                  <span>DESKTOP</span>
                  <span>6%</span>
                </div>
                <div
                  className="h-2.5 rounded-full overflow-hidden"
                  style={{
                    backgroundColor: darkMode ? "#3f3f46" : "rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: "6%", backgroundColor: contrastColor }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Card 4: Top locations (map) — spans full width ────────── */}
          <div className="md:col-span-2">
            <WorldAudienceMap
              topCountries={insights.top_countries ?? []}
              topCities={insights.top_cities ?? []}
              accentColor={accentColor}
              contrastColor={contrastColor}
              baseColor={baseColor}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
