import { describe, expect, it } from "vitest";
import { MAX_COMPARE, canCompare, selectedResults, toggleCompare } from "@/lib/compare";
import { destinations } from "@/lib/destinations";
import type { Result } from "@/lib/types";

function fakeResult(slug: string): Result {
  const dest = destinations.find((d) => d.slug === slug)!;
  return {
    dest,
    transport: dest.transports.paris!,
    est: {
      transport: 30,
      food: 60,
      activities: 25,
      totalSolo: 150,
      totalDuo: 140,
      lodgingSolo: 40,
      lodgingDuo: 30,
      totalPP: null,
      totalGroup: null,
    },
    score: 1,
    fit: null,
  };
}

describe("toggleCompare", () => {
  it("ajoute un slug absent", () => {
    expect(toggleCompare([], "nice")).toEqual(["nice"]);
  });

  it("retire un slug déjà présent", () => {
    expect(toggleCompare(["nice", "lyon"], "nice")).toEqual(["lyon"]);
  });

  it("plafonne à MAX_COMPARE, ignore un ajout au-delà", () => {
    const full = ["nice", "lyon", "lille"];
    expect(full.length).toBe(MAX_COMPARE);
    expect(toggleCompare(full, "annecy")).toBe(full);
  });

  it("retirer reste possible même quand le plafond est atteint", () => {
    const full = ["nice", "lyon", "lille"];
    expect(toggleCompare(full, "lyon")).toEqual(["nice", "lille"]);
  });
});

describe("canCompare", () => {
  it("faux en dessous de 2, vrai à partir de 2", () => {
    expect(canCompare([])).toBe(false);
    expect(canCompare(["nice"])).toBe(false);
    expect(canCompare(["nice", "lyon"])).toBe(true);
  });
});

describe("selectedResults", () => {
  it("préserve l'ordre de sélection, pas celui du ranking", () => {
    const results = [fakeResult("nice"), fakeResult("lyon"), fakeResult("lille")];
    const picked = selectedResults(results, ["lille", "nice"]);
    expect(picked.map((r) => r.dest.slug)).toEqual(["lille", "nice"]);
  });

  it("ignore un slug sélectionné qui n'est plus dans les résultats", () => {
    const results = [fakeResult("nice")];
    expect(selectedResults(results, ["nice", "atlantide"])).toHaveLength(1);
  });
});
