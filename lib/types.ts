export type Vibe = "mer" | "montagne" | "ville" | "lac";

export interface Criteria {
  budget: number | null;
  travelers: 1 | 2 | null;
  vibes: Vibe[];
  month: number | null;
  nights: number;
}

export interface Destination {
  slug: string;
  name: string;
  code: string;
  region: string;
  vibes: Vibe[];
  tagline: string;
  transport: {
    label: string;
    duration: string;
    priceAR: number;
    note?: string;
  };
  lodging: {
    dorm: number;
    duo: number;
  };
  foodPerDay: number;
  highlights: string[];
  duoTip: string;
  bestMonths: number[];
}

export interface Estimate {
  transport: number;
  lodgingSolo: number;
  lodgingDuo: number;
  food: number;
  activities: number;
  totalSolo: number;
  totalDuo: number;
}

export type BudgetFit = "ok" | "tight" | "over";

export interface Result {
  dest: Destination;
  est: Estimate;
  score: number;
  fit: BudgetFit | null;
}
