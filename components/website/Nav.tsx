"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/reusable/Button";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const links = [
    { label: "Steps", href: "#steps" },
    { label: "Analytics", href: "#analytics" },
    { label: "Features", href: "#features" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <nav className="bg-white rounded-2xl shadow-md border border-gray-100 w-full max-w-3xl">
        {/* ── Main row ── */}
        <div className="flex items-center gap-6 px-4 py-2.5">
          {/* Logo */}
          <a href="/" className="flex items-center shrink-0">
            <img
              src="/assets/images/logo/logo-transparent-slim.png"
              alt="Kloot"
              className="h-7 w-auto object-contain"
            />
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6 flex-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <Button
              variant="default"
              size="md"
              onClick={() => router.push("/app/login")}
              className="hidden md:inline-flex rounded-xl"
            >
              Login
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push("/app/onboarding")}
              className="rounded-xl"
            >
              Claim
            </Button>
            {/* Hamburger */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <span
                className={`block w-5 h-0.5 bg-gray-700 transition-transform duration-200 ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
              />
              <span
                className={`block w-5 h-0.5 bg-gray-700 transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block w-5 h-0.5 bg-gray-700 transition-transform duration-200 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 py-2 transition-colors"
              >
                {l.label}
              </a>
            ))}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-1">
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push("/app/login")}
                className="flex-1 rounded-xl"
              >
                Login
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push("/app/onboarding")}
                className="flex-1 rounded-xl"
              >
                Claim
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
