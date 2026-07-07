export type Vibe = "mer" | "montagne" | "ville" | "lac";

export type OriginSlug = "paris" | "lyon" | "lille" | "marseille" | "bordeaux";

export interface Coords {
  lat: number;
  lng: number;
}

export interface Origin {
  slug: OriginSlug;
  name: string;
  /** Code affiché sur le billet (PAR, LYS...) */
  code: string;
  station: string;
  coords: Coords;
}

export interface Criteria {
  origin: OriginSlug;
  budget: number | null;
  /** null = configuration libre, on affiche solo et à deux */
  travelers: number | null;
  /** Description libre du groupe : âges, étudiants, enfants, mobilité... */
  profile: string | null;
  vibes: Vibe[];
  month: number | null;
  nights: number;
}

export interface TransportOption {
  label: string;
  duration: string;
  priceAR: number;
  note?: string;
}

export interface Destination {
  slug: string;
  name: string;
  code: string;
  region: string;
  coords: Coords;
  vibes: Vibe[];
  tagline: string;
  /** Transport aller-retour par ville de départ. Absent = liaison non proposée. */
  transports: Partial<Record<OriginSlug, TransportOption>>;
  lodging: {
    /** lit en dortoir / emplacement camping, par personne et par nuit */
    dorm: number;
    /** chambre double / tente pour deux, prix total par nuit */
    duo: number;
  };
  foodPerDay: number;
  highlights: string[];
  duoTip: string;
  bestMonths: number[];
}

export interface Estimate {
  transport: number;
  food: number;
  activities: number;
  /** par personne, seul(e) en dortoir */
  totalSolo: number;
  /** par personne, chambre partagée à deux */
  totalDuo: number;
  lodgingSolo: number;
  lodgingDuo: number;
  /** par personne pour le groupe demandé (null si config libre) */
  totalPP: number | null;
  /** total pour tout le groupe (null si config libre) */
  totalGroup: number | null;
}

export type BudgetFit = "ok" | "tight" | "over";

export interface Result {
  dest: Destination;
  /** Le transport retenu pour l'origine demandée */
  transport: TransportOption;
  est: Estimate;
  score: number;
  fit: BudgetFit | null;
}

/**
 * Devis rafraîchi côté serveur. Chaque volet est indépendant :
 * le train peut rester catalogue pendant que l'hôtel est live.
 */
export interface PriceQuote {
  dest: string;
  origin: OriginSlug;
  /** Prix AR train par personne (catalogue · aucune API prix train gratuite) */
  transportAR: number;
  transportSource: string;
  transportLive: boolean;
  /** Durée réelle du meilleur itinéraire (Navitia SNCF) si clé configurée */
  liveDuration: string | null;
  /** Prix chambre double / nuit, le moins cher trouvé (Amadeus) si clés configurées */
  hotelNightlyDuo: number | null;
  hotelName: string | null;
  hotelLive: boolean;
  /** Normale climatique du mois demandé (Open-Meteo, gratuit, sans clé) */
  climateAvgMaxC: number | null;
  climateRainyDaysPct: number | null;
}
