import type { Coords } from "../types";

/**
 * API SNCF (Navitia), gratuite jusqu'à 5000 req/jour avec une clé
 * (https://numerique.sncf.com/startup/api/). Pas de prix exposés : on en tire
 * la durée réelle du meilleur itinéraire, ce qui crédibilise l'affichage.
 */
const BASE = "https://api.sncf.com/v1/coverage/sncf";
const TIMEOUT_MS = 8_000;

export function navitiaAvailable(): boolean {
  return Boolean(process.env.SNCF_API_KEY);
}

interface JourneysResponse {
  journeys?: Array<{ duration?: number; nb_transfers?: number }>;
}

/** "5h05" à partir de secondes. */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h === 0) return `${m} min`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

/**
 * Durée du meilleur trajet (le plus court proposé) entre deux points,
 * un matin de semaine représentatif à 08h00.
 */
export async function bestJourneyDuration(
  from: Coords,
  to: Coords,
  date: Date
): Promise<string | null> {
  const dt = `${date.toISOString().slice(0, 10).replaceAll("-", "")}T080000`;
  const url = new URL(`${BASE}/journeys`);
  // Navitia attend lon;lat
  url.searchParams.set("from", `${from.lng};${from.lat}`);
  url.searchParams.set("to", `${to.lng};${to.lat}`);
  url.searchParams.set("datetime", dt);
  url.searchParams.set("count", "3");

  const res = await fetch(url, {
    headers: { authorization: process.env.SNCF_API_KEY! },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Navitia journeys -> ${res.status}`);
  const data = (await res.json()) as JourneysResponse;

  const durations = (data.journeys ?? [])
    .map((j) => j.duration)
    .filter((d): d is number => typeof d === "number" && d > 0);
  if (durations.length === 0) return null;
  return formatDuration(Math.min(...durations));
}
