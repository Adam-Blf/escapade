"use client";

import type { Criteria } from "./types";

const KEY = "escapade.recent";
const MAX = 5;

export interface RecentSearch {
  criteria: Criteria;
  at: number;
}

/**
 * Rétro-compatibilité : un Criteria persisté avant l'ajout d'un champ
 * (ex. startDate) n'a pas cette clé en localStorage → undefined, pas null.
 * On la comble ici une fois pour toutes plutôt que de blinder chaque lecture.
 */
function normalize(criteria: Criteria): Criteria {
  // criteria vient de JSON.parse : le typage ne garantit rien à l'exécution.
  const raw = criteria as Partial<Criteria>;
  return { ...criteria, startDate: raw.startDate ?? null };
}

export function loadRecent(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as RecentSearch[]) : [];
    return Array.isArray(list)
      ? list.filter((r) => r?.criteria).map((r) => ({ ...r, criteria: normalize(r.criteria) }))
      : [];
  } catch {
    return [];
  }
}

export function saveRecent(criteria: Criteria): void {
  if (typeof window === "undefined") return;
  try {
    const sig = JSON.stringify(criteria);
    const list = loadRecent().filter((r) => JSON.stringify(r.criteria) !== sig);
    list.unshift({ criteria, at: Date.now() });
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* stockage plein ou bloqué : tant pis, feature de confort */
  }
}
