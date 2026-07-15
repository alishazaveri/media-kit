"use client";

import React, { useEffect, useState } from "react";
import { BillingDetailsModal } from "@/components/BillingDetailsModal";
import { useUser } from "@/contexts/UserContext";
import { trackPixelEvent } from "@/lib/pixel";
import { getPricingByPlanId } from "@/lib/plans";

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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentResponse, setPaymentResponse] = useState<any | null>(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingInitial, setBillingInitial] = useState<Record<string, string>>({});

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
              const pricing = getPricingByPlanId(planId);
              trackPixelEvent("Purchase", {
                currency: "INR",
                value: pricing?.pricing.price ?? 0,
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
    const pricing = getPricingByPlanId(planId);
    trackPixelEvent("InitiateCheckout", {
      currency: "INR",
      value: pricing?.pricing.price ?? 0,
    });

    try {
      const res = await fetch("/api/billing/profile");
      const { profile } = await res.json().catch(() => ({ profile: null }));

      setBillingInitial({
        name: profile?.name ?? "",
        phone: profile?.phone ?? "",
        phone_country_code: profile?.phone_country_code ?? "+91",
        gstin: profile?.gstin ?? "",
        company_name: profile?.company_name ?? "",
        address_line1: profile?.address_line1 ?? "",
        address_line2: profile?.address_line2 ?? "",
        city: profile?.city ?? "",
        country: profile?.country ?? "IN",
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
    setLoading(true);
    onLoadingChange?.(true);
    await openRazorpay({
      name: profile.name ?? "",
      email: email ?? "",
      contact: `${profile.phone_country_code ?? "+91"}${profile.phone ?? ""}`,
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
      {typeof children === "function"
        ? children({ onSubscribe, loading, success, error, paymentResponse })
        : null}
    </>
  );
}
