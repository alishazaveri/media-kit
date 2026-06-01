"use client";

import React, { useEffect, useState } from "react";

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
  children: (props: ChildProps) => React.ReactNode;
  onSuccess?: (data: any) => void;
  onError?: (err: string | Error) => void;
  onLoadingChange?: (loading: boolean) => void;
};

export default function SubscribeButtonHOC({
  userId,
  planId,
  children,
  onSuccess,
  onError,
  onLoadingChange,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentResponse, setPaymentResponse] = useState<any | null>(null);

  useEffect(() => {
    loadScript("https://checkout.razorpay.com/v1/checkout.js").catch(() => {
      // ignore — we'll try loading again when initiating payment
    });
  }, []);

  async function onSubscribe() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    onLoadingChange?.(true);

    try {
      if (!planId || !planId.trim()) {
        throw new Error("Invalid plan ID");
      }

      const res = await fetch("/api/payments/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId.trim(), user_id: userId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data?.error || "Failed to create subscription";
        setError(msg);
        onError?.(msg);
        return;
      }

      const data = await res.json();
      const subscriptionId = data.subscription_id;

      if (!window.Razorpay) {
        await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscriptionId,
        name: "Acme Corp.",
        description: "Subscription Checkout",
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
        modal: { ondismiss: () => {
          const msg = "Subscription flow cancelled";
          setError(msg);
          onError?.(msg);
        } },
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

  const childProps: ChildProps = {
    onSubscribe,
    loading,
    success,
    error,
    paymentResponse,
  };

  return <>{typeof children === "function" ? children(childProps) : null}</>;
}