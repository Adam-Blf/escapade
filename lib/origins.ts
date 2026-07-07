import type { Origin, OriginSlug } from "./types";

export const ORIGINS: Origin[] = [
  { slug: "paris", name: "Paris", code: "PAR", station: "toutes gares" },
  { slug: "lyon", name: "Lyon", code: "LYS", station: "Part-Dieu / Perrache" },
  { slug: "lille", name: "Lille", code: "LIL", station: "Flandres / Europe" },
  { slug: "marseille", name: "Marseille", code: "MRS", station: "Saint-Charles" },
  { slug: "bordeaux", name: "Bordeaux", code: "BOD", station: "Saint-Jean" },
];

export const DEFAULT_ORIGIN: OriginSlug = "paris";

export function getOrigin(slug: OriginSlug): Origin {
  return ORIGINS.find((o) => o.slug === slug) ?? ORIGINS[0];
}

export function isOriginSlug(value: string): value is OriginSlug {
  return ORIGINS.some((o) => o.slug === value);
}
