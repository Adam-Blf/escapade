"use client";

import { AnimatePresence, motion } from "framer-motion";
import { getOrigin } from "@/lib/origins";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Criteria, Result } from "@/lib/types";

const MONTH_NAMES_FR = [
  "janv.", "févr.", "mars", "avril", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

const MONTH_NAMES_EN = [
  "Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.",
  "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec.",
];

export function Comparator({
  results,
  criteria,
  onRemove,
  onClose,
}: {
  results: Result[];
  criteria: Criteria;
  onRemove: (slug: string) => void;
  onClose: () => void;
}) {
  const { lang, dict } = useLocale();
  const monthNames = lang === "fr" ? MONTH_NAMES_FR : MONTH_NAMES_EN;
  const originCode = getOrigin(criteria.origin).code;

  return (
    <AnimatePresence>
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-line bg-card p-6 shadow-[0_8px_40px_rgba(16,34,43,0.25)] sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">{dict.comparator.title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={dict.comparator.close}
                className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-inksoft transition-colors hover:border-corail hover:text-corail"
              >
                {dict.comparator.close}
              </button>
            </div>

            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${results.length}, minmax(0, 1fr))` }}
            >
              {results.map((r) => (
                <div
                  key={r.dest.slug}
                  className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-widest text-inksoft">
                        {originCode} <span aria-hidden>――▸</span> {r.dest.code}
                      </p>
                      <h3 className="font-display text-xl font-bold leading-tight">
                        {r.dest.name}
                      </h3>
                      <p className="text-xs text-inksoft">{r.dest.region}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(r.dest.slug)}
                      aria-label={`${dict.comparator.remove} ${r.dest.name}`}
                      className="rounded-full border border-line px-2 py-1 text-xs text-inksoft transition-colors hover:border-corail hover:text-corail"
                    >
                      ✕
                    </button>
                  </div>

                  <dl className="space-y-1.5 border-t border-dashed border-line pt-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-inksoft">{dict.comparator.transport}</dt>
                      <dd className="text-right font-mono text-xs">
                        {r.transport.duration}, {r.transport.priceAR}€ AR
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-inksoft">{dict.comparator.solo}</dt>
                      <dd className="font-mono font-semibold text-maree">
                        ~{r.est.totalSolo}€
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-inksoft">{dict.comparator.duo}</dt>
                      <dd className="font-mono font-semibold text-maree">
                        ~{r.est.totalDuo}€
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-inksoft">{dict.comparator.bestMonths}</dt>
                      <dd className="text-right text-xs">
                        {r.dest.bestMonths.map((m) => monthNames[m - 1]).join(", ")}
                      </dd>
                    </div>
                  </dl>

                  <ul className="space-y-1 border-t border-dashed border-line pt-3 text-xs">
                    {r.dest.highlights.map((h) => (
                      <li key={h} className="flex gap-1.5">
                        <span aria-hidden className="text-maree">✳</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
