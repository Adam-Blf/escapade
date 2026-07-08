/**
 * Jours fériés France métropolitaine — API officielle data.gouv.fr, gratuite,
 * sans clé, sans quota documenté (https://calendrier.api.gouv.fr). Un seul
 * fichier JSON couvre 2006-2031 : on le récupère une fois et on filtre
 * localement, plutôt qu'un appel par année.
 */
const URL = "https://calendrier.api.gouv.fr/jours-feries/metropole.json";
const TIMEOUT_MS = 8_000;
const CACHE_TTL_MS = 24 * 3600 * 1000;

export interface Holiday {
  date: string; // AAAA-MM-JJ
  name: string;
}

let cache: { at: number; calendar: Record<string, string> } | null = null;

async function calendar(): Promise<Record<string, string>> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.calendar;
  try {
    const res = await fetch(URL, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return cache?.calendar ?? {};
    const data = (await res.json()) as Record<string, string>;
    cache = { at: Date.now(), calendar: data };
    return data;
  } catch {
    return cache?.calendar ?? {};
  }
}

/**
 * Jours fériés dont la date tombe dans [checkin, checkout[ (checkout exclu :
 * jour du retour, pas passé sur place). Jamais de throw, [] sur toute panne.
 */
export async function holidaysInRange(checkin: Date, checkout: Date): Promise<Holiday[]> {
  const data = await calendar();
  const start = checkin.getTime();
  const end = checkout.getTime();

  return Object.entries(data)
    .filter(([date]) => {
      const t = new Date(`${date}T00:00:00Z`).getTime();
      return t >= start && t < end;
    })
    .map(([date, name]) => ({ date, name }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
