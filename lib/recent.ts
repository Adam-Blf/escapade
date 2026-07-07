"use client";

import type { Criteria } from "./types";

const KEY = "escapade.recent";
const MAX = 5;

export interface RecentSearch {
  criteria: Criteria;
  at: number;
}

export function loadRecent(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as RecentSearch[]) : [];
    return Array.isArray(list) ? list.filter((r) => r?.criteria) : [];
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
