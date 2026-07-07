"use client";

import { useEffect, useState } from "react";
import type { Criteria, PriceQuote } from "./types";

/**
 * Devis serveur (durée Navitia + hôtel Amadeus) pour un ticket affiché.
 * Best-effort : null tant que rien n'est arrivé, silencieux en cas d'échec,
 * le catalogue reste affiché.
 */
export function useLiveQuote(slug: string, criteria: Criteria): PriceQuote | null {
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const { origin, month, nights } = criteria;

  useEffect(() => {
    let cancelled = false;
    setQuote(null);
    const params = new URLSearchParams({
      dest: slug,
      origin,
      nights: String(nights),
    });
    if (month !== null) params.set("month", String(month));
    fetch(`/api/prices?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PriceQuote | null) => {
        if (!cancelled && data) setQuote(data);
      })
      .catch(() => {
        /* catalogue en fallback */
      });
    return () => {
      cancelled = true;
    };
  }, [slug, origin, month, nights]);

  return quote;
}
