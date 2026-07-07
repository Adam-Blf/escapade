import type { Origin, OriginSlug } from "./types";

export const ORIGINS: Origin[] = [
  { slug: "paris", name: "Paris", code: "PAR", station: "toutes gares", coords: { lat: 48.8566, lng: 2.3522 } },
  { slug: "lyon", name: "Lyon", code: "LYS", station: "Part-Dieu / Perrache", coords: { lat: 45.764, lng: 4.8357 } },
  { slug: "lille", name: "Lille", code: "LIL", station: "Flandres / Europe", coords: { lat: 50.6292, lng: 3.0573 } },
  { slug: "marseille", name: "Marseille", code: "MRS", station: "Saint-Charles", coords: { lat: 43.2965, lng: 5.3698 } },
  { slug: "bordeaux", name: "Bordeaux", code: "BOD", station: "Saint-Jean", coords: { lat: 44.8378, lng: -0.5792 } },
];

export const DEFAULT_ORIGIN: OriginSlug = "paris";

export function getOrigin(slug: OriginSlug): Origin {
  return ORIGINS.find((o) => o.slug === slug) ?? ORIGINS[0];
}

export function isOriginSlug(value: string): value is OriginSlug {
  return ORIGINS.some((o) => o.slug === value);
}
