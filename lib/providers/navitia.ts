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

interface DisruptionsResponse {
  disruptions?: Array<{
    status?: string;
    severity?: { name?: string };
    messages?: Array<{ text?: string }>;
  }>;
}

const MAX_DISRUPTIONS = 3;
const MAX_MESSAGE_CHARS = 160;
const DISRUPTIONS_CACHE_TTL_MS = 30 * 60 * 1000; // perturbations changent vite : cache court
const disruptionsCache = new Map<string, { at: number; value: string[] }>();

/**
 * Perturbations actives signalées par Navitia sur le meilleur itinéraire
 * entre deux points, à une date donnée. Best-effort : jamais de throw, []
 * sur toute erreur ou absence de perturbation — l'appelant n'a rien à gérer.
 */
export async function activeDisruptions(
  from: Coords,
  to: Coords,
  date: Date
): Promise<string[]> {
  const key = `${from.lat},${from.lng}|${to.lat},${to.lng}|${date.toISOString().slice(0, 10)}`;
  const hit = disruptionsCache.get(key);
  if (hit && Date.now() - hit.at < DISRUPTIONS_CACHE_TTL_MS) return hit.value;

  let result: string[] = [];
  try {
    const dt = `${date.toISOString().slice(0, 10).replaceAll("-", "")}T080000`;
    const url = new URL(`${BASE}/journeys`);
    url.searchParams.set("from", `${from.lng};${from.lat}`);
    url.searchParams.set("to", `${to.lng};${to.lat}`);
    url.searchParams.set("datetime", dt);
    url.searchParams.set("count", "1");
    url.searchParams.set("data_freshness", "realtime");
    url.searchParams.set("disruption_active", "true");

    const res = await fetch(url, {
      headers: { authorization: process.env.SNCF_API_KEY! },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.ok) {
      const data = (await res.json()) as DisruptionsResponse;
      result = (data.disruptions ?? [])
        .filter((d) => d.status !== "past")
        .map((d) => d.messages?.[0]?.text?.trim())
        .filter((t): t is string => Boolean(t))
        .map((t) => (t.length > MAX_MESSAGE_CHARS ? `${t.slice(0, MAX_MESSAGE_CHARS)}…` : t))
        .slice(0, MAX_DISRUPTIONS);
    }
  } catch {
    result = [];
  }

  disruptionsCache.set(key, { at: Date.now(), value: result });
  return result;
}
