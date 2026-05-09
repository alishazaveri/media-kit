"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AppLogo } from "@/components/AppLogo";

type OnboardingStatus = {
  hasInstagram: boolean;
  hasPlan: boolean;
};

function redirectAfterLogin(status: OnboardingStatus, router: ReturnType<typeof useRouter>) {
  if (!status.hasInstagram) {
    router.push("/onboarding?step=connect");
  } else if (!status.hasPlan) {
    router.push("/onboarding?step=activate");
  } else {
    router.push("/dashboard");
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", {
        email: form.email,
        password: form.password,
      });
      redirectAfterLogin(res.data.onboardingStatus, router);
    } catch (err) {
      const msg =
        axios.isAxiosError(err)
          ? err.response?.data?.error ?? "Invalid credentials"
          : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-8">
        <div className="mb-8">
          <AppLogo size="md" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-gray-400 text-sm mb-7">Log in to your creator account.</p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
            </div>
            <input
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <a href="/onboarding" className="text-primary font-semibold hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
