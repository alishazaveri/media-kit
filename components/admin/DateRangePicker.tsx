"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker, type DateRange } from "react-day-picker";

export type { DateRange };

type Preset = { label: string; range: () => DateRange };

function fyStart(): Date {
  const n = new Date();
  const m = n.getMonth() + 1;
  return new Date(m >= 4 ? n.getFullYear() : n.getFullYear() - 1, 3, 1);
}

function quarterStart(): Date {
  const n = new Date();
  const m = n.getMonth() + 1;
  const y = n.getFullYear();
  if (m >= 4 && m <= 6)   return new Date(y, 3, 1);
  if (m >= 7 && m <= 9)   return new Date(y, 6, 1);
  if (m >= 10 && m <= 12) return new Date(y, 9, 1);
  return new Date(y, 0, 1);
}

function currentWeekStart(): Date {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d;
}

const eod = () => { const d = new Date(); d.setHours(23, 59, 59, 999); return d; };

function lastWeekRange(): DateRange {
  const mon = currentWeekStart();
  const to = new Date(mon); to.setDate(to.getDate() - 1); to.setHours(23, 59, 59, 999);
  const from = new Date(mon); from.setDate(from.getDate() - 7);
  return { from, to };
}

function lastMonthRange(): DateRange {
  const n = new Date();
  const from = new Date(n.getFullYear(), n.getMonth() - 1, 1);
  const to   = new Date(n.getFullYear(), n.getMonth(), 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

function lastQuarterRange(): DateRange {
  const n = new Date();
  const m = n.getMonth() + 1;
  const y = n.getFullYear();
  let from: Date, to: Date;
  if (m >= 4 && m <= 6) {
    from = new Date(y, 0, 1); to = new Date(y, 2, 31);
  } else if (m >= 7 && m <= 9) {
    from = new Date(y, 3, 1); to = new Date(y, 5, 30);
  } else if (m >= 10 && m <= 12) {
    from = new Date(y, 6, 1); to = new Date(y, 8, 30);
  } else {
    from = new Date(y - 1, 9, 1); to = new Date(y - 1, 11, 31);
  }
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

function lastFyRange(): DateRange {
  const n = new Date();
  const fyYear = (n.getMonth() + 1) >= 4 ? n.getFullYear() : n.getFullYear() - 1;
  const from = new Date(fyYear - 1, 3, 1);
  const to   = new Date(fyYear, 2, 31);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

const PRESETS: Preset[] = [
  { label: "Today",        range: () => ({ from: (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })(), to: eod() }) },
  { label: "This week",    range: () => ({ from: currentWeekStart(), to: eod() }) },
  { label: "This month",   range: () => ({ from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), to: eod() }) },
  { label: "This quarter", range: () => ({ from: quarterStart(), to: eod() }) },
  { label: "This FY",      range: () => ({ from: fyStart(), to: eod() }) },
  { label: "Last week",    range: lastWeekRange },
  { label: "Last month",   range: lastMonthRange },
  { label: "Last quarter", range: lastQuarterRange },
  { label: "Last FY",      range: lastFyRange },
];

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function rangeLabel(value: DateRange | null): string {
  if (!value?.from) return "All time";
  if (!value.to || value.from.toDateString() === value.to.toDateString()) return fmtDate(value.from);
  return `${fmtDate(value.from)} – ${fmtDate(value.to)}`;
}

export function DateRangePicker({
  value,
  onChange,
}: {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const hasValue = !!value?.from;

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
          hasValue
            ? "border-gray-900 bg-gray-900 text-white"
            : open
            ? "border-gray-400 bg-white text-gray-900"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
          <rect x="1" y="2" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
          <path d="M1 5h12" stroke="currentColor" strokeWidth="1.25" />
          <path d="M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
        <span>{rangeLabel(value)}</span>
        {hasValue ? (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onChange(null); setActivePreset(null); }}
            className="ml-0.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="ml-0.5 text-gray-400 shrink-0">
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl flex overflow-hidden">
          {/* Presets */}
          <div className="flex flex-col py-3 px-2 border-r border-gray-100 gap-0.5 min-w-32.5">
            <button
              onClick={() => { onChange(null); setActivePreset(null); setOpen(false); }}
              className={`px-3 py-2 text-left text-sm font-medium rounded-lg transition-colors ${
                !hasValue ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              All time
            </button>
            {PRESETS.map((p) => {
              const active = hasValue && activePreset === p.label;
              return (
                <button
                  key={p.label}
                  onClick={() => { onChange(p.range()); setActivePreset(p.label); setOpen(false); }}
                  className={`px-3 py-2 text-left text-sm font-medium rounded-lg transition-colors ${
                    active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Calendar */}
          <div className="p-4 rdp-admin-wrap">
            <style>{`
              .rdp-admin-wrap .rdp-root {
                --rdp-accent-color: #111827;
                --rdp-accent-background-color: #f3f4f6;
                --rdp-day-height: 36px;
                --rdp-day-width: 36px;
                --rdp-day_button-height: 34px;
                --rdp-day_button-width: 34px;
                --rdp-day_button-border-radius: 8px;
                --rdp-day_button-border: none;
                --rdp-months-gap: 2rem;
                --rdp-range_start-date-background-color: #111827;
                --rdp-range_end-date-background-color: #111827;
                --rdp-range_start-color: white;
                --rdp-range_end-color: white;
                --rdp-range_middle-background-color: #f3f4f6;
                --rdp-range_middle-color: #111827;
                --rdp-today-color: #111827;
                --rdp-nav_button-height: 2rem;
                --rdp-nav_button-width: 2rem;
              }
              .rdp-admin-wrap .rdp-caption_label {
                font-size: 13px;
                font-weight: 700;
                color: #111827;
              }
              .rdp-admin-wrap .rdp-weekday {
                font-size: 11px;
                color: #9ca3af;
              }
              .rdp-admin-wrap .rdp-day_button {
                font-size: 13px;
              }
              .rdp-admin-wrap .rdp-outside {
                opacity: 0.3;
              }
            `}</style>
            <DayPicker
              mode="range"
              resetOnSelect
              selected={value ?? undefined}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  onChange(range);
                  setActivePreset(null);
                  setOpen(false);
                } else {
                  onChange(range ?? null);
                  setActivePreset(null);
                }
              }}
              numberOfMonths={2}
              disabled={{ after: new Date() }}
              endMonth={new Date()}
              defaultMonth={new Date(new Date().getFullYear(), new Date().getMonth() - 1)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

