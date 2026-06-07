"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

type OnboardingStatus = {
  hasInstagram: boolean;
  hasPlan: boolean;
};

function redirectAfterLogin(
  status: OnboardingStatus,
  router: ReturnType<typeof useRouter>,
) {
  router.push("/app/dashboard");
  // if (status.hasPlan) {
  //   router.push(status.hasInstagram ? "/app/dashboard" : "/app/account");
  // } else if (!status.hasInstagram) {
  //   router.push("/onboarding?step=connect");
  // } else {
  //   router.push("/onboarding?step=activate");
  // }
}

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", { identifier, password });
      redirectAfterLogin(res.data.onboardingStatus, router);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? "Invalid credentials")
        : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#FAF7F2] flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center">
          <img
            src="/assets/images/logo/logo-transparent-slim.png"
            alt="Kloot"
            className="h-6 w-auto object-contain"
          />
        </a>
        <a
          href="/app/onboarding"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          Sign up
        </a>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Welcome back
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Log in to your creator account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Email or Username
              </label>
              <input
                type="text"
                placeholder="you@example.com or yourhandle"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder:text-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                  Password
                </label>
                <a href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3.5 rounded-xl flex items-center justify-center transition-colors disabled:opacity-60"
            >
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <a
              href="/app/onboarding"
              className="text-primary font-semibold hover:underline"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
