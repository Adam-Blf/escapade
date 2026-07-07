import { describe, expect, it } from "vitest";
import { activities, activitiesOf } from "@/lib/activities";
import { destinations } from "@/lib/destinations";

describe("catalogue d'activités", () => {
  it("chaque destination a au moins 4 activités", () => {
    for (const d of destinations) {
      expect(activitiesOf(d.slug).length, d.slug).toBeGreaterThanOrEqual(4);
    }
  });

  it("chaque destination a au moins une activité gratuite", () => {
    for (const d of destinations) {
      expect(
        activitiesOf(d.slug).some((a) => a.price === 0),
        d.slug
      ).toBe(true);
    }
  });

  it("aucune activité orpheline (slug inconnu du catalogue)", () => {
    const slugs = new Set(destinations.map((d) => d.slug));
    for (const key of Object.keys(activities)) {
      expect(slugs.has(key), key).toBe(true);
    }
  });

  it("prix sains", () => {
    for (const list of Object.values(activities)) {
      for (const a of list) {
        expect(a.price).toBeGreaterThanOrEqual(0);
        expect(a.price).toBeLessThan(100);
        expect(a.name.length).toBeGreaterThan(3);
      }
    }
  });

  it("slug inconnu → liste vide", () => {
    expect(activitiesOf("atlantide")).toEqual([]);
  });
});
