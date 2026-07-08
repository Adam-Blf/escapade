"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface Holiday {
  date: string;
  name: string;
}

/**
 * Alerte jours fériés France sur la période du séjour : la demande et les
 * prix (train, hébergement) grimpent souvent autour de ces dates. Silencieuse
 * par défaut : rien ne s'affiche hors période concernée ou si l'appel échoue.
 */
export function HolidayBanner({
  month,
  startDate,
  nights,
}: {
  month: number | null;
  startDate: string | null;
  nights: number;
}) {
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ nights: String(nights) });
    if (month !== null) params.set("month", String(month));
    if (startDate !== null) params.set("startDate", startDate);
    fetch(`/api/holidays?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { holidays?: Holiday[] } | null) => {
        if (!cancelled && data?.holidays) setHolidays(data.holidays);
      })
      .catch(() => {
        /* pas de bannière si l'appel échoue */
      });
    return () => {
      cancelled = true;
    };
  }, [month, startDate, nights]);

  const { dict } = useLocale();
  if (holidays.length === 0) return null;

  return (
    <div
      role="status"
      className="mb-6 rounded-2xl border border-sable bg-sable/20 px-4 py-3"
    >
      <p className="mb-1 font-mono text-xs font-semibold uppercase tracking-widest text-ink">
        {dict.holidays.title}
      </p>
      <ul className="space-y-0.5 text-sm text-ink">
        {holidays.map((h) => (
          <li key={h.date}>{h.name}</li>
        ))}
      </ul>
    </div>
  );
}
