import { describe, expect, it } from "vitest";
import { surpriseCriteria } from "@/lib/surprise";

/** Générateur déterministe : renvoie la séquence fournie puis boucle sur la dernière valeur. */
function sequence(values: number[]): () => number {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
}

describe("surpriseCriteria", () => {
  it("garde l'origine demandée", () => {
    expect(surpriseCriteria("lyon", sequence([0])).origin).toBe("lyon");
  });

  it("toujours entre 1 et 2 envies", () => {
    for (let i = 0; i < 50; i++) {
      const c = surpriseCriteria("paris");
      expect(c.vibes.length).toBeGreaterThanOrEqual(1);
      expect(c.vibes.length).toBeLessThanOrEqual(2);
    }
  });

  it("nuits toujours entre 2 et 7", () => {
    for (let i = 0; i < 50; i++) {
      const c = surpriseCriteria("paris");
      expect(c.nights).toBeGreaterThanOrEqual(2);
      expect(c.nights).toBeLessThanOrEqual(7);
    }
  });

  it("budget toujours positif et raisonnable", () => {
    for (let i = 0; i < 50; i++) {
      const c = surpriseCriteria("paris");
      expect(c.budget).toBeGreaterThan(0);
      expect(c.budget).toBeLessThanOrEqual(600);
    }
  });

  it("travelers, startDate et profile toujours null (config libre)", () => {
    const c = surpriseCriteria("paris");
    expect(c.travelers).toBeNull();
    expect(c.startDate).toBeNull();
    expect(c.profile).toBeNull();
  });

  it("déterministe avec un générateur fixé", () => {
    const rand = sequence([0.1, 0.1, 0.9, 0.9, 0.05, 0.05, 0.5]);
    const c = surpriseCriteria("marseille", rand);
    expect(c).toMatchObject({ origin: "marseille", travelers: null, startDate: null, profile: null });
  });

  it("month soit null soit un mois valide (1-12)", () => {
    for (let i = 0; i < 50; i++) {
      const c = surpriseCriteria("paris");
      if (c.month !== null) {
        expect(c.month).toBeGreaterThanOrEqual(1);
        expect(c.month).toBeLessThanOrEqual(12);
      }
    }
  });
});
