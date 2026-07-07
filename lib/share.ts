import { DEFAULT_ORIGIN, isOriginSlug } from "./origins";
import type { Criteria, Vibe } from "./types";

const VIBES: Vibe[] = ["mer", "montagne", "ville", "lac"];
const MAX_PROFILE_CHARS = 200;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(s: string): boolean {
  if (!ISO_DATE_RE.test(s)) return false;
  return !Number.isNaN(new Date(`${s}T00:00:00Z`).getTime());
}

/**
 * Critères ↔ query string, pour des recherches partageables par lien.
 * Clés courtes : o=origine b=budget t=voyageurs v=vibes m=mois d=date n=nuits p=profil.
 */
export function criteriaToParams(c: Criteria): URLSearchParams {
  const params = new URLSearchParams();
  params.set("o", c.origin);
  if (c.budget !== null) params.set("b", String(c.budget));
  if (c.travelers !== null) params.set("t", String(c.travelers));
  if (c.vibes.length > 0) params.set("v", c.vibes.join(","));
  if (c.month !== null) params.set("m", String(c.month));
  if (c.startDate !== null) params.set("d", c.startDate);
  params.set("n", String(c.nights));
  if (c.profile) params.set("p", c.profile.slice(0, MAX_PROFILE_CHARS));
  return params;
}

/** null si la query ne contient pas une recherche (page nue). */
export function criteriaFromParams(params: URLSearchParams): Criteria | null {
  if (!params.has("o") && !params.has("b") && !params.has("v")) return null;

  const o = params.get("o") ?? "";
  const origin = isOriginSlug(o) ? o : DEFAULT_ORIGIN;

  const b = Number(params.get("b"));
  const budget = params.has("b") && Number.isFinite(b) && b > 0 ? Math.min(99999, b) : null;

  const t = Number(params.get("t"));
  const travelers =
    params.has("t") && Number.isInteger(t) && t >= 1 && t <= 8 ? t : null;

  const vibes = (params.get("v") ?? "")
    .split(",")
    .filter((v): v is Vibe => (VIBES as string[]).includes(v));

  const m = Number(params.get("m"));
  const month = params.has("m") && Number.isInteger(m) && m >= 1 && m <= 12 ? m : null;

  const n = Number(params.get("n"));
  const nights = Number.isInteger(n) && n >= 1 && n <= 14 ? n : 4;

  const profile = params.get("p")?.slice(0, MAX_PROFILE_CHARS).trim() || null;

  const dParam = params.get("d");
  const startDate = dParam && isValidIsoDate(dParam) ? dParam : null;

  return { origin, budget, travelers, profile, vibes, month, startDate, nights };
}
