"use client";

import { useState, useEffect } from "react";
import { type ThemeData } from "@/components/CreatorProfile";
import { THEMES } from "@/constants/themes";

interface ThemeSectionProps {
  isFreePlan?: boolean;
  onThemeChange?: (identifier: string, theme: ThemeData) => void;
  onSectionFocus?: (sectionId: string) => void;
  onUpgradeClick?: () => void;
}

export function ThemeSection({
  isFreePlan = false,
  onThemeChange,
  onSectionFocus,
  onUpgradeClick,
}: ThemeSectionProps) {
  const [theme, setTheme] = useState("default");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetch("/api/customization")
      .then((r) => r.json())
      .then((data) => {
        const identifier = data.draft?.theme_identifier;
        if (identifier) setTheme(identifier);
        if (data.draft?.dark_mode !== undefined)
          setDarkMode(data.draft.dark_mode);
      })
      .catch(() => {});
  }, []);

  function applyTheme(identifier: string, newDarkMode: boolean) {
    const t = THEMES.find((x) => x.identifier === identifier);
    if (!t) return;
    onThemeChange?.(identifier, {
      accent_color: t.accent_color,
      base_color: t.base_color,
      contrast_color: t.contrast_color,
      dark_mode: newDarkMode,
    });
    fetch("/api/customization", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme_identifier: identifier, dark_mode: newDarkMode }),
    }).catch(() => {});
  }

  function handleThemeSelect(identifier: string, isPremium: boolean) {
    if (isFreePlan && isPremium) {
      onUpgradeClick?.();
      return;
    }
    setTheme(identifier);
    applyTheme(identifier, darkMode);
  }

  const savedThemeIsPremium = THEMES.find((t) => t.identifier === theme)?.is_premium ?? false;
  const effectiveTheme = isFreePlan && savedThemeIsPremium ? "default" : theme;

  return (
    <section
      className="bg-white rounded-2xl border border-gray-100 p-5"
      onFocus={() => onSectionFocus?.("hero")}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-gray-900">Theme</p>
        {isFreePlan && (
          <button
            onClick={onUpgradeClick}
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md cursor-pointer hover:bg-amber-100 transition-colors"
          >
            <svg width="9" height="9" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M8 1a2 2 0 0 1 2 2v2H6V3a2 2 0 0 1 2-2zm3 4V3A3 3 0 1 0 5 3v2H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2z" fill="currentColor"/>
            </svg>
            Pro
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 min-[425px]:grid-cols-4 gap-3">
        {THEMES.map((t) => {
          const locked = isFreePlan && t.is_premium;
          return (
            <button
              key={t.identifier}
              onClick={() => handleThemeSelect(t.identifier, t.is_premium)}
              className="flex flex-col items-center gap-2 relative"
              title={locked ? "Upgrade to unlock this theme" : t.name}
            >
              <div
                className={`w-full rounded-2xl overflow-hidden transition-all ${
                  effectiveTheme === t.identifier
                    ? "ring-2 ring-primary ring-offset-2"
                    : ""
                } ${locked ? "opacity-40" : ""}`}
                style={{ backgroundColor: t.accent_color, paddingTop: "60%" }}
              />
              {locked && (
                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white shadow flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="#9ca3af" strokeWidth="2.5" />
                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              )}
              <span
                className={`text-xs text-center capitalize ${
                  effectiveTheme === t.identifier
                    ? "font-semibold text-gray-900"
                    : locked
                    ? "text-gray-300"
                    : "text-gray-500"
                }`}
              >
                {t.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Dark mode</span>
          {isFreePlan && (
            <button
              type="button"
              onClick={onUpgradeClick}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md cursor-pointer hover:bg-amber-100 transition-colors"
            >
              <svg width="9" height="9" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M8 1a2 2 0 0 1 2 2v2H6V3a2 2 0 0 1 2-2zm3 4V3A3 3 0 1 0 5 3v2H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2z" fill="currentColor"/>
              </svg>
              Pro
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            if (isFreePlan) { onUpgradeClick?.(); return; }
            const next = !darkMode;
            setDarkMode(next);
            applyTheme(theme, next);
          }}
          className={`relative w-10 h-6 rounded-full transition-colors ${
            isFreePlan ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
          } ${darkMode && !isFreePlan ? "bg-gray-800" : "bg-gray-200"}`}
          aria-label="Toggle dark mode"
        >
          <span
            className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              darkMode && !isFreePlan ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </section>
  );
}
