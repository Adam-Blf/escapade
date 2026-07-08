"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { getOrigin } from "@/lib/origins";
import { bookingUrl, hostelUrl, searchShareUrl, trainUrl } from "@/lib/links";
import { useLiveQuote } from "@/lib/useLiveQuote";
import { useLocale, withLocale } from "@/lib/i18n/LocaleProvider";
import type { Criteria, Result } from "@/lib/types";

/** Numéro de billet stable (pas aléatoire) façon carte d'embarquement, purement décoratif. */
function ticketCode(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h.toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
}

/** Bandeau code-barres purement décoratif (motif fixe, pas de vraie donnée encodée). */
function Barcode({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`h-8 ${className}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, currentColor 0px, currentColor 2px, transparent 2px, transparent 4px, currentColor 4px, currentColor 5px, transparent 5px, transparent 9px, currentColor 9px, currentColor 11px, transparent 11px, transparent 13px, currentColor 13px, currentColor 14px, transparent 14px, transparent 17px)",
        backgroundRepeat: "repeat-x",
      }}
    />
  );
}

export function TicketCard({
  result,
  criteria,
  index,
  compareSelected = false,
  compareDisabled = false,
  onToggleCompare,
}: {
  result: Result;
  criteria: Criteria;
  index: number;
  /** Sélectionné pour le comparateur */
  compareSelected?: boolean;
  /** Sélection désactivée (max atteint, ce ticket non sélectionné) */
  compareDisabled?: boolean;
  onToggleCompare?: (slug: string) => void;
}) {
  const { lang, dict } = useLocale();
  const [copied, setCopied] = useState(false);
  const { dest, transport, est, fit } = result;

  const FIT_LABEL = {
    ok: { text: dict.fit.ok, cls: "bg-maree/15 text-maree" },
    tight: { text: dict.fit.tight, cls: "bg-sable/40 text-ink" },
    over: { text: dict.fit.over, cls: "bg-corail/15 text-corail" },
  } as const;

  const share = async () => {
    const url = searchShareUrl(criteria);
    const title = `Escapade · ${dest.name} pour ~${est.totalDuo}€`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch {
      /* partage annulé : on retombe sur la copie */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard bloqué : rien à faire de plus */
    }
  };
  const originCode = getOrigin(criteria.origin).code;
  const showSolo = criteria.travelers !== 2;
  const showDuo = criteria.travelers !== 1;

  // Rafraîchi côté serveur : durée réelle (Navitia) + hôtel le moins cher
  // (Amadeus). Sans clés API le devis revient identique au catalogue.
  const { quote, isLoading } = useLiveQuote(dest.slug, criteria);
  const duration = quote?.liveDuration ?? transport.duration;
  const liveLodgingDuo =
    quote?.hotelNightlyDuo != null
      ? Math.round((criteria.nights * quote.hotelNightlyDuo) / 2)
      : null;
  const liveTotalDuo =
    liveLodgingDuo != null
      ? est.transport + liveLodgingDuo + est.food + est.activities
      : null;

  const destHref = `${withLocale(lang, `/destination/${dest.slug}`)}?o=${criteria.origin}&n=${criteria.nights}${
    criteria.travelers !== null ? `&t=${criteria.travelers}` : ""
  }${criteria.startDate ? `&d=${criteria.startDate}` : ""}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: "spring", stiffness: 120, damping: 16 }}
      whileHover={{ y: -4 }}
      className="relative flex flex-col overflow-hidden rounded-2xl bg-card shadow-[0_2px_16px_rgba(16,34,43,0.10)]"
    >
      <div className="relative h-44">
        <Image
          src={`/img/${dest.slug}.jpg`}
          alt={`${dest.name}, ${dest.region}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-5 pb-3 pt-10">
          <p className="font-mono text-xs font-semibold tracking-[0.2em] text-white">
            {originCode} <span aria-hidden>――――▸</span> {dest.code}
            <span className="ml-3 opacity-80">{duration}</span>
            {isLoading ? (
              <span
                aria-hidden
                className="ml-2 inline-block h-4 w-14 animate-pulse rounded bg-white/20 align-middle"
              />
            ) : (
              <>
                {quote?.liveDuration && (
                  <span className="ml-2 rounded bg-maree/30 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                    {dict.ticket.live}
                  </span>
                )}
                {quote?.climateAvgMaxC != null && (
                  <span
                    className="ml-2 rounded bg-sable/40 px-1.5 py-0.5 text-[10px] font-bold text-ink"
                    title={
                      quote.climateRainyDaysPct != null
                        ? `${quote.climateRainyDaysPct}%`
                        : undefined
                    }
                  >
                    {quote.climateAvgMaxC}°C
                  </span>
                )}
              </>
            )}
          </p>
        </div>
        {fit && (
          <span
            className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${FIT_LABEL[fit].cls} bg-card/85`}
          >
            {FIT_LABEL[fit].text}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-display text-2xl font-bold leading-tight">
            <Link href={destHref} className="transition-colors hover:text-maree">
              {dest.name}
            </Link>
          </h3>
          <p className="text-sm text-inksoft">{dest.region}</p>
        </div>
        <p className="text-sm leading-relaxed">{dest.tagline}</p>
        <p className="font-mono text-xs text-inksoft">
          {transport.label}, ~{transport.priceAR}€ l&apos;aller-retour
          {transport.note ? ` (${transport.note})` : ""}
        </p>
        <ul className="mt-1 space-y-1 text-sm">
          {dest.highlights.map((h) => (
            <li key={h} className="flex gap-2">
              <span aria-hidden className="text-maree">
                ✳
              </span>
              {h}
            </li>
          ))}
        </ul>
      </div>

      {/* Souche façon carte d'embarquement : perforation, code-barres, n° de billet */}
      <div className="relative mx-0 border-t-2 border-dashed border-line">
        <span aria-hidden className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-paper" />
        <span aria-hidden className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-paper" />
      </div>
      <div className="flex items-center gap-3 px-5 pt-3 text-inksoft/70">
        <Barcode className="flex-1" />
        <span className="whitespace-nowrap font-mono text-[10px] tracking-widest">
          N° {originCode}{dest.code}-{ticketCode(`${dest.slug}|${criteria.origin}`)}
        </span>
      </div>
      <div className="relative mx-0 border-t-2 border-dashed border-line">
        <span aria-hidden className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-paper" />
        <span aria-hidden className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-paper" />
      </div>

      <div className="grid grid-cols-2 gap-3 p-5 pt-4">
        {showSolo && (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-inksoft">
              {dict.results.solo}, {criteria.nights} {dict.results.soloNights}
            </p>
            <p className="font-display text-3xl font-bold text-maree">~{est.totalSolo}€</p>
            <p className="text-xs text-inksoft">
              {dict.destinationPage.lodging} {est.lodgingSolo}€ + {dict.destinationPage.meals} {est.food}€
            </p>
          </div>
        )}
        {showDuo && (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-inksoft">
              {dict.results.duo}
              {isLoading ? (
                <span
                  aria-hidden
                  className="ml-1.5 inline-block h-4 w-16 animate-pulse rounded bg-maree/10 align-middle"
                />
              ) : (
                liveTotalDuo != null && (
                  <span className="ml-1.5 rounded bg-maree/15 px-1.5 py-0.5 text-[10px] font-bold text-maree">
                    {dict.ticket.hotelLive}
                  </span>
                )
              )}
            </p>
            <p className="font-display text-3xl font-bold text-maree">
              ~{liveTotalDuo ?? est.totalDuo}€
            </p>
            <p className="text-xs text-inksoft">
              {quote?.hotelName && liveTotalDuo != null
                ? `${quote.hotelName}, ${quote.hotelNightlyDuo}€/nuit la double`
                : dest.duoTip}
            </p>
          </div>
        )}
      </div>

      {/* Actions · réserver et partager, aucune commission */}
      <div className="flex flex-wrap items-center gap-2 px-5 pb-5">
        <a
          href={trainUrl(criteria, dest)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-maree px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.97]"
        >
          {dict.ticket.reserveTrain}
        </a>
        <a
          href={bookingUrl(criteria, dest)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-inksoft transition-colors hover:border-maree hover:text-ink"
        >
          {dict.ticket.hotels}
        </a>
        <a
          href={hostelUrl(dest)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-inksoft transition-colors hover:border-maree hover:text-ink"
        >
          {dict.ticket.hostels}
        </a>
        <button
          type="button"
          onClick={share}
          aria-label={dict.ticket.share}
          className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-inksoft transition-colors hover:border-corail hover:text-corail"
        >
          {copied ? dict.ticket.shareCopied : dict.ticket.share}
        </button>
        {onToggleCompare && (
          <button
            type="button"
            onClick={() => onToggleCompare(dest.slug)}
            disabled={compareDisabled}
            aria-pressed={compareSelected}
            className={`ml-auto rounded-full border px-4 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              compareSelected
                ? "border-maree bg-maree text-white"
                : "border-line text-inksoft hover:border-maree hover:text-ink"
            }`}
          >
            {compareSelected ? dict.ticket.compareSelected : dict.ticket.compare}
          </button>
        )}
      </div>
    </motion.article>
  );
}
