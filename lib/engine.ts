import { destinations } from "./destinations";
import { hoursOf, parseSignals, signalScore } from "./profile";
import type {
  Criteria,
  Destination,
  Estimate,
  OriginSlug,
  Result,
  TransportOption,
} from "./types";

const ACTIVITIES = 25;

export function estimate(
  dest: Destination,
  nights: number,
  travelers: number | null,
  transport: TransportOption
): Estimate {
  const days = nights + 1;
  const transportAR = transport.priceAR;
  const lodgingSolo = nights * dest.lodging.dorm;
  const lodgingDuo = Math.round((nights * dest.lodging.duo) / 2);
  const food = days * dest.foodPerDay;
  const totalSolo = transportAR + lodgingSolo + food + ACTIVITIES;
  const totalDuo = transportAR + lodgingDuo + food + ACTIVITIES;

  // À partir de 2 : on retient la formule la moins chère par personne
  // (dortoir ou chambres partagées)
  let totalPP: number | null = null;
  let totalGroup: number | null = null;
  if (travelers !== null) {
    totalPP = travelers === 1 ? totalSolo : Math.min(totalSolo, totalDuo);
    totalGroup = totalPP * travelers;
  }

  return {
    transport: transportAR,
    food,
    activities: ACTIVITIES,
    totalSolo,
    totalDuo,
    lodgingSolo,
    lodgingDuo,
    totalPP,
    totalGroup,
  };
}

/** Destinations desservies depuis une origine (exclut la ville de départ elle-même). */
export function reachableFrom(origin: OriginSlug): Destination[] {
  return destinations.filter((d) => d.slug !== origin && d.transports[origin]);
}

export function rank(criteria: Criteria, limit = 6): Result[] {
  const signals = parseSignals(criteria.profile);
  const results: Result[] = reachableFrom(criteria.origin).map((dest) => {
    const transport = dest.transports[criteria.origin]!;
    const est = estimate(dest, criteria.nights, criteria.travelers, transport);
    let score = 0;

    if (criteria.vibes.length > 0) {
      const matches = dest.vibes.filter((v) => criteria.vibes.includes(v)).length;
      score += matches > 0 ? 3 * matches : -6;
    }

    // Budget par personne de référence : la config demandée, sinon la plus optimiste
    const ref = est.totalPP ?? Math.min(est.totalSolo, est.totalDuo);
    let fit: Result["fit"] = null;
    if (criteria.budget !== null) {
      const b = criteria.budget;
      if (ref <= b) {
        fit = "ok";
        score += 2 + Math.min(0.5, (b - ref) / b);
      } else if (ref <= b * 1.15) {
        fit = "tight";
        score += 0.5;
      } else {
        fit = "over";
        score -= (4 * (ref - b)) / b;
      }
    }

    if (criteria.month !== null && dest.bestMonths.includes(criteria.month)) {
      score += 1;
    }

    score += signalScore(signals, dest.vibes, hoursOf(transport.duration));

    return { dest, transport, est, score, fit };
  });

  return results
    .sort((a, b) => b.score - a.score || a.est.totalSolo - b.est.totalSolo)
    .slice(0, limit);
}
