"use client";

import { useState } from "react";
import Button from "@/components/reusable/Button";
import { COUNTRY_CODES } from "@/lib/country-codes";
import { BILLING_COUNTRIES, STATES_BY_COUNTRY } from "@/lib/states-by-country";
import { getStateFromGstin } from "@/lib/gst-states";

interface BillingProfile {
  name: string;
  phone: string;
  phone_country_code: string;
  gstin?: string;
  company_name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

interface Props {
  initial?: Partial<BillingProfile>;
  onSave: (profile: BillingProfile) => Promise<void>;
  onCancel: () => void;
}

export function BillingDetailsModal({ initial = {}, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial.name ?? "");
  const [countryCode, setCountryCode] = useState(initial.phone_country_code ?? "+91");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [gstin, setGstin] = useState(initial.gstin ?? "");
  const [companyName, setCompanyName] = useState(initial.company_name ?? "");
  const [addressLine1, setAddressLine1] = useState(initial.address_line1 ?? "");
  const [addressLine2, setAddressLine2] = useState(initial.address_line2 ?? "");
  const [city, setCity] = useState(initial.city ?? "");
  const [country, setCountry] = useState(initial.country ?? "IN");
  const [state, setState] = useState(initial.state ?? "");
  const [pincode, setPincode] = useState(initial.pincode ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showGstFields = gstin.trim().length > 0;
  const gstinState = gstin.trim().length >= 2 ? getStateFromGstin(gstin.trim()) : undefined;
  const stateOptions = STATES_BY_COUNTRY[country] ?? [];

  function handleCountryChange(iso: string) {
    setCountry(iso);
    // Reset state if the current value isn't in the new country's list
    const options = STATES_BY_COUNTRY[iso] ?? [];
    if (options.length > 0 && !options.includes(state)) {
      setState("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError("Name is required"); return; }
    if (!phone.trim()) { setError("Phone number is required"); return; }
    if (!state.trim()) { setError("State is required"); return; }
    if (showGstFields) {
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin.trim().toUpperCase())) {
        setError("Invalid GSTIN format (e.g. 24AAAAA0000A1Z5)"); return;
      }
      if (!companyName.trim()) { setError("Company name is required when GSTIN is provided"); return; }
      if (!addressLine1.trim()) { setError("Address Line 1 is required when GSTIN is provided"); return; }
      if (!city.trim()) { setError("City is required when GSTIN is provided"); return; }
      if (!pincode.trim()) { setError("Pincode is required when GSTIN is provided"); return; }
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        phone: phone.trim(),
        phone_country_code: countryCode,
        state: gstinState ?? state.trim(),
        country,
        ...(showGstFields && {
          gstin: gstin.trim().toUpperCase(),
          company_name: companyName.trim(),
          address_line1: addressLine1.trim(),
          address_line2: addressLine2.trim() || undefined,
          city: city.trim(),
          pincode: pincode.trim(),
        }),
      });
    } catch (err: any) {
      setError(err?.message ?? "Failed to save billing details");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-bold text-gray-900">Billing Details</h2>
          <p className="text-sm text-gray-500">Required for generating your invoice.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Full Name" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className={inputCls}
            />
          </Field>

          <Field label="Mobile Number" required>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className={selectCls + " shrink-0"}
              >
                {COUNTRY_CODES.map(({ code, iso, flag }) => (
                  <option key={iso} value={code}>
                    {flag} {code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
                className={`${inputCls} flex-1`}
              />
            </div>
          </Field>

          <Field label="GST Number" hint="Optional — for business invoices">
            <input
              type="text"
              value={gstin}
              onChange={(e) => {
                const val = e.target.value;
                setGstin(val);
                const detected = val.trim().length >= 2 ? getStateFromGstin(val.trim()) : undefined;
                if (detected) setState(detected);
              }}
              placeholder="24AAAAA0000A1Z5"
              maxLength={15}
              className={`${inputCls} uppercase`}
            />
          </Field>

          <Field label="State / Province" required>
            {gstinState ? (
              <input
                type="text"
                value={gstinState}
                readOnly
                className={`${inputCls} opacity-60 cursor-not-allowed`}
              />
            ) : stateOptions.length > 0 ? (
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={selectCls + " w-full"}
              >
                <option value="">Select state</option>
                {stateOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State / Province / Region"
                className={inputCls}
              />
            )}
          </Field>

          <Field label="Country">
            <select
              value={country}
              disabled
              className={selectCls + " w-full opacity-50 cursor-not-allowed"}
            >
              {BILLING_COUNTRIES.map(({ iso, name: countryName }) => (
                <option key={iso} value={iso}>{countryName}</option>
              ))}
            </select>
          </Field>

          {showGstFields && (
            <>
              <div className="h-px bg-gray-100" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Company Details</p>

              <Field label="Company Name" required>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Pvt Ltd"
                  className={inputCls}
                />
              </Field>

              <Field label="Address Line 1" required>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Building / Street"
                  className={inputCls}
                />
              </Field>

              <Field label="Address Line 2">
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Area / Landmark (optional)"
                  className={inputCls}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="City" required>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    className={inputCls}
                  />
                </Field>
                <Field label="Pincode" required>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="400001"
                    maxLength={6}
                    className={inputCls}
                  />
                </Field>
              </div>

            </>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex flex-col gap-2 pt-1">
            <Button type="submit" variant="primary" size="md" fullWidth className="rounded-2xl" disabled={saving}>
              {saving ? "Saving…" : "Continue to Payment"}
            </Button>
            <Button type="button" variant="default" size="md" fullWidth className="rounded-2xl" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors";
const selectCls = "border border-gray-200 rounded-xl px-2 py-2 text-sm outline-none focus:border-gray-400 transition-colors bg-white";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        {hint && <span className="font-normal text-gray-400 ml-1">({hint})</span>}
      </label>
      {children}
    </div>
  );
}
