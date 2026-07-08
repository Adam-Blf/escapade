"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/** Bascule FR/EN, conserve le chemin courant (juste le préfixe de langue change). */
export function LangSwitcher() {
  const { lang } = useLocale();
  const pathname = usePathname();
  const rest = pathname.split("/").slice(2).join("/");

  return (
    <div className="flex overflow-hidden rounded-full border border-line text-xs font-semibold">
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={`/${l}${rest ? `/${rest}` : ""}`}
          aria-current={l === lang ? "true" : undefined}
          className={`px-2.5 py-1.5 uppercase transition-colors ${
            l === lang ? "bg-maree text-white" : "text-inksoft hover:text-ink"
          }`}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
