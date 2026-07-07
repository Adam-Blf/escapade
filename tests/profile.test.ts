import { describe, expect, it } from "vitest";
import { hoursOf, parseSignals, signalScore, tipsFor } from "@/lib/profile";
import { parseText } from "@/lib/parse";

describe("parseSignals", () => {
  it("détecte étudiant, enfants, PMR, fête, calme", () => {
    expect(parseSignals("deux étudiantes de 21 ans").student).toBe(true);
    expect(parseSignals("avec un enfant de 3 ans").children).toBe(true);
    expect(parseSignals("ma mère est en fauteuil").reducedMobility).toBe(true);
    expect(parseSignals("on veut faire la fête").party).toBe(true);
    expect(parseSignals("besoin de calme et de nature").calm).toBe(true);
  });

  it("null → aucun signal", () => {
    const s = parseSignals(null);
    expect(Object.values(s).every((v) => v === false)).toBe(true);
  });
});

describe("signalScore", () => {
  it("enfants · bonus court trajet, malus long trajet", () => {
    const s = parseSignals("famille avec enfant");
    expect(signalScore(s, ["mer"], 2)).toBeGreaterThan(0);
    expect(signalScore(s, ["mer"], 6)).toBeLessThan(0);
  });

  it("calme · bonus lac/montagne", () => {
    const s = parseSignals("on veut du calme");
    expect(signalScore(s, ["lac"], 3)).toBeGreaterThan(0);
    expect(signalScore(s, ["ville"], 3)).toBe(0);
  });

  it("fête · bonus ville", () => {
    const s = parseSignals("on veut sortir le soir");
    expect(signalScore(s, ["ville"], 3)).toBeGreaterThan(0);
  });
});

describe("tipsFor", () => {
  it("conseils ciblés étudiants / enfants / PMR", () => {
    expect(tipsFor(parseSignals("étudiant fauché"))).toHaveLength(1);
    expect(tipsFor(parseSignals("étudiante avec un enfant"))).toHaveLength(2);
    expect(tipsFor(parseSignals(null))).toHaveLength(0);
  });
});

describe("hoursOf", () => {
  it("parse les formats du catalogue", () => {
    expect(hoursOf("2h15")).toBeCloseTo(2.25);
    expect(hoursOf("25 min")).toBeCloseTo(0.417, 2);
    expect(hoursOf("6h")).toBe(6);
  });
});

describe("parseText v2", () => {
  it("saisons → mois représentatif", () => {
    expect(parseText("partir cet été").month).toBe(7);
    expect(parseText("un truc au printemps").month).toBe(5);
  });

  it("mois explicite gagne sur la saison", () => {
    expect(parseText("cet été, plutôt septembre").month).toBe(9);
  });

  it("long week-end → 3 nuits", () => {
    expect(parseText("un long week-end").nights).toBe(3);
  });

  it("nouvelles vibes · surf, calanques, ski", () => {
    expect(parseText("faire du surf").vibes).toContain("mer");
    expect(parseText("voir les calanques").vibes).toContain("mer");
    expect(parseText("un trek dans les vosges").vibes).toContain("montagne");
  });
});
