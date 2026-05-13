"use client";

import { useState } from "react";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <a href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">k</span>
            </div>
            <span className="font-black text-gray-900 text-base tracking-tight">
              Kloot
            </span>
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
            <a
              href="/login"
              className="hidden md:inline-flex text-sm font-semibold text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-400 transition-colors"
            >
              Login
            </a>
            <a
              href="/onboarding"
              className="bg-primary hover:bg-primary-hover text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
            >
              Claim
            </a>
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
              <a
                href="/login"
                className="flex-1 text-center text-sm font-semibold text-gray-700 px-4 py-2 rounded-xl border border-gray-200"
              >
                Login
              </a>
              <a
                href="/onboarding"
                className="flex-1 text-center bg-primary text-white text-sm font-bold px-4 py-2 rounded-xl"
              >
                Claim
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
