"use client";

import { createContext, useContext } from "react";
import { getDictionary, type Dictionary, type Locale } from "./dictionaries";

const LocaleContext = createContext<{ lang: Locale; dict: Dictionary } | null>(null);

export function LocaleProvider({
  lang,
  children,
}: {
  lang: Locale;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ lang, dict: getDictionary(lang) }}>
      {children}
    </LocaleContext.Provider>
  );
}

/** À utiliser dans tout composant client sous app/[lang]/layout.tsx. */
export function useLocale(): { lang: Locale; dict: Dictionary } {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale() doit être appelé sous <LocaleProvider>");
  return ctx;
}

/** Préfixe un chemin interne avec la langue courante (ex: "/destination/nice" → "/en/destination/nice"). */
export function withLocale(lang: Locale, path: string): string {
  return `/${lang}${path.startsWith("/") ? path : `/${path}`}`;
}
