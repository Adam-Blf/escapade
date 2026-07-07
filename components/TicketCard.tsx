"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { getOrigin } from "@/lib/origins";
import type { Criteria, Result } from "@/lib/types";

const FIT_LABEL = {
  ok: { text: "Dans ton budget", cls: "bg-maree/15 text-maree" },
  tight: { text: "Ça passe juste", cls: "bg-sable/40 text-ink" },
  over: { text: "Au-dessus du budget", cls: "bg-corail/15 text-corail" },
} as const;

export function TicketCard({
  result,
  criteria,
  index,
}: {
  result: Result;
  criteria: Criteria;
  index: number;
}) {
  const { dest, transport, est, fit } = result;
  const originCode = getOrigin(criteria.origin).code;
  const showSolo = criteria.travelers !== 2;
  const showDuo = criteria.travelers !== 1;

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
            <span className="ml-3 opacity-80">{transport.duration}</span>
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
          <h3 className="font-display text-2xl font-bold leading-tight">{dest.name}</h3>
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

      {/* Ligne perforée du billet */}
      <div className="relative mx-0 border-t-2 border-dashed border-line">
        <span aria-hidden className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-paper" />
        <span aria-hidden className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-paper" />
      </div>

      <div className="grid grid-cols-2 gap-3 p-5 pt-4">
        {showSolo && (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-inksoft">
              Solo, {criteria.nights} nuits
            </p>
            <p className="font-display text-3xl font-bold text-maree">~{est.totalSolo}€</p>
            <p className="text-xs text-inksoft">
              dodo {est.lodgingSolo}€ + repas {est.food}€
            </p>
          </div>
        )}
        {showDuo && (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-inksoft">
              À 2, par pers.
            </p>
            <p className="font-display text-3xl font-bold text-maree">~{est.totalDuo}€</p>
            <p className="text-xs text-inksoft">{dest.duoTip}</p>
          </div>
        )}
      </div>
    </motion.article>
  );
}
