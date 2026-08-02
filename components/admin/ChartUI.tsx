"use client";

import { useRef, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ChartSeries = {
  key: string;
  label: string;
  color: string;
};

export type ChartMetric = {
  key: string;
  label: string;
  chartType?: "line" | "bar";
};

export type ChartGranularity = "daily" | "monthly";

export type ChartDataPoint = Record<string, unknown>;

export type ChartUIProps = {
  title: string;
  data: ChartDataPoint[] | null;
  loading?: boolean;
  metrics: ChartMetric[];
  series: ChartSeries[];
  /** Extract the numeric value for a given metric + series key from a data point */
  accessor: (point: ChartDataPoint, metricKey: string, seriesKey: string) => number;
  /** Extract the ISO date string from a data point */
  dateAccessor: (point: ChartDataPoint) => string;
  metric: string;
  onMetricChange: (key: string) => void;
  granularity: ChartGranularity;
  onGranularityChange: (g: ChartGranularity) => void;
  emptyText?: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const VB_W = 800;
const VB_H = 200;
const PAD = { top: 16, right: 16, bottom: 32, left: 36 };
const INNER_W = VB_W - PAD.left - PAD.right;
const INNER_H = VB_H - PAD.top - PAD.bottom;
const BAR_FILL_RATIO = 0.65;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildLinePath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
}

function fmtAxisDate(dateStr: string, granularity: ChartGranularity) {
  const d = new Date(dateStr);
  return granularity === "monthly"
    ? d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function fmtTooltipDate(dateStr: string, granularity: ChartGranularity) {
  const d = new Date(dateStr);
  return granularity === "monthly"
    ? d.toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ChartUI({
  title,
  data,
  loading,
  metrics,
  series,
  accessor,
  dateAccessor,
  metric,
  onMetricChange,
  granularity,
  onGranularityChange,
  emptyText = "No data yet",
}: ChartUIProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const currentMetric = metrics.find((m) => m.key === metric) ?? metrics[0];

  // Per-metric overrides — keys not present fall back to the metric's configured default
  const [chartTypeOverrides, setChartTypeOverrides] = useState<Record<string, "line" | "bar">>({});
  const chartType = chartTypeOverrides[metric] ?? currentMetric?.chartType ?? "line";

  function handleChartTypeChange(t: "line" | "bar") {
    setChartTypeOverrides((prev) => ({ ...prev, [metric]: t }));
  }

  const rows = data ?? [];

  // ── Scales ────────────────────────────────────────────────────────────────

  const allValues = rows.flatMap((row) => series.map((s) => accessor(row, metric, s.key)));
  const maxVal = Math.max(...allValues, 1);

  const slotW = rows.length > 0 ? INNER_W / rows.length : INNER_W;

  function xLine(i: number) {
    if (rows.length <= 1) return PAD.left + INNER_W / 2;
    return PAD.left + (i / (rows.length - 1)) * INNER_W;
  }

  function xBar(i: number) {
    return PAD.left + (i + 0.5) * slotW;
  }

  function xPos(i: number) {
    return chartType === "bar" ? xBar(i) : xLine(i);
  }

  function yPos(val: number) {
    return PAD.top + INNER_H - (val / maxVal) * INNER_H;
  }

  // ── Tick marks ────────────────────────────────────────────────────────────

  const tickCount = Math.min(6, rows.length);
  const tickIndices =
    rows.length <= 6
      ? rows.map((_, i) => i)
      : Array.from({ length: tickCount }, (_, i) =>
          Math.round((i * (rows.length - 1)) / (tickCount - 1))
        );

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f, i) => ({
    key: i,
    val: Math.round(maxVal * f),
    y: yPos(maxVal * f),
  }));

  // ── Hover ─────────────────────────────────────────────────────────────────

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current || rows.length === 0) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgX = pt.matrixTransform(svgRef.current.getScreenCTM()!.inverse()).x;
    const nearest = rows.reduce(
      (best, _, i) => (Math.abs(xPos(i) - svgX) < Math.abs(xPos(best) - svgX) ? i : best),
      0
    );
    setHoveredIdx(nearest);
  }

  const hRow = hoveredIdx !== null ? rows[hoveredIdx] : null;
  const hXPct = hoveredIdx !== null ? (xPos(hoveredIdx) / VB_W) * 100 : 0;

  // ── Bar geometry ──────────────────────────────────────────────────────────

  const barGroupW = slotW * BAR_FILL_RATIO;
  const singleBarW = series.length > 0 ? barGroupW / series.length : barGroupW;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {/* Header */}
      <div className="mb-3">

        {/* Mobile: two balanced rows */}
        <div className="sm:hidden space-y-1.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-gray-900">{title}</h2>
            <div className="flex rounded-md border border-gray-200 overflow-hidden">
              <button onClick={() => handleChartTypeChange("line")} title="Line chart" className={`px-2 py-1 transition-colors cursor-pointer ${chartType === "line" ? "bg-gray-900 text-white" : "bg-white text-gray-400 hover:bg-gray-50"}`}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><polyline points="1,11 4.5,6 7.5,8.5 13,2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button onClick={() => handleChartTypeChange("bar")} title="Bar chart" className={`px-2 py-1 transition-colors cursor-pointer ${chartType === "bar" ? "bg-gray-900 text-white" : "bg-white text-gray-400 hover:bg-gray-50"}`}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="1" y="7" width="3" height="6" rx="0.5" fill="currentColor" /><rect x="5.5" y="4" width="3" height="9" rx="0.5" fill="currentColor" /><rect x="10" y="1.5" width="3" height="11.5" rx="0.5" fill="currentColor" /></svg>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {metrics.map((m) => (
                <button key={m.key} onClick={() => onMetricChange(m.key)} className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${metric === m.key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex rounded-md border border-gray-200 overflow-hidden">
              {(["daily", "monthly"] as ChartGranularity[]).map((g) => (
                <button key={g} onClick={() => onGranularityChange(g)} className={`px-2 py-0.5 text-[11px] font-semibold capitalize transition-colors cursor-pointer ${granularity === g ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop: single row */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-black text-gray-900">{title}</h2>
            <div className="flex items-center gap-1">
              {metrics.map((m) => (
                <button
                  key={m.key}
                  onClick={() => onMetricChange(m.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    metric === m.key
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button onClick={() => handleChartTypeChange("line")} title="Line chart" className={`px-2.5 py-1.5 transition-colors cursor-pointer ${chartType === "line" ? "bg-gray-900 text-white" : "bg-white text-gray-400 hover:bg-gray-50"}`}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polyline points="1,11 4.5,6 7.5,8.5 13,2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button onClick={() => handleChartTypeChange("bar")} title="Bar chart" className={`px-2.5 py-1.5 transition-colors cursor-pointer ${chartType === "bar" ? "bg-gray-900 text-white" : "bg-white text-gray-400 hover:bg-gray-50"}`}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="7" width="3" height="6" rx="0.5" fill="currentColor" /><rect x="5.5" y="4" width="3" height="9" rx="0.5" fill="currentColor" /><rect x="10" y="1.5" width="3" height="11.5" rx="0.5" fill="currentColor" /></svg>
              </button>
            </div>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
              {(["daily", "monthly"] as ChartGranularity[]).map((g) => (
                <button key={g} onClick={() => onGranularityChange(g)} className={`px-3 py-1.5 font-semibold capitalize transition-colors cursor-pointer ${granularity === g ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Legend — only when multiple series */}
      {series.length > 1 && (
        <div className="flex items-center gap-4 mb-2">
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <div
                className="w-3 rounded-full"
                style={{
                  backgroundColor: s.color,
                  height: chartType === "bar" ? 8 : 2,
                  borderRadius: chartType === "bar" ? 2 : 9999,
                }}
              />
              <span className="text-xs text-gray-400">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Chart area */}
      <div
        className="relative w-full"
        style={{ aspectRatio: `${VB_W}/${VB_H}` }}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-gray-300">Loading…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-gray-300">{emptyText}</p>
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="w-full h-full"
            onMouseMove={handleMouseMove}
          >
            {/* Y grid + labels */}
            {yTicks.map(({ key, val, y }) => (
              <g key={key}>
                <line x1={PAD.left} x2={VB_W - PAD.right} y1={y} y2={y} stroke="#f3f4f6" strokeWidth={1} />
                <text x={PAD.left - 6} y={y} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="#9ca3af">
                  {val}
                </text>
              </g>
            ))}

            {/* X axis labels */}
            {tickIndices.map((i) => (
              <text key={i} x={xPos(i)} y={VB_H - 6} textAnchor="middle" fontSize={10} fill="#9ca3af">
                {fmtAxisDate(dateAccessor(rows[i]), granularity)}
              </text>
            ))}

            {/* Hover crosshair */}
            {hoveredIdx !== null && (
              <line
                x1={xPos(hoveredIdx)} x2={xPos(hoveredIdx)}
                y1={PAD.top} y2={PAD.top + INNER_H}
                stroke="#e5e7eb" strokeWidth={1}
              />
            )}

            {/* Series */}
            {series.map((s, si) => {
              if (chartType === "bar") {
                return (
                  <g key={s.key}>
                    {rows.map((row, i) => {
                      const val = accessor(row, metric, s.key);
                      const barH = (val / maxVal) * INNER_H;
                      const barX = xBar(i) - barGroupW / 2 + si * singleBarW;
                      return (
                        <rect
                          key={i}
                          x={barX}
                          y={PAD.top + INNER_H - barH}
                          width={singleBarW - 1}
                          height={barH}
                          fill={s.color}
                          opacity={hoveredIdx === null || hoveredIdx === i ? 1 : 0.35}
                          rx={2}
                        />
                      );
                    })}
                  </g>
                );
              }

              // line
              const points = rows.map((row, i) => ({
                x: xLine(i),
                y: yPos(accessor(row, metric, s.key)),
              }));
              return (
                <g key={s.key}>
                  <path
                    d={buildLinePath(points)}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {hoveredIdx !== null && (
                    <circle
                      cx={xLine(hoveredIdx)}
                      cy={yPos(accessor(rows[hoveredIdx], metric, s.key))}
                      r={4}
                      fill={s.color}
                    />
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {/* Tooltip */}
        {hoveredIdx !== null && hRow && (
          <div
            className="absolute top-0 pointer-events-none z-10"
            style={{
              left: `${hXPct}%`,
              transform: hXPct > 65 ? "translateX(calc(-100% - 8px))" : "translateX(8px)",
            }}
          >
            <div className="bg-gray-900 text-white rounded-xl px-3 py-2 text-xs shadow-lg min-w-28">
              <p className="font-semibold text-gray-300 mb-1.5">
                {fmtTooltipDate(dateAccessor(hRow), granularity)}
              </p>
              {series.map((s) => (
                <div key={s.key} className="flex items-center justify-between gap-4 mt-0.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    {s.label}
                  </span>
                  <span className="font-black">{accessor(hRow, metric, s.key).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
