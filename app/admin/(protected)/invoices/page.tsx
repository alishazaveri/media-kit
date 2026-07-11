"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import { getPricingByPlanId } from "@/lib/plans";
import { DateRangePicker, type DateRange } from "@/components/admin/DateRangePicker";
import { PlanSelect } from "@/components/admin/PlanSelect";

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
  pdfUrl: string | null;
  razorpaySubscriptionId: string;
  user: { id: string; name: string; email: string; username: string } | null;
};

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtPaise(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function initials(name: string) {
  return name.trim().split(/\s+/).map((p) => p[0]?.toUpperCase() ?? "").join("").slice(0, 2) || "?";
}

function planLabel(planId: string, fallback: string) {
  const r = getPricingByPlanId(planId);
  return r ? `${r.plan.name} · ${r.billing.charAt(0).toUpperCase() + r.billing.slice(1)}` : fallback;
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [planFilter, setPlanFilter] = useState<string>("all");

  useEffect(() => {
    axios.get("/api/admin/invoices")
      .then((res) => setInvoices(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const planOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const inv of invoices) {
      if (!seen.has(inv.planId)) seen.set(inv.planId, inv.planName);
    }
    return [...seen.entries()].map(([id, name]) => ({ id, name: planLabel(id, name) }));
  }, [invoices]);

  const filtered = useMemo(() => {
    const toDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    return invoices.filter((inv) => {
      if (planFilter !== "all" && inv.planId !== planFilter) return false;
      if (dateRange?.from) {
        const d = toDay(new Date(inv.invoiceDate));
        if (d < toDay(dateRange.from)) return false;
        if (dateRange.to && d > toDay(dateRange.to)) return false;
      }
      const q = search.toLowerCase();
      if (!q) return true;
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.customerEmail.toLowerCase().includes(q) ||
        inv.user?.username?.toLowerCase().includes(q)
      );
    });
  }, [invoices, search, dateRange, planFilter]);

  const totalFiltered = filtered.reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">Invoices</h1>
        <p className="text-sm text-gray-400 mt-1">
          {loading ? "Loading…" : `${invoices.length} invoice${invoices.length !== 1 ? "s" : ""} total`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by invoice #, name or email…"
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors bg-white w-full sm:w-72"
        />
        <DateRangePicker value={dateRange} onChange={setDateRange} />
        {planOptions.length > 1 && (
          <PlanSelect value={planFilter} onChange={setPlanFilter} options={planOptions} />
        )}
      </div>

      {/* Summary bar */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs text-gray-400">{filtered.length} invoice{filtered.length !== 1 ? "s" : ""} shown</p>
          <p className="text-sm font-black text-gray-900">{fmtPaise(totalFiltered)}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <p className="px-6 py-12 text-sm text-gray-400 text-center">Loading invoices…</p>
        ) : filtered.length === 0 ? (
          <p className="px-6 py-12 text-sm text-gray-400 text-center">No invoices found</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-32">Invoice #</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Customer</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-36">Plan</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-44 text-center">Period</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-24 text-right">Amount</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-16 text-center">PDF</p>
            </div>

            {filtered.map((inv) => (
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
                  <p className="text-sm font-black text-gray-900">{fmtPaise(inv.totalAmount)}</p>
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
    </div>
  );
}
