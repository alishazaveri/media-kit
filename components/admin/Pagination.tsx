"use client";

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

interface Props {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

function getPages(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (page > 3) pages.push("…");
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
  if (page < totalPages - 2) pages.push("…");
  pages.push(totalPages);
  return pages;
}

export function Pagination({ page, totalPages, total, limit, onPageChange, onLimitChange }: Props) {
  const pages = getPages(page, Math.max(1, totalPages));
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1 mt-4">
      {/* Row 1 on mobile: total + per-page */}
      <div className="flex items-center justify-between sm:justify-start gap-3">
        <p className="text-xs text-gray-400">{total.toLocaleString()} total</p>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-500 bg-white outline-none focus:border-gray-400 transition-colors"
        >
          {PER_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>{n} / page</option>
          ))}
        </select>
      </div>

      {/* Row 2 on mobile: prev / page numbers / next */}
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
        >
          ← Prev
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="hidden sm:inline px-1.5 text-xs text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`hidden sm:flex w-8 h-8 items-center justify-center text-xs font-semibold rounded-lg transition-colors ${
                p === page
                  ? "bg-gray-900 text-white"
                  : "border border-gray-200 text-gray-500 hover:border-gray-400 bg-white"
              }`}
            >
              {p}
            </button>
          )
        )}
        <span className="sm:hidden text-xs text-gray-400 px-2">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
