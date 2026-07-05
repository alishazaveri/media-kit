import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { IInvoice } from "@/db/models/invoice";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf" },
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAw.ttf", fontWeight: "bold" },
  ],
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRupees(paise: number): string {
  const rupees = (paise / 100).toFixed(2);
  const [whole, dec] = rupees.split(".");
  const lastThree = whole.slice(-3);
  const rest = whole.slice(0, -3);
  const formatted = rest
    ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
    : lastThree;
  return `₹${formatted}.${dec}`;
}

function formatDate(d: Date | string): string {
  const date = new Date(d);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

import { ToWords } from "to-words";

const toWords = new ToWords({ localeCode: "en-IN" });

function amountInWords(paise: number): string {
  return toWords.convert(paise / 100, { currency: true });
}

// ── Styles ────────────────────────────────────────────────────────────────────

const C = {
  black: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  headerBg: "#f3f4f6",
  tableBg: "#f9fafb",
  white: "#ffffff",
};

const s = StyleSheet.create({
  page: { fontFamily: "Roboto", fontSize: 9, color: C.black, padding: 40, backgroundColor: C.white },
  row: { flexDirection: "row" },
  flex1: { flex: 1 },

  // ── Header ──
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  supplierName: { fontSize: 13, fontWeight: "bold", marginBottom: 3 },
  supplierDetail: { color: C.muted, marginBottom: 1, lineHeight: 1 },
  invoiceTitle: { fontSize: 18, fontWeight: "bold", textAlign: "right", marginBottom: 6, letterSpacing: 1 },
  invoiceMetaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  invoiceMeta: { color: C.muted },
  invoiceMetaValue: { fontWeight: "bold" },

  // ── Section ──
  section: { marginBottom: 14 },
  sectionLabel: { fontSize: 7.5, fontWeight: "bold", color: C.muted, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 5 },
  sectionValue: { marginBottom: 1, lineHeight: 1 },

  // ── Divider ──
  divider: { borderBottomWidth: 1, borderBottomColor: C.border, marginBottom: 14 },

  // ── Table ──
  tableHeader: { flexDirection: "row", backgroundColor: C.black, padding: "6 8", borderRadius: 2 },
  tableHeaderText: { color: C.white, fontWeight: "bold", fontSize: 8 },
  tableRow: { flexDirection: "row", padding: "7 8", borderBottomWidth: 1, borderBottomColor: C.border },
  tableRowAlt: { backgroundColor: C.tableBg },

  // table columns
  colDesc: { flex: 1 },
  colSac: { width: 52, textAlign: "center" },
  colTaxable: { width: 80, textAlign: "right" },
  colTax: { width: 52, textAlign: "center" },
  colTotal: { width: 80, textAlign: "right" },

  // ── Summary ──
  summaryRow: { flexDirection: "row", justifyContent: "flex-end", paddingVertical: 3 },
  summaryLabel: { width: 120, textAlign: "right", color: C.muted, paddingRight: 12 },
  summaryValue: { width: 90, textAlign: "right" },
  summaryTotalRow: { flexDirection: "row", justifyContent: "flex-end", paddingVertical: 5, borderTopWidth: 1.5, borderTopColor: C.black, marginTop: 3 },
  summaryTotalLabel: { width: 120, textAlign: "right", paddingRight: 12, fontWeight: "bold" },
  summaryTotalValue: { width: 90, textAlign: "right", fontWeight: "bold", fontSize: 10 },

  // ── Amount in words ──
  amountWords: { backgroundColor: C.tableBg, borderRadius: 4, padding: "8 10", marginBottom: 14 },
  amountWordsLabel: { fontSize: 7.5, color: C.muted, marginBottom: 3 },
  amountWordsValue: { fontWeight: "bold" },

  // ── Footer ──
  footerMeta: { flexDirection: "row", gap: 20, marginBottom: 10 },
  footerLabel: { color: C.muted, marginBottom: 2 },
  computerGenerated: { marginTop: "auto", paddingTop: 16, textAlign: "center", fontSize: 7.5, color: C.muted },
});

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  invoice: IInvoice;
}

export function InvoicePDF({ invoice }: Props) {
  const taxRate = invoice.tax_type === "cgst_sgst"
    ? `${invoice.cgst_rate}% + ${invoice.sgst_rate}%`
    : `${invoice.igst_rate}%`;

  const billedTo = invoice.customer_company_name || invoice.customer_name;
  const hasAddress = invoice.customer_address_line1 || invoice.customer_city;

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.flex1}>
            <Text style={s.supplierName}>{invoice.supplier_name}</Text>
            <Text style={s.supplierDetail}>GSTIN: {invoice.supplier_gstin}</Text>
            <Text style={s.supplierDetail}>{invoice.supplier_address_line1}</Text>
            {invoice.supplier_address_line2 && (
              <Text style={s.supplierDetail}>{invoice.supplier_address_line2}</Text>
            )}
            <Text style={s.supplierDetail}>
              {invoice.supplier_city}, {invoice.supplier_state} – {invoice.supplier_pincode}
            </Text>
          </View>

          <View style={{ width: 140 }}>
            <Text style={s.invoiceTitle}>TAX INVOICE</Text>
            <View style={s.invoiceMetaRow}>
              <Text style={s.invoiceMeta}>Invoice No:</Text>
              <Text style={s.invoiceMetaValue}>{invoice.invoice_number}</Text>
            </View>
            <View style={s.invoiceMetaRow}>
              <Text style={s.invoiceMeta}>Date:</Text>
              <Text style={s.invoiceMetaValue}>{formatDate(invoice.invoice_date)}</Text>
            </View>
          </View>
        </View>

        <View style={s.divider} />

        {/* ── Bill To ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Bill To</Text>
          <Text style={[s.sectionValue, { fontWeight: "bold" }]}>{billedTo}</Text>
          {invoice.customer_gstin && (
            <Text style={s.sectionValue}>GSTIN: {invoice.customer_gstin}</Text>
          )}
          {invoice.customer_company_name && invoice.customer_name !== billedTo && (
            <Text style={s.sectionValue}>{invoice.customer_name}</Text>
          )}
          {hasAddress && (
            <>
              {invoice.customer_address_line1 && (
                <Text style={s.sectionValue}>{invoice.customer_address_line1}</Text>
              )}
              {invoice.customer_address_line2 && (
                <Text style={s.sectionValue}>{invoice.customer_address_line2}</Text>
              )}
              {invoice.customer_city && (
                <Text style={s.sectionValue}>
                  {invoice.customer_city}
                  {invoice.customer_state ? `, ${invoice.customer_state}` : ""}
                  {invoice.customer_pincode ? ` – ${invoice.customer_pincode}` : ""}
                </Text>
              )}
            </>
          )}
          {invoice.customer_phone && (
            <Text style={[s.sectionValue, { color: C.muted }]}>{invoice.customer_phone}</Text>
          )}
        </View>

        <View style={s.divider} />

        {/* ── Line item table ── */}
        <View style={s.section}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderText, s.colDesc]}>Description</Text>
            <Text style={[s.tableHeaderText, s.colSac]}>HSN/SAC Code</Text>
            <Text style={[s.tableHeaderText, s.colTaxable]}>Taxable Amt</Text>
            <Text style={[s.tableHeaderText, s.colTax]}>Tax Rate</Text>
            <Text style={[s.tableHeaderText, s.colTotal]}>Total</Text>
          </View>

          <View style={s.tableRow}>
            <Text style={[s.colDesc]}>{invoice.service_description}</Text>
            <Text style={[s.colSac]}>{invoice.sac_code}</Text>
            <Text style={[s.colTaxable]}>{formatRupees(invoice.taxable_amount)}</Text>
            <Text style={[s.colTax]}>{taxRate}</Text>
            <Text style={[s.colTotal]}>{formatRupees(invoice.total_amount)}</Text>
          </View>
        </View>

        {/* ── Tax summary ── */}
        <View style={{ marginBottom: 20 }}>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Taxable Amount</Text>
            <Text style={s.summaryValue}>{formatRupees(invoice.taxable_amount)}</Text>
          </View>

          {invoice.tax_type === "cgst_sgst" ? (
            <>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>CGST @ {invoice.cgst_rate}%</Text>
                <Text style={s.summaryValue}>{formatRupees(invoice.cgst_amount ?? 0)}</Text>
              </View>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>SGST @ {invoice.sgst_rate}%</Text>
                <Text style={s.summaryValue}>{formatRupees(invoice.sgst_amount ?? 0)}</Text>
              </View>
            </>
          ) : (
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>IGST @ {invoice.igst_rate}%</Text>
              <Text style={s.summaryValue}>{formatRupees(invoice.igst_amount ?? 0)}</Text>
            </View>
          )}

          <View style={s.summaryTotalRow}>
            <Text style={s.summaryTotalLabel}>Total Amount</Text>
            <Text style={s.summaryTotalValue}>{formatRupees(invoice.total_amount)}</Text>
          </View>
        </View>

        <View style={s.amountWords}>
          <Text style={s.amountWordsLabel}>Amount in Words</Text>
          <Text style={s.amountWordsValue}>{amountInWords(invoice.total_amount)}</Text>
        </View>

        <View style={s.divider} />
        <View style={s.footerMeta}>
          <View>
            <Text style={s.footerLabel}>Place of Supply</Text>
            <Text>{invoice.place_of_supply}</Text>
          </View>
          <View>
            <Text style={s.footerLabel}>Payment Reference</Text>
            <Text>{invoice.razorpay_payment_id}</Text>
          </View>
        </View>
        <Text style={s.computerGenerated}>This is a computer generated invoice and does not require a signature</Text>

      </Page>
    </Document>
  );
}
