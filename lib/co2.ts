import type { Coords } from "./types";

/**
 * Distance à vol d'oiseau entre deux points, en km (formule de haversine,
 * rayon terrestre moyen 6371 km). Toujours une sous-estimation de la
 * distance réelle par le rail, mais suffisante pour un ordre de grandeur.
 */
export function haversineKm(a: Coords, b: Coords): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Facteurs d'émission par passager-km, ordres de grandeur publiés par
 * l'ADEME (Base Carbone / Base Empreinte, moyennes France) :
 *  - train  · ~2.4 g CO2e/km (TGV/TER grandes lignes, parc majoritairement électrifié)
 *  - voiture· ~193 g CO2e/km (voiture individuelle, moyenne du parc français)
 *  - avion  · ~230 g CO2e/km (court/moyen-courrier domestique, effet radiatif inclus)
 * Non contractuel : ce sont des moyennes nationales, pas une mesure du trajet réel.
 */
const EMISSION_G_PER_KM = {
  train: 2.4,
  car: 193,
  plane: 230,
} as const;

export interface Co2Comparison {
  /** kg de CO2e pour l'aller-retour complet, par mode */
  train: number;
  car: number;
  plane: number;
}

/**
 * Émissions estimées pour un aller-retour sur la distance à vol d'oiseau
 * donnée. `distanceKm` est la distance ALLER SIMPLE ; la fonction double en
 * interne pour représenter l'aller-retour (convention alignée sur
 * `transport.priceAR` du catalogue, déjà exprimé en aller-retour).
 */
export function co2Comparison(distanceKm: number): Co2Comparison {
  const roundTripKm = distanceKm * 2;
  const kg = (gPerKm: number) => Math.round((roundTripKm * gPerKm) / 100) / 10;
  return {
    train: kg(EMISSION_G_PER_KM.train),
    car: kg(EMISSION_G_PER_KM.car),
    plane: kg(EMISSION_G_PER_KM.plane),
  };
}

/** kg économisés et % de réduction en prenant le train plutôt que la voiture. */
export function co2SavedVsCar(distanceKm: number): { kg: number; percent: number } {
  const { train, car } = co2Comparison(distanceKm);
  if (car <= 0) return { kg: 0, percent: 0 };
  const kg = Math.round((car - train) * 10) / 10;
  const percent = Math.round((kg / car) * 100);
  return { kg, percent };
}
