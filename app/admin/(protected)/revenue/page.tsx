"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { PlanSelect } from "@/components/admin/PlanSelect";

type PeriodResult = { revenue: number; count: number };

type MonthData = {
  month: number;
  year: number;
  label: string;
  all: PeriodResult;
  byPlan: Record<string, PeriodResult>;
};

type RevenueData = {
  plans: { id: string; name: string }[];
  stats: {
    week:    { all: PeriodResult; byPlan: Record<string, PeriodResult> };
    month:   { all: PeriodResult; byPlan: Record<string, PeriodResult> };
    quarter: { all: PeriodResult; byPlan: Record<string, PeriodResult> };
    fy:      { all: PeriodResult; byPlan: Record<string, PeriodResult> };
  };
  monthly: MonthData[];
};

function fmtRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function fmtCompact(paise: number) {
  const r = paise / 100;
  if (r >= 100000) return `₹${(r / 100000).toFixed(1).replace(/\.0$/, "")}L`;
  if (r >= 1000)   return `₹${(r / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `₹${r.toFixed(0)}`;
}

function niceMax(n: number): number {
  if (n <= 0) return 10000;
  const mag = Math.pow(10, Math.floor(Math.log10(n)));
  const norm = n / mag;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return nice * mag * (n === nice * mag ? 1 : 1); // ensure we always ceil
}

function ceilNice(n: number): number {
  if (n <= 0) return 10000;
  const mag = Math.pow(10, Math.floor(Math.log10(n)));
  const norm = n / mag;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return nice * mag;
}

// -- Stat card --
function StatCard({ label, revenue, count, loading }: { label: string; revenue: number; count: number; loading: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{label}</p>
      {loading ? (
        <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
      ) : (
        <>
          <p className="text-2xl font-black text-gray-900">{fmtRupees(revenue)}</p>
          <p className="text-xs text-gray-400 mt-1">{count} invoice{count !== 1 ? "s" : ""}</p>
        </>
      )}
    </div>
  );
}

// -- Bar chart (SVG, single series) --
const VW = 800;
const VH = 260;
const PAD = { left: 68, right: 16, top: 20, bottom: 36 };
const PLOT_W = VW - PAD.left - PAD.right;
const PLOT_H = VH - PAD.top - PAD.bottom;
const BAR_COLOR = "#ff7350";
const BAR_COLOR_MUTED = "#ffe4de";

function BarChart({ months, planFilter }: { months: MonthData[]; planFilter: string }) {
  const [tooltip, setTooltip] = useState<null | { slotX: number; barTop: number; label: string; revenue: number; count: number }>(null);

  const data = useMemo(() => months.map((m) => ({
    label: m.label,
    revenue: planFilter === "all" ? m.all.revenue : (m.byPlan[planFilter]?.revenue ?? 0),
    count:   planFilter === "all" ? m.all.count   : (m.byPlan[planFilter]?.count   ?? 0),
  })), [months, planFilter]);

  const maxRev = Math.max(...data.map((d) => d.revenue), 1);
  const yMax = ceilNice(maxRev * 1.15);

  const n = data.length;
  const slotW = n > 0 ? PLOT_W / n : PLOT_W;
  const barW = Math.min(slotW * 0.5, 24);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(t * yMax / 100) * 100);

  const toY = (rev: number) => PAD.top + PLOT_H - (rev / yMax) * PLOT_H;
  const slotX = (i: number) => PAD.left + i * slotW + slotW / 2;

  return (
    <div className="relative select-none">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="w-full h-auto overflow-visible"
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Gridlines */}
        {yTicks.map((tick) => (
          <line
            key={tick}
            x1={PAD.left} y1={toY(tick)}
            x2={VW - PAD.right} y2={toY(tick)}
            stroke="#f3f4f6" strokeWidth="1"
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((tick) => (
          <text
            key={tick}
            x={PAD.left - 8} y={toY(tick) + 4}
            textAnchor="end" fontSize="10" fill="#9ca3af"
            fontFamily="inherit"
          >
            {fmtCompact(tick)}
          </text>
        ))}

        {/* Bars */}
        {data.map((d, i) => {
          const barH = Math.max((d.revenue / yMax) * PLOT_H, 0);
          const cx = slotX(i);
          const bx = cx - barW / 2;
          const by = toY(d.revenue);
          const isActive = tooltip?.label === d.label;

          return (
            <g key={i}>
              {/* Invisible hit area covering full column slot */}
              <rect
                x={PAD.left + i * slotW} y={PAD.top}
                width={slotW} height={PLOT_H}
                fill="transparent"
                onMouseEnter={() => setTooltip({ slotX: cx, barTop: by, label: d.label, revenue: d.revenue, count: d.count })}
              />
              {/* Bar */}
              {barH > 0 && (
                <rect
                  x={bx} y={by}
                  width={barW} height={barH}
                  fill={isActive ? BAR_COLOR : BAR_COLOR_MUTED}
                  rx="4" ry="4"
                />
              )}
              {/* Square out the bottom corners */}
              {barH > 4 && (
                <rect
                  x={bx} y={by + barH - 4}
                  width={barW} height={4}
                  fill={isActive ? BAR_COLOR : BAR_COLOR_MUTED}
                />
              )}
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={slotX(i)} y={VH - PAD.bottom + 18}
            textAnchor="middle" fontSize="10" fill="#9ca3af"
            fontFamily="inherit"
          >
            {d.label}
          </text>
        ))}

        {/* Baseline */}
        <line
          x1={PAD.left} y1={PAD.top + PLOT_H}
          x2={VW - PAD.right} y2={PAD.top + PLOT_H}
          stroke="#e5e7eb" strokeWidth="1"
        />
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-xs whitespace-nowrap"
          style={{
            left: `${(tooltip.slotX / VW) * 100}%`,
            top:  `${(tooltip.barTop / VH) * 100}%`,
            transform: "translate(-50%, calc(-100% - 8px))",
          }}
        >
          <p className="font-semibold text-gray-900 mb-0.5">{tooltip.label}</p>
          <p className="text-gray-700">{fmtRupees(tooltip.revenue)}</p>
          <p className="text-gray-400">{tooltip.count} invoice{tooltip.count !== 1 ? "s" : ""}</p>
        </div>
      )}
    </div>
  );
}

// -- Page --
export default function AdminRevenuePage() {
  const [data, setData]     = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [planFilter, setPlanFilter] = useState<string>("all");

  useEffect(() => {
    axios.get("/api/admin/revenue")
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const periods = [
    { key: "week"    as const, label: "This week" },
    { key: "month"   as const, label: "This month" },
    { key: "quarter" as const, label: "This quarter" },
    { key: "fy"      as const, label: "This financial year" },
  ];

  function getPeriodStat(key: "week" | "month" | "quarter" | "fy"): PeriodResult {
    if (!data) return { revenue: 0, count: 0 };
    const period = data.stats[key];
    return planFilter === "all" ? period.all : (period.byPlan[planFilter] ?? { revenue: 0, count: 0 });
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Revenue</h1>
          <p className="text-sm text-gray-400 mt-1">Indian financial year · paid invoices only</p>
        </div>

        {/* Plan filter */}
        <PlanSelect
          value={planFilter}
          onChange={setPlanFilter}
          options={data?.plans ?? []}
        />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {periods.map((p) => {
          const stat = getPeriodStat(p.key);
          return (
            <StatCard
              key={p.key}
              label={p.label}
              revenue={stat.revenue}
              count={stat.count}
              loading={loading}
            />
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-black text-gray-900">Monthly revenue</p>
          <p className="text-xs text-gray-400">
            {planFilter === "all" ? "All plans" : (data?.plans.find((p) => p.id === planFilter)?.name ?? planFilter)}
          </p>
        </div>
        {loading ? (
          <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />
        ) : data && data.monthly.length > 0 ? (
          <BarChart months={data.monthly} planFilter={planFilter} />
        ) : (
          <p className="text-xs text-gray-400 py-16 text-center">No revenue data for this financial year yet</p>
        )}
      </div>
    </div>
  );
}
