"use client";

import { useEffect, useState } from "react";
import { applyTheme, currentTheme, type Theme } from "@/lib/theme";
import { useLocale } from "@/lib/i18n/LocaleProvider";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"
      />
    </svg>
  );
}

/** Bascule clair/sombre manuelle · gagne sur la préférence système, persistée. */
export function ThemeToggle() {
  const { dict } = useLocale();
  // null avant hydratation : le no-flash script a déjà posé data-theme sur
  // <html>, on le lit après montage pour ne jamais désynchroniser le SSR.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // rAF : le no-flash script (système externe) a déjà posé data-theme avant
    // l'hydratation ; on le lit juste après le premier paint plutôt que
    // synchroniquement dans le corps de l'effet.
    const id = requestAnimationFrame(() => setTheme(currentTheme()));
    return () => cancelAnimationFrame(id);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? dict.header.themeToLight : dict.header.themeToDark}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-inksoft transition-colors hover:border-maree hover:text-ink"
    >
      {theme === null ? null : theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
