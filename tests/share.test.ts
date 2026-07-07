import { describe, expect, it } from "vitest";
import { criteriaFromParams, criteriaToParams } from "@/lib/share";
import type { Criteria } from "@/lib/types";

const full: Criteria = {
  origin: "lyon",
  budget: 300,
  travelers: 2,
  profile: "deux étudiantes",
  vibes: ["mer", "lac"],
  month: 8,
  startDate: "2027-08-12",
  nights: 5,
};

describe("share codec", () => {
  it("aller-retour sans perte", () => {
    const restored = criteriaFromParams(criteriaToParams(full));
    expect(restored).toEqual(full);
  });

  it("champs null omis puis restaurés null", () => {
    const sparse: Criteria = {
      origin: "paris",
      budget: null,
      travelers: null,
      profile: null,
      vibes: [],
      month: null,
      startDate: null,
      nights: 4,
    };
    expect(criteriaFromParams(criteriaToParams(sparse))).toEqual(sparse);
  });

  it("query vide → null (pas de recherche)", () => {
    expect(criteriaFromParams(new URLSearchParams())).toBeNull();
  });

  it("valeurs hostiles assainies", () => {
    const p = new URLSearchParams(
      "o=evil&b=-5&t=99&v=mer,xss&m=13&n=999&d=not-a-date&p=" + "x".repeat(500)
    );
    const c = criteriaFromParams(p)!;
    expect(c.origin).toBe("paris");
    expect(c.budget).toBeNull();
    expect(c.travelers).toBeNull();
    expect(c.vibes).toEqual(["mer"]);
    expect(c.month).toBeNull();
    expect(c.startDate).toBeNull();
    expect(c.nights).toBe(4);
    expect(c.profile!.length).toBeLessThanOrEqual(200);
  });

  it("date valide conservée, invalide ignorée", () => {
    const valid = criteriaFromParams(new URLSearchParams("o=paris&d=2027-09-01"))!;
    expect(valid.startDate).toBe("2027-09-01");

    const invalid = criteriaFromParams(new URLSearchParams("o=paris&d=2027-13-99"))!;
    expect(invalid.startDate).toBeNull();
  });
});
