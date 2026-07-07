import type { Vibe } from "./types";

/** Signaux extraits de la description libre du groupe. */
export interface GroupSignals {
  student: boolean;
  children: boolean;
  reducedMobility: boolean;
  party: boolean;
  calm: boolean;
}

export const NO_SIGNALS: GroupSignals = {
  student: false,
  children: false,
  reducedMobility: false,
  party: false,
  calm: false,
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function parseSignals(text: string | null): GroupSignals {
  if (!text) return NO_SIGNALS;
  const t = normalize(text);
  return {
    student: /\b(etudiant(?:e?s?)|fac|licence|master|erasmus|-\s?26|crous)\b/.test(t),
    children: /\b(enfants?|bebes?|gamins?|fils|fille de \d|famille|poussette)\b/.test(t),
    reducedMobility: /\b(fauteuil|pmr|mobilite reduite|handicap|marche difficile|bequilles)\b/.test(t),
    party: /\b(fete|faire la fete|sortir|bars?|boite|soiree)\b/.test(t),
    calm: /\b(calme|tranquille|repos|se poser|deconnecter|zen|nature)\b/.test(t),
  };
}

/** Conseils affichés sur chaque billet selon le groupe. */
export function tipsFor(signals: GroupSignals): string[] {
  const tips: string[] = [];
  if (signals.student) {
    tips.push("Tarifs -26 ans : carte Avantage Jeune (49€/an) et Ouigo dès 16€.");
  }
  if (signals.children) {
    tips.push("Avec des enfants : privilégie les trajets directs et courts.");
  }
  if (signals.reducedMobility) {
    tips.push("Accès PMR : service Assist'enGare gratuit, à réserver 48h avant.");
  }
  return tips;
}

/**
 * Ajustement de score par destination selon le groupe.
 * Léger exprès : le budget et les vibes restent les critères dominants.
 */
export function signalScore(
  signals: GroupSignals,
  destVibes: Vibe[],
  transportHours: number
): number {
  let score = 0;
  if (signals.children) {
    if (transportHours <= 3) score += 1;
    else if (transportHours > 4.5) score -= 1.5;
  }
  if (signals.calm && (destVibes.includes("lac") || destVibes.includes("montagne"))) {
    score += 0.75;
  }
  if (signals.party && destVibes.includes("ville")) {
    score += 0.75;
  }
  return score;
}

/** "5h30" → 5.5 ; "45 min" → 0.75. Tolère les formats du catalogue. */
export function hoursOf(duration: string): number {
  const hm = duration.match(/(\d+)\s*h\s*(\d+)?/i);
  if (hm) return parseInt(hm[1], 10) + (hm[2] ? parseInt(hm[2], 10) / 60 : 0);
  const min = duration.match(/(\d+)\s*min/i);
  if (min) return parseInt(min[1], 10) / 60;
  return 3;
}
