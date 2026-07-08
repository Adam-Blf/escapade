import { addNights, resolveCheckin, toISODate } from "./dates";
import { getOrigin } from "./origins";
import { criteriaToParams } from "./share";
import type { Criteria, Destination } from "./types";

/**
 * Deep-links de réservation pré-remplis. Zéro API, zéro coût : de simples
 * URLs publiques stables. On envoie l'utilisateur réserver là où c'est
 * le moins cher, l'app ne prend aucune commission.
 */

function citySlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Page horaires Trainline origine → destination. Pattern vérifié manuellement
 * (`/fr/horaires-des-trains/...` répond 404, la seule structure stable est
 * `/en/train-times/{from}-to-{to}` — testé sur plusieurs liaisons du catalogue).
 */
export function trainUrl(criteria: Criteria, dest: Destination): string {
  const from = citySlug(getOrigin(criteria.origin).name);
  const to = citySlug(dest.name);
  return `https://www.thetrainline.com/en/train-times/${from}-to-${to}`;
}

/** Recherche Booking pré-remplie ville + dates + 2 adultes. */
export function bookingUrl(criteria: Criteria, dest: Destination): string {
  const checkin = resolveCheckin(criteria.startDate, criteria.month);
  const checkout = addNights(checkin, criteria.nights);
  const params = new URLSearchParams({
    ss: `${dest.name}, France`,
    checkin: toISODate(checkin),
    checkout: toISODate(checkout),
    group_adults: String(criteria.travelers ?? 2),
    no_rooms: "1",
  });
  return `https://www.booking.com/searchresults.fr.html?${params.toString()}`;
}

/** Recherche HostelWorld (dortoirs, le vrai plan budget). */
export function hostelUrl(dest: Destination): string {
  return `https://www.hostelworld.com/s?q=${encodeURIComponent(`${dest.name}, France`)}`;
}

/**
 * Page Wikipédia FR de la destination, pour en savoir plus. Toujours FR
 * (dest.name est le nom français, ex. "Genève") quelle que soit la langue
 * de l'UI : pas de mapping de titres EN à maintenir pour un simple lien.
 */
export function wikipediaUrl(dest: Destination): string {
  return `https://fr.wikipedia.org/wiki/${encodeURIComponent(dest.name.replace(/ /g, "_"))}`;
}

/** Lien partageable de la recherche courante (client only). */
export function searchShareUrl(criteria: Criteria): string {
  const qs = criteriaToParams(criteria).toString();
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/?${qs}`;
}
