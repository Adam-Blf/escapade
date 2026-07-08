import { describe, expect, it } from "vitest";
import { DEFAULT_ORIGIN, getOrigin, isOriginSlug, ORIGINS } from "@/lib/origins";
import type { OriginSlug } from "@/lib/types";

describe("origins", () => {
  it("getOrigin renvoie la bonne ville pour chaque slug connu", () => {
    for (const o of ORIGINS) {
      expect(getOrigin(o.slug)).toEqual(o);
    }
  });

  it("getOrigin retombe sur la première ville pour un slug inconnu", () => {
    expect(getOrigin("atlantide" as OriginSlug)).toEqual(ORIGINS[0]);
  });

  it("isOriginSlug valide uniquement les 5 villes du catalogue", () => {
    expect(isOriginSlug("paris")).toBe(true);
    expect(isOriginSlug("atlantide")).toBe(false);
  });

  it("DEFAULT_ORIGIN est une origine valide", () => {
    expect(isOriginSlug(DEFAULT_ORIGIN)).toBe(true);
  });
});
