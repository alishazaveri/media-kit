"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Button from "@/components/reusable/Button";

type TokenState = "verifying" | "valid" | "invalid" | "expired";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [tokenState, setTokenState] = useState<TokenState>(token ? "verifying" : "invalid");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    axios.get(`/api/auth/verify-reset-token?token=${token}`)
      .then((res) => setTokenState(res.data.valid ? "valid" : res.data.reason))
      .catch(() => setTokenState("invalid"));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) { setError("Passwords don't match"); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await axios.post("/api/auth/reset-password", { token, newPassword });
      router.push("/app/login?reset=1");
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? "Something went wrong")
        : "Something went wrong";
      setError(msg);
      // Token may have expired or been used between verify and submit — re-check
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        axios.get(`/api/auth/verify-reset-token?token=${token}`)
          .then((res) => { if (!res.data.valid) setTokenState(res.data.reason); })
          .catch(() => {});
      }
    } finally {
      setLoading(false);
    }
  };

  if (tokenState === "verifying") {
    return (
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span className="text-sm">Verifying your link…</span>
        </div>
      </div>
    );
  }

  if (tokenState === "expired") {
    return (
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Link expired</h1>
        <p className="text-gray-500 text-sm mb-6">
          This password reset link has expired. Links are only valid for 10 minutes.
          Please request a new one.
        </p>
        <Link href="/app/forgot-password" className="text-sm text-primary font-semibold hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  if (tokenState === "invalid") {
    return (
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Invalid link</h1>
        <p className="text-gray-500 text-sm mb-6">
          This password reset link is invalid or has already been used.
          Please request a new one.
        </p>
        <Link href="/app/forgot-password" className="text-sm text-primary font-semibold hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
<h1 className="text-3xl font-bold text-gray-900 mb-1">Set new password</h1>
      <p className="text-gray-500 text-sm mb-8">Choose a strong password for your account.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
            New password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoFocus
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder:text-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-white"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
            Repeat new password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder:text-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-white"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" loading={loading} fullWidth className="rounded-xl">
          {loading ? "Saving…" : "Reset password"}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-dvh bg-[#FAF7F2] flex flex-col">
      <nav className="px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center">
          <img
            src="/assets/images/logo/logo-transparent-slim.png"
            alt="Kloot"
            className="h-6 w-auto object-contain"
          />
        </a>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
