"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { isLocale } from "@/lib/i18n/dictionaries";
import { PlaneMark } from "@/components/PlaneMark";

const COPY = {
  fr: {
    kicker: "VOL DÉTOURNÉ",
    title: "Cette destination n'existe pas (encore).",
    body: "La page que tu cherches a décollé sans toi, ou son adresse est fausse. Ça arrive même aux meilleurs pilotes.",
    cta: "Retour au comptoir d'enregistrement",
  },
  en: {
    kicker: "FLIGHT DIVERTED",
    title: "This destination doesn't exist (yet).",
    body: "The page you're looking for took off without you, or its address is wrong. Happens to the best pilots.",
    cta: "Back to check-in",
  },
} as const;

/**
 * not-found.tsx ne reçoit pas `params` (limitation Next.js App Router) et peut
 * se monter hors de la portée du LocaleProvider posé par le layout — on lit
 * donc la langue directement dans l'URL plutôt que via le contexte/params.
 */
export default function NotFound() {
  const pathname = usePathname();
  const first = pathname?.split("/")[1] ?? "";
  const lang = isLocale(first) ? first : "fr";
  const c = COPY[lang];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: [0, -10, 0] }}
        transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
        className="mb-6"
      >
        <PlaneMark className="h-12 w-12" />
      </motion.div>
      <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.35em] text-corail">
        {c.kicker}
      </p>
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {c.title}
      </h1>
      <p className="mt-4 max-w-md text-inksoft">{c.body}</p>
      <Link
        href={`/${lang}`}
        className="mt-8 rounded-full bg-corail px-6 py-3 font-display text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {c.cta}
      </Link>
    </main>
  );
}
