"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom"; // TODO: REMOVE WHEN LAUNCHING IN USA
import { BillingDetailsModal } from "@/components/BillingDetailsModal";
import { useUser } from "@/contexts/UserContext";
import { useLocale } from "@/contexts/LocaleContext";
import { trackPixelEvent } from "@/lib/pixel";
import { findPlanByGatewayPlanId } from "@/lib/plans";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load script"));
    document.body.appendChild(script);
  });
}

type ChildProps = {
  onSubscribe: () => Promise<void>;
  loading: boolean;
  success: boolean | null;
  error: string | null;
  paymentResponse: any | null;
};

type Props = {
  userId: string;
  planId: string;
  startAt?: number;
  children: (props: ChildProps) => React.ReactNode;
  onSuccess?: (data: any) => void;
  onError?: (err: string | Error) => void;
  onLoadingChange?: (loading: boolean) => void;
};

export default function SubscribeButtonHOC({
  userId,
  planId,
  startAt,
  children,
  onSuccess,
  onError,
  onLoadingChange,
}: Props) {
  const { email } = useUser();
  const { country: localeCountry } = useLocale();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentResponse, setPaymentResponse] = useState<any | null>(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingInitial, setBillingInitial] = useState<Record<string, string>>({});
  const [showComingSoonModal, setShowComingSoonModal] = useState(false); // TODO: REMOVE WHEN LAUNCHING IN USA

  useEffect(() => {
    loadScript("https://checkout.razorpay.com/v1/checkout.js").catch(() => {});
  }, []);

  async function openRazorpay(prefill?: { name?: string; email?: string; contact?: string }) {
    try {
      if (!planId || !planId.trim()) throw new Error("Invalid plan ID");

      const res = await fetch("/api/payments/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId.trim(), user_id: userId, ...(startAt && { start_at: startAt }) }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to create subscription");
      }

      const data = await res.json();
      const subscriptionId = data.subscription_id;

      if (!window.Razorpay) await loadScript("https://checkout.razorpay.com/v1/checkout.js");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscriptionId,
        name: "Kloot",
        description: "Subscription Checkout",
        image: `${process.env.NEXT_PUBLIC_APP_URL}/assets/images/logo/logo-k-transparent.png`,
        prefill: {
          name: prefill?.name ?? "",
          email: prefill?.email ?? "",
          contact: prefill?.contact ?? "",
        },
        handler: async function (resp: any) {
          setPaymentResponse(resp);
          try {
            const verify = await fetch("/api/payments/verify-subscription", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: resp.razorpay_payment_id,
                subscription_id: subscriptionId,
                razorpay_signature: resp.razorpay_signature,
              }),
            });
            const v = await verify.json().catch(() => ({}));
            if (verify.ok && v.success) {
              const planData = findPlanByGatewayPlanId("razorpay", planId);
              trackPixelEvent("Purchase", {
                currency: planData?.currency ?? "USD",
                value: planData?.billingOption.amount ?? 0,
              });
              setSuccess(true);
              onSuccess?.(v);
            } else {
              const msg = v?.error || "Subscription verification failed";
              setError(msg);
              setSuccess(false);
              onError?.(msg);
            }
          } catch (err: any) {
            const msg = err?.message || "Verification request failed";
            setError(msg);
            setSuccess(false);
            onError?.(err as Error);
          }
        },
        modal: {
          ondismiss: () => {
            const msg = "Subscription flow cancelled";
            setError(msg);
            onError?.(msg);
          },
        },
      } as any;

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        const msg = resp?.error?.description || "Payment failed";
        setError(msg);
        setSuccess(false);
        setPaymentResponse(resp);
        onError?.(msg);
      });
      rzp.open();
    } catch (err: any) {
      const msg = err?.message || "Unable to start payment";
      setError(msg);
      onError?.(err as Error || msg);
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  }

  async function onSubscribe() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    onLoadingChange?.(true);
    const planData = findPlanByGatewayPlanId("razorpay", planId);
    trackPixelEvent("InitiateCheckout", {
      currency: planData?.currency ?? "USD",
      value: planData?.billingOption.amount ?? 0,
    });

    try {
      const res = await fetch("/api/billing/profile");
      const { profile } = await res.json().catch(() => ({ profile: null }));

      setBillingInitial({
        name: profile?.name ?? "",
        phone: profile?.phone ?? "",
        phone_country_code: profile?.phone_country_code,
        gstin: profile?.gstin ?? "",
        company_name: profile?.company_name ?? "",
        address_line1: profile?.address_line1 ?? "",
        address_line2: profile?.address_line2 ?? "",
        city: profile?.city ?? "",
        country: profile?.country ?? localeCountry ?? "US",
        state: profile?.state ?? "",
        pincode: profile?.pincode ?? "",
      });
      setShowBillingModal(true);
      setLoading(false);
      onLoadingChange?.(false);
    } catch {
      setLoading(false);
      onLoadingChange?.(false);
    }
  }

  async function handleBillingSave(profile: Record<string, any>) {
    const res = await fetch("/api/billing/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error ?? "Failed to save billing details");
    }
    setShowBillingModal(false);

    // TODO: REMOVE WHEN LAUNCHING IN USA — saves billing details but blocks Razorpay for USD plans
    const planData = findPlanByGatewayPlanId("razorpay", planId);
    if (planData?.currency === "USD") { setShowComingSoonModal(true); return; }
    // END TODO

    setLoading(true);
    onLoadingChange?.(true);
    await openRazorpay({
      name: profile.name ?? "",
      email: email ?? "",
      contact: `${profile.phone_country_code ?? "+1"}${profile.phone ?? ""}`,
    });
  }

  return (
    <>
      {showBillingModal && (
        <BillingDetailsModal
          initial={billingInitial}
          onSave={handleBillingSave}
          onCancel={() => {
            setShowBillingModal(false);
            setLoading(false);
            onLoadingChange?.(false);
          }}
        />
      )}
      {/* TODO: REMOVE WHEN LAUNCHING IN USA — "not live yet" modal shown after billing save for USD plans */}
      {showComingSoonModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowComingSoonModal(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 flex flex-col items-center gap-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-[#fff4f1] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="#ff7350" />
              </svg>
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-lg font-black text-gray-900">We&apos;re not live in your region yet</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                We&apos;ve saved your details and will reach out to you as soon as we launch near you. Stay tuned!
              </p>
            </div>
            <button
              onClick={() => setShowComingSoonModal(false)}
              className="mt-2 w-full py-3 rounded-2xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>,
        document.body
      )}
      {/* END TODO */}
      {typeof children === "function"
        ? children({ onSubscribe, loading, success, error, paymentResponse })
        : null}
    </>
  );
}
