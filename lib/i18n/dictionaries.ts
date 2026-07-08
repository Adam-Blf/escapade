export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Coquille UI uniquement (boutons, labels, messages). Le contenu éditorial
 * des destinations (lib/destinations.ts, lib/activities.ts) reste en
 * français dans les deux langues pour l'instant — le traduire fidèlement
 * est un chantier de contenu à part, pas une simple clé de dictionnaire.
 */
export interface Dictionary {
  header: {
    tagline: string;
    themeToLight: string;
    themeToDark: string;
    donate: string;
  };
  hero: {
    departureLabel: string;
    title1: string;
    title2Pre: string;
    title2Billet: string;
    subtitle: string;
  };
  modeTabs: {
    label: string;
    text: string;
    criteria: string;
  };
  textMode: {
    fieldLabel: string;
    placeholderPrefix: string;
    tryLabel: string;
    submit: string;
  };
  criteriaForm: {
    budgetLabel: string;
    vibesLegend: string;
    vibes: { mer: string; montagne: string; lac: string; ville: string };
    travelersLabel: string;
    travelersUnknown: string;
    travelersSolo: string;
    travelersN: string;
    monthLabel: string;
    monthFlexible: string;
    startDateLabel: string;
    startDateHelp: string;
    profileLabel: string;
    profileOptional: string;
    profilePlaceholder: string;
    nightsLabel: string;
    submit: string;
  };
  origin: { label: string };
  recent: { label: string };
  results: {
    heading: string;
    solo: string;
    soloNights: string;
    duo: string;
    asCouple: string;
    soloOrCouple: string;
    disclaimer: string;
  };
  fit: { ok: string; tight: string; over: string };
  ticket: {
    live: string;
    hotelLive: string;
    reserveTrain: string;
    hotels: string;
    hostels: string;
    share: string;
    shareCopied: string;
    compare: string;
    compareSelected: string;
  };
  comparator: {
    title: string;
    close: string;
    remove: string;
    transport: string;
    solo: string;
    duo: string;
    bestMonths: string;
    compareCta: (n: number) => string;
  };
  destinationPage: {
    back: string;
    highlights: string;
    duoTip: string;
    activities: string;
    activitiesHelp: (fallback: number) => string;
    budgetTitle: string;
    departureFrom: string;
    nights: string;
    soloDorm: string;
    duoLabel: string;
    trainLine: string;
    lodging: string;
    meals: string;
    activitiesLine: string;
    activitiesForfait: string;
    perPerson: string;
    co2Title: string;
    co2Train: string;
    co2Car: string;
    co2Plane: string;
    co2Saved: (kg: number, percent: number) => string;
    free: string;
  };
  disruptions: { title: string };
  donate: { supportProject: string };
  footer: { disclaimer: string };
}

const fr: Dictionary = {
  header: {
    tagline: "planificateur de vacances, budget honnête",
    themeToLight: "Passer en thème clair",
    themeToDark: "Passer en thème sombre",
    donate: "Soutenir le projet ↗",
  },
  hero: {
    departureLabel: "Départ",
    title1: "Dis ton envie.",
    title2Pre: "On sort le ",
    title2Billet: "billet",
    subtitle:
      "Une phrase ou trois cases à cocher : Escapade classe les destinations et calcule le vrai budget, seul(e) ou à deux. Pensé pour les budgets étudiants.",
  },
  modeTabs: { label: "Mode de recherche", text: "Je raconte", criteria: "Je coche" },
  textMode: {
    fieldLabel: "Décris ton envie de vacances",
    placeholderPrefix: "Ex : ",
    tryLabel: "Essaie :",
    submit: "Trouver où partir",
  },
  criteriaForm: {
    budgetLabel: "Budget par personne",
    vibesLegend: "Envie de",
    vibes: { mer: "Mer", montagne: "Montagne", lac: "Lac", ville: "Ville" },
    travelersLabel: "On part à",
    travelersUnknown: "Je ne sais pas encore",
    travelersSolo: "1 (solo)",
    travelersN: "personnes",
    monthLabel: "Mois",
    monthFlexible: "Flexible",
    startDateLabel: "Date de départ précise",
    startDateHelp:
      "Remplace le mois pour les durées et prix en direct. Laisse vide si tu es flexible.",
    profileLabel: "Qui part ?",
    profileOptional: "(optionnel)",
    profilePlaceholder:
      "Ex : deux étudiantes de 21 ans, petit budget, une préfère la marche à la fête",
    nightsLabel: "Nuits",
    submit: "Trouver où partir",
  },
  origin: { label: "Départ" },
  recent: { label: "Reprendre" },
  results: {
    heading: "Ce qu'on te propose",
    solo: "Solo",
    soloNights: "nuits",
    duo: "À 2, par pers.",
    asCouple: "à deux",
    soloOrCouple: "solo ou à deux",
    disclaimer:
      "Prix indicatifs (résa anticipée, tarifs jeunes inclus quand ils existent), à vérifier sur SNCF Connect / Ouigo avant de réserver.",
  },
  fit: { ok: "Dans ton budget", tight: "Ça passe juste", over: "Au-dessus du budget" },
  ticket: {
    live: "live",
    hotelLive: "hôtel live",
    reserveTrain: "Réserver le train ↗",
    hotels: "Hôtels ↗",
    hostels: "Auberges ↗",
    share: "Partager",
    shareCopied: "Lien copié ✓",
    compare: "Comparer",
    compareSelected: "Sélectionné ✓",
  },
  comparator: {
    title: "Comparateur",
    close: "Fermer",
    remove: "Retirer",
    transport: "Transport",
    solo: "Solo",
    duo: "À 2, par pers.",
    bestMonths: "Meilleurs mois",
    compareCta: (n) => `Comparer ${n} destination${n > 1 ? "s" : ""}`,
  },
  destinationPage: {
    back: "← Retour à la recherche",
    highlights: "Les incontournables",
    duoTip: "Le bon plan à deux ·",
    activities: "À faire sur place",
    activitiesHelp: (fallback) =>
      `Coche ce qui te tente : le budget à droite se met à jour. Sans sélection, on compte un forfait de ${fallback}€.`,
    budgetTitle: "Ton budget",
    departureFrom: "Départ de",
    nights: "Nuits",
    soloDorm: "Solo dortoir",
    duoLabel: "À deux",
    trainLine: "Train AR",
    lodging: "Dodo",
    meals: "Repas",
    activitiesLine: "Activités",
    activitiesForfait: "forfait",
    perPerson: "par personne",
    co2Title: "Impact carbone (aller-retour)",
    co2Train: "Train",
    co2Car: "Voiture",
    co2Plane: "Avion",
    co2Saved: (kg, percent) =>
      `Le train t'évite ~${kg} kg de CO2e par rapport à la voiture, soit ${percent}% en moins. Ordres de grandeur ADEME (Base Carbone), non contractuels.`,
    free: "gratuit",
  },
  disruptions: { title: "Perturbations SNCF signalées" },
  donate: { supportProject: "Soutenir le projet ↗" },
  footer: {
    disclaimer:
      "Photos : Wikipédia / Wikimedia Commons. Prix indicatifs calculés pour la ville de départ choisie, sans valeur contractuelle.",
  },
};

const en: Dictionary = {
  header: {
    tagline: "vacation planner, honest budget",
    themeToLight: "Switch to light theme",
    themeToDark: "Switch to dark theme",
    donate: "Support the project ↗",
  },
  hero: {
    departureLabel: "Departure",
    title1: "Say what you want.",
    title2Pre: "We print the ",
    title2Billet: "ticket",
    subtitle:
      "One sentence or three checkboxes: Escapade ranks destinations and works out the real budget, solo or as a couple. Built for student budgets.",
  },
  modeTabs: { label: "Search mode", text: "I describe it", criteria: "I pick options" },
  textMode: {
    fieldLabel: "Describe the trip you want",
    placeholderPrefix: "E.g.: ",
    tryLabel: "Try:",
    submit: "Find where to go",
  },
  criteriaForm: {
    budgetLabel: "Budget per person",
    vibesLegend: "Looking for",
    vibes: { mer: "Sea", montagne: "Mountains", lac: "Lake", ville: "City" },
    travelersLabel: "Travelling as",
    travelersUnknown: "Not sure yet",
    travelersSolo: "1 (solo)",
    travelersN: "people",
    monthLabel: "Month",
    monthFlexible: "Flexible",
    startDateLabel: "Exact departure date",
    startDateHelp:
      "Overrides the month for live durations and prices. Leave empty if you're flexible.",
    profileLabel: "Who's going?",
    profileOptional: "(optional)",
    profilePlaceholder:
      "E.g.: two 21-year-old students, tight budget, one prefers walking to partying",
    nightsLabel: "Nights",
    submit: "Find where to go",
  },
  origin: { label: "From" },
  recent: { label: "Resume" },
  results: {
    heading: "What we found for you",
    solo: "Solo",
    soloNights: "nights",
    duo: "As a couple, per person",
    asCouple: "as a couple",
    soloOrCouple: "solo or as a couple",
    disclaimer:
      "Indicative prices (advance booking, youth fares included where they exist) — check SNCF Connect / Ouigo before booking.",
  },
  fit: { ok: "Within budget", tight: "Cutting it close", over: "Over budget" },
  ticket: {
    live: "live",
    hotelLive: "live hotel",
    reserveTrain: "Book the train ↗",
    hotels: "Hotels ↗",
    hostels: "Hostels ↗",
    share: "Share",
    shareCopied: "Link copied ✓",
    compare: "Compare",
    compareSelected: "Selected ✓",
  },
  comparator: {
    title: "Comparison",
    close: "Close",
    remove: "Remove",
    transport: "Transport",
    solo: "Solo",
    duo: "As a couple, per person",
    bestMonths: "Best months",
    compareCta: (n) => `Compare ${n} destination${n > 1 ? "s" : ""}`,
  },
  destinationPage: {
    back: "← Back to search",
    highlights: "Must-sees",
    duoTip: "Couple tip ·",
    activities: "Things to do",
    activitiesHelp: (fallback) =>
      `Tick what interests you: the budget on the right updates live. With nothing ticked, we count a flat €${fallback}.`,
    budgetTitle: "Your budget",
    departureFrom: "Departing from",
    nights: "Nights",
    soloDorm: "Solo, dorm",
    duoLabel: "Couple",
    trainLine: "Return train",
    lodging: "Lodging",
    meals: "Meals",
    activitiesLine: "Activities",
    activitiesForfait: "flat rate",
    perPerson: "per person",
    co2Title: "Carbon footprint (round trip)",
    co2Train: "Train",
    co2Car: "Car",
    co2Plane: "Plane",
    co2Saved: (kg, percent) =>
      `The train saves ~${kg} kg of CO2e compared to driving, ${percent}% less. ADEME (Base Carbone) order-of-magnitude estimates, not contractual.`,
    free: "free",
  },
  disruptions: { title: "SNCF disruptions reported" },
  donate: { supportProject: "Support the project ↗" },
  footer: {
    disclaimer:
      "Photos: Wikipedia / Wikimedia Commons. Indicative prices for the chosen departure city, not contractually binding.",
  },
};

const dictionaries: Record<Locale, Dictionary> = { fr, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
