import { DEFAULT_ORIGIN } from "./origins";
import type { Criteria, OriginSlug, Vibe } from "./types";

const MONTHS: Record<string, number> = {
  janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6,
  juillet: 7, aout: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12,
};

const NUMBER_WORDS: Record<string, number> = {
  deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8,
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

/**
 * Ville de départ mentionnée dans le texte ("depuis Lyon", "je pars de Lille",
 * "au départ de Marseille"). Un simple nom de ville sans marqueur de départ ne
 * suffit pas : "envie de voir Lyon" est une destination, pas une origine.
 */
function parseOrigin(t: string): OriginSlug | null {
  const m = t.match(
    /\b(?:depuis|au depart de|je pars de|on part de|j'habite (?:a|vers)?|de chez moi a)\s+(paris|lyon|lille|marseille|bordeaux)\b/
  );
  return m ? (m[1] as OriginSlug) : null;
}

export function parseText(input: string, fallbackOrigin: OriginSlug = DEFAULT_ORIGIN): Criteria {
  const t = normalize(input);

  const origin = parseOrigin(t) ?? fallbackOrigin;

  // Budget : "300€", "300 euros", "budget de 300"
  let budget: number | null = null;
  const euro = t.match(/(\d{2,5})\s*(?:€|euros?|balles)/);
  const budgetWord = t.match(/budget\s*(?:de|d'environ|d'|max(?:i(?:mum)?)?)?\s*(\d{2,5})/);
  if (euro) budget = parseInt(euro[1], 10);
  else if (budgetWord) budget = parseInt(budgetWord[1], 10);
  if (budget === null && /\b(pas riche|fauche|petit budget|sans le sou|serre)\b/.test(t)) {
    budget = 300;
  }

  // Voyageurs : nombre explicite ("a 3", "a trois", "nous sommes 4"),
  // sinon solo / duo. Ambigu ("seule ou a 2") => null, les deux s'affichent.
  let travelers: Criteria["travelers"] = null;
  const numDigit = t.match(/\b(?:a|entre|nous sommes|on est)\s+(\d)\b/);
  const numWord = t.match(/\b(?:a|entre|nous sommes|on est)\s+(deux|trois|quatre|cinq|six|sept|huit)\b/);
  const solo = /\b(seule?|solo|toute seule)\b/.test(t);
  if (numDigit) travelers = Math.min(8, Math.max(1, parseInt(numDigit[1], 10)));
  else if (numWord) travelers = NUMBER_WORDS[numWord[1]];
  else if (/\ben couple\b|\bavec (?:ma|mon|une? )/.test(t)) travelers = 2;
  if (solo) travelers = travelers !== null && travelers > 1 ? null : 1;

  // Vibes
  const vibes = VIBE_PATTERNS.filter(([, re]) => re.test(t)).map(([v]) => v);

  // Mois (\b obligatoire : "mais" contient "mai")
  let month: number | null = null;
  for (const [name, num] of Object.entries(MONTHS)) {
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

  // En mode texte, la phrase entière sert de description du groupe
  const profile = /etudiant|enfant|famille|copine|copain|ami/.test(t) ? input.trim() : null;

  return { origin, budget, travelers, profile, vibes, month, nights };
}
