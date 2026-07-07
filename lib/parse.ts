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
  ["mer", /\b(mer|plage|ocean|littoral|cote|bord de mer|bronzer|baignade|falaise|surf|calanque|crique|maree)s?\b/],
  ["montagne", /\b(montagne|rando|randonnee|alpes|pyrenees|vosges|sommet|refuge|grimper|alpage|treks?)s?\b/],
  ["ville", /\b(ville|citytrip|city trip|musee|culture|urbain|expo|shopping|architecture)s?\b/],
  ["lac", /\blacs?\b/],
];

/** Saison → mois représentatif, si aucun mois explicite. */
const SEASONS: Array<[RegExp, number]> = [
  [/\b(cet )?ete\b|\bestival/, 7],
  [/\bprintemps\b/, 5],
  [/\bautomne\b/, 10],
  [/\bhiver(nal)?\b/, 12],
];

/** Prochaine occurrence de ce jour/mois : cette année si pas encore passée, sinon l'an prochain. */
function resolveYear(month: number, day: number, now: Date): number {
  const y = now.getFullYear();
  return new Date(Date.UTC(y, month - 1, day)).getTime() < now.getTime() ? y + 1 : y;
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Date exacte si mentionnée ("le 12 août", "à partir du 5/09"), sinon null.
 * Prioritaire sur le simple nom de mois : plus l'utilisateur est précis,
 * plus on doit l'être en retour (durées Navitia, hôtel Amadeus...).
 */
function parseExplicitDate(t: string, now: Date): { date: string; month: number } | null {
  const slash = t.match(/\b(\d{1,2})\/(\d{1,2})\b/);
  if (slash) {
    const day = parseInt(slash[1], 10);
    const month = parseInt(slash[2], 10);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return { date: isoDate(resolveYear(month, day, now), month, day), month };
    }
  }
  for (const [name, num] of Object.entries(MONTHS)) {
    const m = t.match(new RegExp(`\\b(\\d{1,2})\\s+${name}\\b`));
    if (m) {
      const day = parseInt(m[1], 10);
      if (day >= 1 && day <= 31) {
        return { date: isoDate(resolveYear(num, day, now), num, day), month: num };
      }
    }
  }
  return null;
}

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

export function parseText(
  input: string,
  fallbackOrigin: OriginSlug = DEFAULT_ORIGIN,
  now: Date = new Date()
): Criteria {
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

  // Date exacte ("le 12 août", "12/09") > nom de mois > saison
  // (\b obligatoire sur le mois : "mais" contient "mai")
  let month: number | null = null;
  let startDate: string | null = null;
  const explicit = parseExplicitDate(t, now);
  if (explicit) {
    month = explicit.month;
    startDate = explicit.date;
  } else {
    for (const [name, num] of Object.entries(MONTHS)) {
      if (new RegExp(`\\b${name}\\b`).test(t)) { month = num; break; }
    }
    if (month === null) {
      for (const [re, num] of SEASONS) {
        if (re.test(t)) { month = num; break; }
      }
    }
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
  else if (/long week[- ]?end/.test(t)) nights = 3;
  else if (/week[- ]?end/.test(t)) nights = 2;
  nights = Math.min(14, Math.max(1, nights));

  // En mode texte, la phrase entière sert de description du groupe
  const profile = /etudiant|enfant|famille|copine|copain|ami/.test(t) ? input.trim() : null;

  return { origin, budget, travelers, profile, vibes, month, startDate, nights };
}
