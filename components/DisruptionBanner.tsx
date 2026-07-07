"use client";

import { useEffect, useState } from "react";
import type { OriginSlug } from "@/lib/types";

/**
 * Alerte perturbations SNCF sur la liaison origine → destination. Silencieuse
 * par défaut : rien ne s'affiche sans clé Navitia, sans perturbation active,
 * ou si l'appel échoue.
 */
export function DisruptionBanner({
  destSlug,
  origin,
  month,
}: {
  destSlug: string;
  origin: OriginSlug;
  month: number | null;
}) {
  const [disruptions, setDisruptions] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ dest: destSlug, origin });
    if (month !== null) params.set("month", String(month));
    fetch(`/api/disruptions?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { disruptions?: string[] } | null) => {
        if (!cancelled && data?.disruptions) setDisruptions(data.disruptions);
      })
      .catch(() => {
        /* pas de bannière si l'appel échoue */
      });
    return () => {
      cancelled = true;
    };
  }, [destSlug, origin, month]);

  if (disruptions.length === 0) return null;

  return (
    <div
      role="alert"
      className="mb-6 rounded-2xl border border-corail/40 bg-corail/10 px-4 py-3"
    >
      <p className="mb-1 font-mono text-xs font-semibold uppercase tracking-widest text-corail">
        Perturbations SNCF signalées
      </p>
      <ul className="space-y-0.5 text-sm text-ink">
        {disruptions.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
    </div>
  );
}
