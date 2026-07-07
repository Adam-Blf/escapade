"use client";

import { useEffect, useState } from "react";
import type { Criteria, PriceQuote } from "./types";

export interface LiveQuoteState {
  quote: PriceQuote | null;
  /** true tant que la requête pour les critères courants n'a pas abouti (succès ou échec). */
  isLoading: boolean;
}

/**
 * Devis serveur (durée Navitia + hôtel Amadeus) pour un ticket affiché.
 * Best-effort : quote reste null tant que rien n'est arrivé ou en cas
 * d'échec, le catalogue reste affiché. L'état est keyé sur la requête : un
 * devis d'anciens critères n'est jamais montré pour les nouveaux, et
 * isLoading repasse à true dès que la clé change.
 */
export function useLiveQuote(slug: string, criteria: Criteria): LiveQuoteState {
  const { origin, month, nights, startDate } = criteria;
  const key = `${slug}|${origin}|${month ?? "x"}|${nights}|${startDate ?? "x"}`;
  const [state, setState] = useState<{ key: string; quote: PriceQuote } | null>(null);
  const [settledKey, setSettledKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({
      dest: slug,
      origin,
      nights: String(nights),
    });
    if (month !== null) params.set("month", String(month));
    if (startDate !== null) params.set("startDate", startDate);
    fetch(`/api/prices?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PriceQuote | null) => {
        if (cancelled) return;
        if (data) setState({ key, quote: data });
        setSettledKey(key);
      })
      .catch(() => {
        // catalogue en fallback : on marque quand même la clé comme réglée
        // pour que le skeleton laisse place au contenu catalogue.
        if (!cancelled) setSettledKey(key);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, origin, month, nights, startDate, key]);

  return {
    quote: state && state.key === key ? state.quote : null,
    isLoading: settledKey !== key,
  };
}
