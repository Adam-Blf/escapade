"use client";

import { useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { parseText } from "@/lib/parse";
import { rank } from "@/lib/engine";
import { DEFAULT_ORIGIN, ORIGINS, getOrigin } from "@/lib/origins";
import type { Criteria, OriginSlug, Result } from "@/lib/types";
import { CriteriaForm } from "./CriteriaForm";
import { TicketCard } from "./TicketCard";

type Mode = "texte" | "criteres";

const EXAMPLES = [
  "Je suis pas riche mais j'ai envie de voir la mer, budget 300€, fin août, seule ou à 2",
  "Une semaine de rando en montagne en septembre, 500€, à deux",
  "Week-end citytrip pas cher en décembre, solo",
];

const MONTH_NAMES = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function criteriaChips(c: Criteria): string[] {
  const chips: string[] = [];
  chips.push(`départ ${getOrigin(c.origin).name}`);
  if (c.vibes.length) chips.push(c.vibes.join(" + "));
  if (c.budget !== null) chips.push(`budget ${c.budget}€`);
  chips.push(c.travelers === 1 ? "solo" : c.travelers === 2 ? "à deux" : "solo ou à deux");
  if (c.month !== null) chips.push(MONTH_NAMES[c.month - 1]);
  chips.push(`${c.nights} nuits`);
  return chips;
}

export function Planner() {
  const [mode, setMode] = useState<Mode>("texte");
  const [origin, setOrigin] = useState<OriginSlug>(DEFAULT_ORIGIN);
  const [text, setText] = useState("");
  const [applied, setApplied] = useState<Criteria | null>(null);
  const [results, setResults] = useState<Result[] | null>(null);

  const search = (c: Criteria) => {
    setApplied(c);
    setResults(rank(c));
    // le texte peut imposer sa propre origine ("depuis Lyon") : on
    // resynchronise le sélecteur pour que l'UI reste cohérente
    if (c.origin !== origin) setOrigin(c.origin);
  };

  return (
    <MotionConfig reducedMotion="user">
      <section className="mx-auto w-full max-w-6xl px-5">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pb-10 pt-16 sm:pt-24"
        >
          <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.35em] text-maree">
            Départ {getOrigin(origin).name}, {getOrigin(origin).station}
          </p>
          <h1 className="max-w-3xl font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl">
            Dis ton envie.
            <br />
            On sort le <span className="text-corail">billet</span>.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-inksoft">
            Une phrase ou trois cases à cocher : Escapade classe les destinations
            et calcule le vrai budget, seul(e) ou à deux. Pensé pour les budgets étudiants.
          </p>
        </motion.div>

        {/* Panneau de recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-3xl border border-line bg-card p-6 shadow-[0_4px_30px_rgba(16,34,43,0.08)] sm:p-8"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label
                htmlFor="origin"
                className="font-mono text-xs font-semibold uppercase tracking-widest text-inksoft"
              >
                Départ
              </label>
              <select
                id="origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value as OriginSlug)}
                className="rounded-lg border border-line bg-card px-3 py-2 text-sm font-semibold"
              >
                {ORIGINS.map((o) => (
                  <option key={o.slug} value={o.slug}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          <div
            role="tablist"
            aria-label="Mode de recherche"
            className="inline-flex rounded-full border border-line bg-paper p-1"
          >
            {(
              [
                ["texte", "Je raconte"],
                ["criteres", "Je coche"],
              ] as Array<[Mode, string]>
            ).map(([m, label]) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  mode === m ? "text-white" : "text-inksoft hover:text-ink"
                }`}
              >
                {mode === m && (
                  <motion.span
                    layoutId="mode-pill"
                    className="absolute inset-0 rounded-full bg-maree"
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  />
                )}
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>
          </div>

          <AnimatePresence mode="wait">
            {mode === "texte" ? (
              <motion.div
                key="texte"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2 }}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (text.trim()) search(parseText(text, origin));
                  }}
                  className="flex flex-col gap-4"
                >
                  <label htmlFor="envie" className="sr-only">
                    Décris ton envie de vacances
                  </label>
                  <textarea
                    id="envie"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={3}
                    placeholder={`Ex : ${EXAMPLES[0]}`}
                    className="w-full resize-none rounded-2xl border border-line bg-paper px-4 py-3 text-base placeholder:text-inksoft/60"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-inksoft">Essaie :</span>
                    {EXAMPLES.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => setText(ex)}
                        className="rounded-full border border-line px-3 py-1 text-xs text-inksoft transition-colors hover:border-maree hover:text-ink"
                      >
                        {ex.length > 48 ? `${ex.slice(0, 48)}…` : ex}
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={!text.trim()}
                    className="self-start rounded-full bg-corail px-6 py-3 font-display text-lg font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
                  >
                    Trouver où partir
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="criteres"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                <CriteriaForm origin={origin} onSearch={search} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Résultats */}
        {results && applied && (
          <div className="pb-24 pt-10">
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <h2 className="mr-2 font-display text-2xl font-bold">Ce qu&apos;on te propose</h2>
              {criteriaChips(applied).map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-maree/10 px-3 py-1 font-mono text-xs font-semibold text-maree"
                >
                  {chip}
                </span>
              ))}
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.map((r, i) => (
                <TicketCard key={r.dest.slug} result={r} criteria={applied} index={i} />
              ))}
            </div>
            <p className="mt-8 text-xs text-inksoft">
              Prix indicatifs (résa anticipée, tarifs jeunes inclus quand ils existent),
              à vérifier sur SNCF Connect / Ouigo avant de réserver.
            </p>
          </div>
        )}
      </section>
    </MotionConfig>
  );
}
