import type { Result } from "./types";

export const MAX_COMPARE = 3;
export const MIN_COMPARE = 2;

/** Ajoute/retire un slug d'un set de sélection, plafonné à MAX_COMPARE. */
export function toggleCompare(selected: string[], slug: string): string[] {
  if (selected.includes(slug)) {
    return selected.filter((s) => s !== slug);
  }
  if (selected.length >= MAX_COMPARE) return selected;
  return [...selected, slug];
}

/** Résultats sélectionnés, dans l'ordre où ils ont été choisis. */
export function selectedResults(results: Result[], selected: string[]): Result[] {
  return selected
    .map((slug) => results.find((r) => r.dest.slug === slug))
    .filter((r): r is Result => r !== undefined);
}

export function canCompare(selected: string[]): boolean {
  return selected.length >= MIN_COMPARE;
}
