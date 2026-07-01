"use client";

import { useState } from "react";
import axios from "axios";
import Button from "@/components/reusable/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("/api/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? "Something went wrong")
        : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="w-full max-w-md">
          {submitted ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Check your inbox</h1>
              <p className="text-gray-500 text-sm mb-8">
                If an account exists for <span className="font-medium text-gray-700">{email}</span>, you'll receive a password reset link shortly.
              </p>
              <a href="/app/login" className="text-sm text-primary font-semibold hover:underline">
                Back to log in
              </a>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Forgot password?</h1>
              <p className="text-gray-500 text-sm mb-8">
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder:text-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-white"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <Button type="submit" variant="primary" size="lg" loading={loading} fullWidth className="rounded-xl">
                  {loading ? "Sending…" : "Send reset link"}
                </Button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Remember your password?{" "}
                <a href="/app/login" className="text-primary font-semibold hover:underline">
                  Log in
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
