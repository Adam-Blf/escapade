"use client";

import { useEffect, useState } from "react";
import type { Criteria, PriceQuote } from "./types";

/**
 * Devis serveur (durée Navitia + hôtel Amadeus) pour un ticket affiché.
 * Best-effort : null tant que rien n'est arrivé, silencieux en cas d'échec,
 * le catalogue reste affiché. L'état est keyé sur la requête : un devis
 * d'anciens critères n'est jamais montré pour les nouveaux.
 */
export function useLiveQuote(slug: string, criteria: Criteria): PriceQuote | null {
  const { origin, month, nights } = criteria;
  const key = `${slug}|${origin}|${month ?? "x"}|${nights}`;
  const [state, setState] = useState<{ key: string; quote: PriceQuote } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({
      dest: slug,
      origin,
      nights: String(nights),
    });
    if (month !== null) params.set("month", String(month));
    fetch(`/api/prices?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PriceQuote | null) => {
        if (!cancelled && data) setState({ key, quote: data });
      })
      .catch(() => {
        /* catalogue en fallback */
      });
    return () => {
      cancelled = true;
    };
  }, [slug, origin, month, nights, key]);

  return state && state.key === key ? state.quote : null;
}
