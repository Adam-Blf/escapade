import type { Coords } from "../types";

/**
 * Open-Meteo Archive API — gratuite, sans clé, sans inscription
 * (https://open-meteo.com/en/docs/historical-weather-api). On calcule une
 * normale climatique pour un mois donné en moyennant les 3 dernières années
 * complètes (jamais l'année en cours : les données récentes ont un léger
 * différé et un mois en cours serait partiel), plutôt qu'une prévision —
 * la plupart des recherches portent sur un mois à plusieurs semaines/mois,
 * hors de portée de toute prévision météo réelle.
 */
const BASE = "https://archive-api.open-meteo.com/v1/archive";
const TIMEOUT_MS = 8_000;
const YEARS_BACK = 3;
/** Au-dessus de ce seuil (mm), un jour compte comme pluvieux. */
const RAIN_THRESHOLD_MM = 1;

export interface ClimateNormal {
  avgMaxC: number;
  rainyDaysPct: number;
}

interface ArchiveResponse {
  daily?: {
    temperature_2m_max?: Array<number | null>;
    precipitation_sum?: Array<number | null>;
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

async function fetchYear(coords: Coords, year: number, month: number): Promise<ArchiveResponse | null> {
  const start = `${year}-${pad(month)}-01`;
  const end = `${year}-${pad(month)}-${pad(lastDayOfMonth(year, month))}`;
  const url = new URL(BASE);
  url.searchParams.set("latitude", String(coords.lat));
  url.searchParams.set("longitude", String(coords.lng));
  url.searchParams.set("start_date", start);
  url.searchParams.set("end_date", end);
  url.searchParams.set("daily", "temperature_2m_max,precipitation_sum");
  url.searchParams.set("timezone", "auto");

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return (await res.json()) as ArchiveResponse;
  } catch {
    return null; // réseau en panne / timeout : on continue avec les autres années
  }
}

/**
 * Normale climatique (température max moyenne, % de jours pluvieux) pour un
 * mois donné aux coordonnées fournies, moyennée sur les 3 dernières années
 * complètes. Retourne null si aucune année n'a pu être récupérée — jamais
 * de throw, l'appelant retombe silencieusement sur l'absence d'affichage.
 */
export async function climateNormal(coords: Coords, month: number | null): Promise<ClimateNormal | null> {
  const targetMonth = month ?? new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: YEARS_BACK }, (_, i) => currentYear - 1 - i);

  const results = await Promise.allSettled(years.map((y) => fetchYear(coords, y, targetMonth)));

  const maxTemps: number[] = [];
  let rainyDays = 0;
  let totalDays = 0;

  for (const r of results) {
    if (r.status !== "fulfilled" || !r.value?.daily) continue;
    const { temperature_2m_max, precipitation_sum } = r.value.daily;
    if (!temperature_2m_max) continue;
    for (let i = 0; i < temperature_2m_max.length; i++) {
      const t = temperature_2m_max[i];
      if (typeof t === "number") maxTemps.push(t);
      const p = precipitation_sum?.[i];
      if (typeof p === "number") {
        totalDays++;
        if (p >= RAIN_THRESHOLD_MM) rainyDays++;
      }
    }
  }

  if (maxTemps.length === 0) return null;

  const avgMaxC = maxTemps.reduce((sum, t) => sum + t, 0) / maxTemps.length;
  const rainyDaysPct = totalDays > 0 ? (rainyDays / totalDays) * 100 : 0;

  return {
    avgMaxC: Math.round(avgMaxC * 10) / 10,
    rainyDaysPct: Math.round(rainyDaysPct),
  };
}
