"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { parseText } from "@/lib/parse";
import { rank } from "@/lib/engine";
import { parseSignals, tipsFor } from "@/lib/profile";
import { DEFAULT_ORIGIN, ORIGINS, getOrigin } from "@/lib/origins";
import { criteriaFromParams, criteriaToParams } from "@/lib/share";
import { loadRecent, saveRecent, type RecentSearch } from "@/lib/recent";
import { MAX_COMPARE, canCompare, selectedResults, toggleCompare } from "@/lib/compare";
import { surpriseCriteria } from "@/lib/surprise";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Criteria, OriginSlug, Result } from "@/lib/types";
import { CriteriaForm } from "./CriteriaForm";
import { TicketCard } from "./TicketCard";
import { Comparator } from "./Comparator";

type Mode = "texte" | "criteres";

const EXAMPLES_FR = [
  "Je suis pas riche mais j'ai envie de voir la mer, budget 300€, fin août, seule ou à 2",
  "Une semaine de rando en montagne en septembre, 500€, à deux",
  "Week-end citytrip pas cher en décembre, solo",
];

const EXAMPLES_EN = [
  "I'm broke but I want to see the sea, €300 budget, late August, solo or as a couple",
  "A week of hiking in the mountains in September, €500, as a couple",
  "Cheap city break weekend in December, solo",
];

const MONTH_NAMES_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function Planner() {
  const { lang, dict } = useLocale();
  const monthNames = lang === "fr" ? MONTH_NAMES_FR : MONTH_NAMES_EN;
  const examples = lang === "fr" ? EXAMPLES_FR : EXAMPLES_EN;

  function criteriaChips(c: Criteria): string[] {
    const chips: string[] = [];
    chips.push(`${dict.origin.label} ${getOrigin(c.origin).name}`);
    if (c.vibes.length) {
      chips.push(c.vibes.map((v) => dict.criteriaForm.vibes[v]).join(" + "));
    }
    if (c.budget !== null) chips.push(`${c.budget}€`);
    chips.push(
      c.travelers === 1
        ? "solo"
        : c.travelers === 2
          ? dict.results.asCouple
          : dict.results.soloOrCouple
    );
    if (c.startDate) {
      const [y, m, d] = c.startDate.split("-").map(Number);
      chips.push(`${d} ${monthNames[m - 1]} ${y}`);
    } else if (c.month !== null) {
      chips.push(monthNames[c.month - 1]);
    }
    chips.push(`${c.nights} ${dict.results.soloNights}`);
    return chips;
  }

  const [mode, setMode] = useState<Mode>("texte");
  const [origin, setOrigin] = useState<OriginSlug>(DEFAULT_ORIGIN);
  const [text, setText] = useState("");
  const [applied, setApplied] = useState<Criteria | null>(null);
  const [results, setResults] = useState<Result[] | null>(null);
  const [recent, setRecent] = useState<RecentSearch[]>([]);
  const [compared, setCompared] = useState<string[]>([]);
  const [comparatorOpen, setComparatorOpen] = useState(false);

  const apply = (c: Criteria) => {
    setApplied(c);
    setResults(rank(c));
    setCompared([]);
    // le texte peut imposer sa propre origine ("depuis Lyon") : on
    // resynchronise le sélecteur pour que l'UI reste cohérente
    setOrigin(c.origin);
  };

  const search = (c: Criteria) => {
    apply(c);
    saveRecent(c);
    setRecent(loadRecent());
    // recherche partageable par lien · pushState pour que back/forward marchent
    const qs = criteriaToParams(c).toString();
    window.history.pushState(null, "", `?${qs}`);
  };

  // Restauration · lien partagé au chargement, back/forward ensuite.
  // rAF : l'hydratation SSR rend d'abord l'état nu, le vrai état arrive juste
  // après (localStorage et URL sont des systèmes externes, lecture client only).
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setRecent(loadRecent());
      const fromUrl = criteriaFromParams(new URLSearchParams(window.location.search));
      if (fromUrl) apply(fromUrl);
    });

    const onPop = () => {
      const c = criteriaFromParams(new URLSearchParams(window.location.search));
      if (c) apply(c);
      else {
        setApplied(null);
        setResults(null);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

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
            {dict.hero.departureLabel} {getOrigin(origin).name}, {getOrigin(origin).station}
          </p>
          <h1 className="max-w-3xl font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl">
            {dict.hero.title1}
            <br />
            {dict.hero.title2Pre}
            <span className="text-corail">{dict.hero.title2Billet}</span>.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-inksoft">{dict.hero.subtitle}</p>
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
                {dict.origin.label}
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
              aria-label={dict.modeTabs.label}
              className="inline-flex rounded-full border border-line bg-paper p-1"
            >
              {(
                [
                  ["texte", dict.modeTabs.text],
                  ["criteres", dict.modeTabs.criteria],
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
                    {dict.textMode.fieldLabel}
                  </label>
                  <textarea
                    id="envie"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={3}
                    placeholder={`${dict.textMode.placeholderPrefix}${examples[0]}`}
                    className="w-full resize-none rounded-2xl border border-line bg-paper px-4 py-3 text-base placeholder:text-inksoft/60"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-inksoft">{dict.textMode.tryLabel}</span>
                    {examples.map((ex) => (
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
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={!text.trim()}
                      className="self-start rounded-full bg-corail px-6 py-3 font-display text-lg font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
                    >
                      {dict.textMode.submit}
                    </button>
                    <button
                      type="button"
                      onClick={() => search(surpriseCriteria(origin))}
                      className="self-start rounded-full border border-dashed border-line px-5 py-3 text-sm font-semibold text-inksoft transition-colors hover:border-corail hover:text-corail"
                    >
                      {dict.textMode.surpriseMe}
                    </button>
                  </div>
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

        {/* Dernières recherches */}
        {!results && recent.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-6">
            <span className="font-mono text-xs uppercase tracking-widest text-inksoft">
              {dict.recent.label}
            </span>
            {recent.map((r) => (
              <button
                key={r.at}
                type="button"
                onClick={() => search(r.criteria)}
                className="rounded-full border border-line px-3 py-1 text-xs text-inksoft transition-colors hover:border-maree hover:text-ink"
              >
                {criteriaChips(r.criteria).slice(0, 4).join(" · ")}
              </button>
            ))}
          </div>
        )}

        {/* Résultats */}
        {results && applied && (
          <div className="pb-24 pt-10">
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <h2 className="mr-2 font-display text-2xl font-bold">{dict.results.heading}</h2>
              {criteriaChips(applied).map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-maree/10 px-3 py-1 font-mono text-xs font-semibold text-maree"
                >
                  {chip}
                </span>
              ))}
            </div>
            {tipsFor(parseSignals(applied.profile)).length > 0 && (
              <ul className="mb-6 space-y-1 rounded-2xl border border-line bg-card p-4 text-sm text-inksoft">
                {tipsFor(parseSignals(applied.profile)).map((tip) => (
                  <li key={tip} className="flex gap-2">
                    <span aria-hidden className="text-corail">▸</span>
                    {tip}
                  </li>
                ))}
              </ul>
            )}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.map((r, i) => (
                <TicketCard
                  key={r.dest.slug}
                  result={r}
                  criteria={applied}
                  index={i}
                  compareSelected={compared.includes(r.dest.slug)}
                  compareDisabled={
                    !compared.includes(r.dest.slug) && compared.length >= MAX_COMPARE
                  }
                  onToggleCompare={(slug) => setCompared((prev) => toggleCompare(prev, slug))}
                />
              ))}
            </div>
            <p className="mt-8 text-xs text-inksoft">{dict.results.disclaimer}</p>

            {/* Barre flottante de comparaison */}
            <AnimatePresence>
              {canCompare(compared) && !comparatorOpen && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  onClick={() => setComparatorOpen(true)}
                  className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full bg-ink px-6 py-3 font-display text-sm font-bold text-white shadow-[0_8px_30px_rgba(16,34,43,0.3)]"
                >
                  {dict.comparator.compareCta(compared.length)}
                </motion.button>
              )}
            </AnimatePresence>

            <Comparator
              results={comparatorOpen ? selectedResults(results, compared) : []}
              criteria={applied}
              onRemove={(slug) => setCompared((prev) => prev.filter((s) => s !== slug))}
              onClose={() => setComparatorOpen(false)}
            />
          </div>
        )}
      </section>
    </MotionConfig>
  );
}
