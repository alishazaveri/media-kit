"use client";

import { useState } from "react";
import axios from "axios";
import { OnboardingNav } from "./OnboardingNav";

export function SignupStep({
  onNext,
  claimedUsername,
}: {
  onNext: (userId: string) => void;
  claimedUsername: string;
}) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/auth/signup", {
        email: form.email,
        username: claimedUsername,
        password: form.password,
      });
      onNext(res.data.userId);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error || "Signup failed. Please try again.",
        );
      } else {
        setError("Signup failed. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAF7F2] flex flex-col">
      <OnboardingNav currentStep={2} />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Create your account
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Claiming kloot.io/{claimedUsername}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder:text-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder:text-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder:text-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-white"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Continue"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            By continuing you agree to our{" "}
            <a href="/o/terms" className="underline hover:text-gray-600">
              Terms & Privacy
            </a>
            .
          </p>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <a
              href="/app/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
