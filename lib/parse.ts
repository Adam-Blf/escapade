import type { Criteria, Vibe } from "./types";

const MONTHS: Record<string, number> = {
  janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6,
  juillet: 7, aout: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12,
};

const VIBE_PATTERNS: Array<[Vibe, RegExp]> = [
  ["mer", /\b(mer|plage|ocean|littoral|cote|bord de mer|bronzer|baignade|falaise)s?\b/],
  ["montagne", /\b(montagne|rando|randonnee|alpes|pyrenees|sommet|refuge|grimper)s?\b/],
  ["ville", /\b(ville|citytrip|city trip|musee|culture|urbain|expo)s?\b/],
  ["lac", /\blacs?\b/],
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function parseText(input: string): Criteria {
  const t = normalize(input);

  // Budget : "300€", "300 euros", "budget de 300"
  let budget: number | null = null;
  const euro = t.match(/(\d{2,5})\s*(?:€|euros?|balles)/);
  const budgetWord = t.match(/budget\s*(?:de|d'environ|d'|max(?:i(?:mum)?)?)?\s*(\d{2,5})/);
  if (euro) budget = parseInt(euro[1], 10);
  else if (budgetWord) budget = parseInt(budgetWord[1], 10);
  if (budget === null && /\b(pas riche|fauche|petit budget|sans le sou|serre)\b/.test(t)) {
    budget = 300;
  }

  // Voyageurs : ambigu ("seule ou à 2") => null, les deux colonnes s'affichent
  const solo = /\b(seule?|solo|toute seule)\b/.test(t);
  const duo = /\ba (?:2|deux)\b|\ben couple\b|\bavec (?:ma|mon|une? )/.test(t);
  const travelers: Criteria["travelers"] = solo && duo ? null : duo ? 2 : solo ? 1 : null;

  // Vibes
  const vibes = VIBE_PATTERNS.filter(([, re]) => re.test(t)).map(([v]) => v);

  // Mois
  let month: number | null = null;
  for (const [name, num] of Object.entries(MONTHS)) {
    // \b obligatoire : "mais" contient "mai"
    if (new RegExp(`\\b${name}\\b`).test(t)) { month = num; break; }
  }

  // Durée : nuits explicites > jours > semaine > week-end.
  // "2 dernieres semaines d'aout" ne matche pas (mot entre le chiffre et "semaines").
  let nights = 4;
  const nightsMatch = t.match(/(\d{1,2})\s*nuits?/);
  const daysMatch = t.match(/(\d{1,2})\s*jours?/);
  if (nightsMatch) nights = parseInt(nightsMatch[1], 10);
  else if (daysMatch) nights = Math.max(1, parseInt(daysMatch[1], 10) - 1);
  else if (/\b(?:une|1)\s+semaine\b/.test(t) || /\bquinze jours\b/.test(t)) nights = 6;
  else if (/\b(?:deux|2)\s+semaines\b/.test(t)) nights = 13;
  else if (/week[- ]?end/.test(t)) nights = 2;
  nights = Math.min(14, Math.max(1, nights));

  return { budget, travelers, vibes, month, nights };
}
