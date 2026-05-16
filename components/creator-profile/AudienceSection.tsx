import { type AudienceInsights } from "./types";

function DonutChart({
  segments,
  centerPct,
  centerLabel,
  secondaryColor,
}: {
  segments: { color: string; pct: number }[];
  centerPct: string;
  centerLabel: string;
  secondaryColor: string;
}) {
  const outerR = 58,
    innerR = 38,
    cx = 68,
    cy = 68;
  let angle = -Math.PI / 2;
  const arcs = segments
    .filter((s) => s.pct > 0)
    .map((seg) => {
      const sweep = (seg.pct / 100) * 2 * Math.PI;
      const x1o = cx + outerR * Math.cos(angle);
      const y1o = cy + outerR * Math.sin(angle);
      const x1i = cx + innerR * Math.cos(angle);
      const y1i = cy + innerR * Math.sin(angle);
      angle += sweep;
      const x2o = cx + outerR * Math.cos(angle);
      const y2o = cy + outerR * Math.sin(angle);
      const x2i = cx + innerR * Math.cos(angle);
      const y2i = cy + innerR * Math.sin(angle);
      const large = sweep > Math.PI ? 1 : 0;
      return {
        color: seg.color,
        path: `M ${x1o.toFixed(1)} ${y1o.toFixed(1)} A ${outerR} ${outerR} 0 ${large} 1 ${x2o.toFixed(1)} ${y2o.toFixed(1)} L ${x2i.toFixed(1)} ${y2i.toFixed(1)} A ${innerR} ${innerR} 0 ${large} 0 ${x1i.toFixed(1)} ${y1i.toFixed(1)} Z`,
      };
    });
  return (
    <svg viewBox="0 0 136 136" className="w-36 h-36 shrink-0">
      {arcs.map((a, i) => (
        <path key={i} d={a.path} fill={a.color} />
      ))}
      <text
        x="68"
        y="63"
        textAnchor="middle"
        fill={secondaryColor}
        style={{ fontSize: "19px", fontWeight: 900 }}
      >
        {centerPct}
      </text>
      <text
        x="68"
        y="78"
        textAnchor="middle"
        fill="#6B7280"
        style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.06em" }}
      >
        {centerLabel.toUpperCase()}
      </text>
    </svg>
  );
}

function ProgressBar({
  label,
  pct,
  color,
}: {
  label: string;
  pct: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs font-bold tracking-wider text-gray-500">
          {label}
        </span>
        <span className="text-xs font-black text-gray-900">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-2 rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function AudienceSection({
  insights,
  nicheTags,
  primaryColor,
  accentColor,
  secondaryColor,
}: {
  insights: AudienceInsights;
  nicheTags: string[];
  primaryColor: string;
  accentColor: string;
  secondaryColor: string;
}) {
  const genderAgeData = insights.gender_age ?? [];
  const citiesData = insights.top_cities ?? [];

  const gTotals: Record<string, number> = { F: 0, M: 0, U: 0 };
  for (const item of genderAgeData) {
    const g = item.label.split(".")[0];
    gTotals[g] = (gTotals[g] ?? 0) + item.value;
  }
  const gTotal = gTotals.F + gTotals.M + (gTotals.U ?? 0);
  const femalePct =
    gTotal > 0
      ? Math.round(((gTotals.F + (gTotals.U ?? 0)) / gTotal) * 100)
      : 68;
  const malePct = gTotal > 0 ? Math.round((gTotals.M / gTotal) * 100) : 32;

  const ageBuckets: Record<string, number> = {};
  for (const item of genderAgeData) {
    const age = item.label.split(".")[1];
    if (age) ageBuckets[age] = (ageBuckets[age] ?? 0) + item.value;
  }
  const ageTotal = Object.values(ageBuckets).reduce((a, b) => a + b, 0);
  const genZ = ageBuckets["18-24"] ?? 0;
  const millennial = ageBuckets["25-34"] ?? 0;
  const alpha = ageBuckets["13-17"] ?? 0;
  const older = Object.entries(ageBuckets)
    .filter(([k]) => !["18-24", "25-34", "13-17"].includes(k))
    .reduce((s, [, v]) => s + v, 0);

  const hasData = ageTotal > 0;
  const ageGroups = hasData
    ? [
        {
          label: "Gen Z (18–24)",
          pct: Math.round((genZ / ageTotal) * 100),
          color: accentColor,
        },
        {
          label: "Millennial (25–34)",
          pct: Math.round((millennial / ageTotal) * 100),
          color: secondaryColor,
        },
        {
          label: "Alpha (13–17)",
          pct: Math.round((alpha / ageTotal) * 100),
          color: "#C8E6E0",
        },
        {
          label: "35+",
          pct: Math.round((older / ageTotal) * 100),
          color: "#D1D5DB",
        },
      ].filter((g) => g.pct > 0)
    : [
        { label: "Gen Z (18–24)", pct: 54, color: accentColor },
        { label: "Millennial (25–34)", pct: 31, color: secondaryColor },
        { label: "Alpha (13–17)", pct: 9, color: "#C8E6E0" },
        { label: "35+", pct: 6, color: "#D1D5DB" },
      ];

  const dominant = ageGroups.reduce((a, b) => (a.pct >= b.pct ? a : b));

  const cityTotal = citiesData.reduce((s, c) => s + c.count, 0);
  const displayCities =
    citiesData.length > 0
      ? citiesData.slice(0, 5).map((c) => ({
          name: c.city,
          pct: cityTotal ? Math.round((c.count / cityTotal) * 100) : 0,
        }))
      : [
          // [DUMMY cities]
          { name: "New York", pct: 22 },
          { name: "London", pct: 18 },
          { name: "Seoul", pct: 14 },
          { name: "Berlin", pct: 9 },
          { name: "Tokyo", pct: 7 },
        ];
  const maxCityPct = Math.max(...displayCities.map((c) => c.pct), 1);

  const affinityTags =
    nicheTags.length > 0
      ? nicheTags
      : [
          "Luxury Tech",
          "Eco-Apparel",
          "Clean Beauty",
          "Digital Art",
          "Sustainable",
          "Streetwear",
        ]; // [DUMMY]

  return (
    <section
      id="audience"
      className="px-4 py-12 md:px-8 md:py-20"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-start">
        {/* Left: Audience DNA white card */}
        <div className="flex-1 bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <h2 className="font-black text-gray-900 text-2xl">Audience DNA</h2>
            <span
              className="bg-blue-100 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ color: accentColor }}
            >
              2024 UPDATE {/* [DUMMY] */}
            </span>
          </div>

          <div className="flex items-center gap-6 mb-8">
            <DonutChart
              segments={ageGroups}
              centerPct={`${dominant.pct}%`}
              centerLabel={dominant.label.split(" ")[0]}
              secondaryColor={secondaryColor}
            />
            <div className="space-y-2.5 flex-1">
              {ageGroups.map((g) => (
                <div
                  key={g.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: g.color }}
                    />
                    <span className="text-sm text-gray-600">{g.label}</span>
                  </div>
                  <span className="font-black text-gray-900 text-sm">
                    {g.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <ProgressBar
              label="FEMALE / NON-BINARY"
              pct={femalePct}
              color={accentColor}
            />
            <ProgressBar label="MALE" pct={malePct} color={secondaryColor} />
          </div>

          {/* [DUMMY: no device field] */}
          <div className="space-y-4">
            <ProgressBar label="MOBILE" pct={94} color={accentColor} />
            <ProgressBar label="DESKTOP" pct={6} color={secondaryColor} />
          </div>
        </div>

        {/* Right: dark navy card */}
        <div
          className="md:w-80 shrink-0 rounded-3xl p-8 text-white"
          style={{ backgroundColor: secondaryColor }}
        >
          <p className="text-xs font-bold tracking-[0.18em] text-gray-400 uppercase mb-5">
            Top Markets
          </p>
          <div className="space-y-4 mb-8">
            {displayCities.map(({ name, pct }) => (
              <div key={name}>
                <div className="flex justify-between mb-1.5">
                  <span className="font-bold text-white text-sm">{name}</span>
                  <span className="text-gray-400 text-sm">{pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${(pct / maxCityPct) * 100}%`,
                      backgroundColor: accentColor,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs font-bold tracking-[0.18em] text-gray-400 uppercase mb-4">
            Brand Affinities
          </p>
          <div className="flex flex-wrap gap-2">
            {affinityTags.map((tag) => (
              <span
                key={tag}
                className="border border-gray-600 text-white text-xs px-3 py-1.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
