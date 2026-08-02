"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { findPlanByGatewayPlanId, getAllBillingOptions } from "@/lib/plans";
import { DateRangePicker, type DateRange } from "@/components/admin/DateRangePicker";
import { PlanSelect } from "@/components/admin/PlanSelect";
import { Pagination } from "@/components/admin/Pagination";

type Invoice = {
  id: string;
  invoiceNumber: string;
  financialYear: string;
  invoiceDate: string;
  customerName: string;
  customerEmail: string;
  planId: string;
  planName: string;
  periodStart: string | null;
  periodEnd: string | null;
  totalAmount: number;
  currency: string;
  prefix: string;
  pdfUrl: string | null;
  razorpaySubscriptionId: string;
  user: { id: string; name: string; email: string; username: string } | null;
};

type PaginationInfo = { page: number; total: number; totalPages: number };

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtAmount(amount: number, currency: string) {
  if (currency === "USD") return `$${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `₹${(amount / 100).toLocaleString("en-IN")}`;
}

function initials(name: string) {
  return name.trim().split(/\s+/).map((p) => p[0]?.toUpperCase() ?? "").join("").slice(0, 2) || "?";
}

function planLabel(planId: string, fallback: string) {
  const r = findPlanByGatewayPlanId("razorpay", planId);
  return r
    ? `${r.plan.name} · ${r.billingOption.frequency.charAt(0).toUpperCase() + r.billingOption.frequency.slice(1)}`
    : fallback;
}

function SortIcon({ field, sort, sortDir }: { field: string; sort: string; sortDir: string }) {
  if (sort !== field) return <span className="text-gray-300 ml-0.5 text-[10px]">↕</span>;
  return <span className="ml-0.5 text-[10px]">{sortDir === "asc" ? "↑" : "↓"}</span>;
}

function InvoicesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const prefix  = searchParams.get("prefix") ?? "";
  const planId  = searchParams.get("planId") ?? "";
  const from    = searchParams.get("from") ?? "";
  const to      = searchParams.get("to") ?? "";
  const sort    = searchParams.get("sort") ?? "invoiceDate";
  const sortDir = searchParams.get("sortDir") ?? "desc";
  const limit   = parseInt(searchParams.get("limit") ?? "25");

  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");

  const { data: result, isLoading } = useSWR<{
    data: Invoice[];
    pagination: PaginationInfo;
    totals: { inrTotal: number; usdTotal: number };
  }>(`/api/admin/invoices?${searchParams.toString()}`)

  const invoices   = result?.data ?? [];
  const pagination = result?.pagination ?? null;
  const totals     = result?.totals ?? { inrTotal: 0, usdTotal: 0 };

  const planOptions = useMemo(() =>
    getAllBillingOptions()
      .filter(({ billingOption }) => billingOption.razorpayDetails?.planId)
      .map(({ plan, billingOption }) => ({
        id: billingOption.razorpayDetails!.planId,
        name: `${plan.name} · ${billingOption.frequency.charAt(0).toUpperCase() + billingOption.frequency.slice(1)}`,
      })),
  []);

  const dateRange: DateRange | null = from
    ? { from: new Date(from), to: to ? new Date(to) : undefined }
    : null;

  // Debounce search input → URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      if (searchInput) params.set("search", searchInput);
      else params.delete("search");
      router.replace(`${pathname}?${params.toString()}`);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps


  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  }

  function setPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (p > 1) params.set("page", String(p));
    else params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  function setLimit(n: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.set("limit", String(n));
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handleSort(field: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.set("sort", field);
    if (sort === field) {
      params.set("sortDir", sortDir === "asc" ? "desc" : "asc");
    } else {
      params.set("sortDir", "desc");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handleDateChange(range: DateRange | null) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (range?.from) params.set("from", range.from.toISOString().split("T")[0]);
    else params.delete("from");
    if (range?.to) params.set("to", range.to.toISOString().split("T")[0]);
    else params.delete("to");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">Invoices</h1>
        <p className="text-sm text-gray-400 mt-1">
          {isLoading
            ? "Loading…"
            : `${(pagination?.total ?? 0).toLocaleString()} invoice${pagination?.total !== 1 ? "s" : ""} total`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by invoice #, name or email…"
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors bg-white w-full sm:w-72"
        />
        <DateRangePicker value={dateRange} onChange={handleDateChange} />
        {/* Prefix filter */}
        <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm">
          {[
            { value: "",     label: "All" },
            { value: "KLT",  label: "INR" },
            { value: "KLTI", label: "USD" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setParam("prefix", opt.value)}
              className={`px-3 py-2 font-semibold transition-colors ${
                prefix === opt.value
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {planOptions.length > 0 && (
          <PlanSelect
            value={planId || "all"}
            onChange={(v) => setParam("planId", v === "all" ? "" : v)}
            options={planOptions}
          />
        )}
      </div>

      {/* Summary bar */}
      {!isLoading && (totals.inrTotal > 0 || totals.usdTotal > 0) && (
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs text-gray-400">
            {pagination?.total ?? 0} invoice{pagination?.total !== 1 ? "s" : ""} shown
          </p>
          <div className="flex items-center gap-3">
            {totals.inrTotal > 0 && <p className="text-sm font-black text-gray-900">{fmtAmount(totals.inrTotal, "INR")}</p>}
            {totals.usdTotal > 0 && <p className="text-sm font-black text-gray-900">{fmtAmount(totals.usdTotal, "USD")}</p>}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <p className="px-6 py-12 text-sm text-gray-400 text-center">Loading invoices…</p>
        ) : invoices.length === 0 ? (
          <p className="px-6 py-12 text-sm text-gray-400 text-center">No invoices found</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50">
              <button
                onClick={() => handleSort("invoiceDate")}
                className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-32 text-left cursor-pointer hover:text-gray-600 transition-colors"
              >
                Invoice # <SortIcon field="invoiceDate" sort={sort} sortDir={sortDir} />
              </button>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Customer</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-36">Plan</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-44 text-center">Period</p>
              <button
                onClick={() => handleSort("totalAmount")}
                className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-24 text-right cursor-pointer hover:text-gray-600 transition-colors"
              >
                Amount <SortIcon field="totalAmount" sort={sort} sortDir={sortDir} />
              </button>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-16 text-center">PDF</p>
            </div>

            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3.5 items-center"
              >
                {/* Invoice # */}
                <div className="w-32">
                  <p className="text-xs font-mono font-semibold text-gray-800">{inv.invoiceNumber}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(inv.invoiceDate)}</p>
                </div>

                {/* Customer */}
                {inv.user ? (
                  <Link
                    href={`/admin/users/${inv.user.id}`}
                    className="flex items-center gap-2.5 min-w-0 group"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#f9f3f4] flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-black text-primary">{initials(inv.user.name || inv.user.username)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                        {inv.customerName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{inv.customerEmail}</p>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-black text-gray-400">?</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-700 truncate">{inv.customerName}</p>
                      <p className="text-xs text-gray-400 truncate">{inv.customerEmail}</p>
                    </div>
                  </div>
                )}

                {/* Plan */}
                <p className="text-xs font-semibold text-gray-700 w-36">
                  {planLabel(inv.planId, inv.planName)}
                </p>

                {/* Period */}
                <div className="w-44 text-center">
                  {inv.periodStart && inv.periodEnd ? (
                    <p className="text-xs text-gray-500">
                      {fmtDate(inv.periodStart)} – {fmtDate(inv.periodEnd)}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-300">—</p>
                  )}
                </div>

                {/* Amount */}
                <div className="w-24 text-right">
                  <p className="text-sm font-black text-gray-900">{fmtAmount(inv.totalAmount, inv.currency)}</p>
                </div>

                {/* PDF */}
                <div className="w-16 flex justify-center">
                  {inv.pdfUrl ? (
                    <a
                      href={inv.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      PDF
                    </a>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}
    </div>
  );
}

export default function AdminInvoicesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-400">Loading…</div>}>
      <InvoicesContent />
    </Suspense>
  );
}
