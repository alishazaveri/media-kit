"use client";

import { useState, useEffect } from "react";
import { type ThemeData } from "@/components/CreatorProfile";
import { THEMES } from "@/constants/themes";
import { Toggle } from "./shared";

interface ThemeSectionProps {
  onThemeChange?: (identifier: string, theme: ThemeData) => void;
  onSectionFocus?: (sectionId: string) => void;
}

export function ThemeSection({ onThemeChange, onSectionFocus }: ThemeSectionProps) {
  const [theme, setTheme] = useState("default");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetch("/api/customization")
      .then((r) => r.json())
      .then((data) => {
        const identifier = data.draft?.theme_identifier;
        if (identifier) setTheme(identifier);
        if (data.draft?.dark_mode !== undefined) setDarkMode(data.draft.dark_mode);
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

  function handleThemeSelect(identifier: string) {
    setTheme(identifier);
    applyTheme(identifier, darkMode);
  }

  function handleDarkMode(value: boolean) {
    setDarkMode(value);
    applyTheme(theme, value);
  }

  return (
    <section
      className="bg-white rounded-2xl border border-gray-100 p-5"
      onFocus={() => onSectionFocus?.("hero")}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-gray-900">Theme</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Dark</span>
          <Toggle checked={darkMode} onChange={handleDarkMode} />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {THEMES.map((t) => (
          <button
            key={t.identifier}
            onClick={() => handleThemeSelect(t.identifier)}
            className="flex flex-col items-center gap-2"
          >
            <div
              className={`w-full rounded-2xl overflow-hidden transition-all ${
                theme === t.identifier
                  ? "ring-2 ring-primary ring-offset-2"
                  : ""
              }`}
              style={{ backgroundColor: t.accent_color, paddingTop: "60%" }}
            />
            <span
              className={`text-xs text-center capitalize ${theme === t.identifier ? "font-semibold text-gray-900" : "text-gray-500"}`}
            >
              {t.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
