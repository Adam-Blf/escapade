import { describe, expect, it } from "vitest";
import { estimate, rank, reachableFrom } from "@/lib/engine";
import { destinations } from "@/lib/destinations";
import { ORIGINS } from "@/lib/origins";
import type { Criteria, Destination, TransportOption } from "@/lib/types";

const ter: TransportOption = { label: "TER", duration: "2h00", priceAR: 50 };

const dest: Destination = {
  slug: "test-ville",
  name: "Testville",
  code: "TST",
  region: "Testie",
  coords: { lat: 49.0, lng: 1.0 },
  vibes: ["mer"],
  tagline: "Pour les tests.",
  transports: { paris: ter },
  lodging: { dorm: 25, duo: 60 },
  foodPerDay: 20,
  highlights: ["Plage de sable"],
  duoTip: "Chambre double centre-ville",
  bestMonths: [6, 7, 8],
};

const base: Criteria = {
  origin: "paris",
  budget: null,
  travelers: null,
  profile: null,
  vibes: [],
  month: null,
  nights: 4,
};

describe("estimate", () => {
  it("additionne transport + dodo + repas + activités (solo)", () => {
    const est = estimate(dest, 4, 1, ter);
    // 50 + 4*25 + 5*20 + 25
    expect(est.totalSolo).toBe(275);
    expect(est.lodgingSolo).toBe(100);
    expect(est.food).toBe(100);
  });

  it("divise la chambre duo par deux", () => {
    const est = estimate(dest, 4, 2, ter);
    // 50 + (4*60)/2 + 5*20 + 25
    expect(est.totalDuo).toBe(295);
    expect(est.lodgingDuo).toBe(120);
  });

  it("groupe · retient la formule la moins chère par personne", () => {
    const est = estimate(dest, 4, 2, ter);
    expect(est.totalPP).toBe(Math.min(est.totalSolo, est.totalDuo));
    expect(est.totalGroup).toBe(est.totalPP! * 2);
  });

  it("config libre · totalPP et totalGroup null", () => {
    const est = estimate(dest, 4, null, ter);
    expect(est.totalPP).toBeNull();
    expect(est.totalGroup).toBeNull();
  });
});

describe("rank", () => {
  it("renvoie au plus `limit` résultats", () => {
    expect(rank(base, 3)).toHaveLength(3);
    expect(rank(base).length).toBeLessThanOrEqual(6);
  });

  it("favorise les destinations qui matchent la vibe demandée", () => {
    const results = rank({ ...base, vibes: ["montagne"] });
    expect(results[0].dest.vibes).toContain("montagne");
  });

  it("marque fit=ok quand le budget couvre, over quand il explose", () => {
    const généreux = rank({ ...base, budget: 2000, travelers: 1 });
    expect(généreux.every((r) => r.fit === "ok")).toBe(true);

    const serré = rank({ ...base, budget: 100, travelers: 1 });
    expect(serré.some((r) => r.fit === "over")).toBe(true);
  });

  it("bonus quand le mois demandé est un bon mois", () => {
    const juillet = rank({ ...base, vibes: ["mer"], month: 7 });
    for (const r of juillet.slice(0, 2)) {
      expect(r.dest.vibes).toContain("mer");
    }
  });

  it("sans budget, fit reste null", () => {
    const results = rank(base);
    expect(results.every((r) => r.fit === null)).toBe(true);
  });

  it("le catalogue est cohérent (données minimales sur chaque destination)", () => {
    for (const d of destinations) {
      expect(d.slug).toMatch(/^[a-z-]+$/);
      expect(d.transports.paris?.priceAR ?? 0).toBeGreaterThan(0);
      for (const t of Object.values(d.transports)) {
        expect(t.priceAR).toBeGreaterThan(0);
        expect(t.duration.length).toBeGreaterThan(0);
      }
      expect(d.lodging.dorm).toBeGreaterThan(0);
      expect(d.lodging.duo).toBeGreaterThan(0);
      expect(d.foodPerDay).toBeGreaterThan(0);
      expect(d.vibes.length).toBeGreaterThan(0);
      expect(d.bestMonths.length).toBeGreaterThan(0);
    }
  });

  it("chaque origine dessert au moins 12 destinations, jamais elle-même", () => {
    for (const o of ORIGINS) {
      const reachable = reachableFrom(o.slug);
      expect(reachable.length).toBeGreaterThanOrEqual(12);
      expect(reachable.some((d) => d.slug === o.slug)).toBe(false);
    }
  });

  it("rank respecte l'origine demandée (transport de la bonne ville)", () => {
    const fromLyon = rank({ ...base, origin: "lyon" });
    for (const r of fromLyon) {
      expect(r.transport).toBe(r.dest.transports.lyon);
      expect(r.dest.slug).not.toBe("lyon");
    }
  });
});
