import type { Criteria, OriginSlug, Vibe } from "./types";

const VIBES: Vibe[] = ["mer", "montagne", "lac", "ville"];
const BUDGETS = [200, 250, 300, 350, 400, 500, 600];

function pick<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

/**
 * Critères aléatoires mais raisonnables, pour qui ne sait pas ce qu'il veut.
 * `rand` injectable pour les tests (déterminisme), Math.random par défaut.
 */
export function surpriseCriteria(origin: OriginSlug, rand: () => number = Math.random): Criteria {
  const vibeCount = rand() < 0.6 ? 1 : 2;
  const vibes = new Set<Vibe>();
  while (vibes.size < vibeCount) vibes.add(pick(VIBES, rand));

  return {
    origin,
    budget: pick(BUDGETS, rand),
    travelers: null,
    profile: null,
    vibes: [...vibes],
    month: rand() < 0.5 ? null : Math.floor(rand() * 12) + 1,
    startDate: null,
    nights: Math.floor(rand() * 6) + 2, // 2 à 7 nuits
  };
}
