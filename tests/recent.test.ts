// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { loadRecent, saveRecent } from "@/lib/recent";
import type { Criteria } from "@/lib/types";

const criteria: Criteria = {
  origin: "paris",
  budget: 300,
  travelers: 2,
  profile: null,
  vibes: ["mer"],
  month: 8,
  startDate: "2027-08-12",
  nights: 4,
};

describe("recent", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("aller-retour simple", () => {
    saveRecent(criteria);
    expect(loadRecent()[0].criteria).toEqual(criteria);
  });

  it("dé-duplique et garde les 5 plus récents", () => {
    for (let i = 0; i < 7; i++) saveRecent({ ...criteria, nights: i });
    expect(loadRecent()).toHaveLength(5);
  });

  it("rétro-compatibilité · un Criteria persisté sans startDate ne plante pas", () => {
    // Simule une entrée écrite avant l'ajout du champ startDate au type Criteria.
    const legacy = { ...criteria } as Partial<Criteria>;
    delete legacy.startDate;
    window.localStorage.setItem(
      "escapade.recent",
      JSON.stringify([{ criteria: legacy, at: Date.now() }])
    );
    const [entry] = loadRecent();
    expect(entry.criteria.startDate).toBeNull();
  });
});
