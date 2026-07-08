import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { destinations } from "@/lib/destinations";
import { activitiesOf } from "@/lib/activities";
import { ORIGINS } from "@/lib/origins";
import { reachableFrom } from "@/lib/engine";
import type { OriginSlug } from "@/lib/types";

const ORIGIN_SLUGS = ORIGINS.map((o) => o.slug);
const IMG_DIR = path.resolve(__dirname, "../public/img");
const credits: Record<string, { page: string; source: string }> = JSON.parse(
  readFileSync(path.join(IMG_DIR, "credits.json"), "utf8")
);

describe("catalogue destinations · invariants documentés (CLAUDE.md)", () => {
  it("chaque destination a au moins 4 activités curatées", () => {
    for (const d of destinations) {
      expect(activitiesOf(d.slug).length, `${d.slug} a moins de 4 activités`).toBeGreaterThanOrEqual(4);
    }
  });

  it("au moins une activité gratuite par destination", () => {
    for (const d of destinations) {
      expect(
        activitiesOf(d.slug).some((a) => a.price === 0),
        `${d.slug} n'a aucune activité gratuite`
      ).toBe(true);
    }
  });

  it("coords valides (latitude/longitude finies, plausibles pour l'Europe)", () => {
    for (const d of destinations) {
      expect(Number.isFinite(d.coords.lat)).toBe(true);
      expect(Number.isFinite(d.coords.lng)).toBe(true);
      expect(d.coords.lat).toBeGreaterThan(35);
      expect(d.coords.lat).toBeLessThan(60);
    }
  });

  it("chaque destination a au moins une liaison transport", () => {
    for (const d of destinations) {
      expect(Object.keys(d.transports).length, `${d.slug} n'a aucun transport`).toBeGreaterThan(0);
    }
  });

  it("les clés de transports.* sont toujours des origines valides", () => {
    for (const d of destinations) {
      for (const key of Object.keys(d.transports)) {
        expect(ORIGIN_SLUGS).toContain(key);
      }
    }
  });

  it("bestMonths ne contient que des mois valides (1-12), non vide", () => {
    for (const d of destinations) {
      expect(d.bestMonths.length).toBeGreaterThan(0);
      for (const m of d.bestMonths) {
        expect(m).toBeGreaterThanOrEqual(1);
        expect(m).toBeLessThanOrEqual(12);
      }
    }
  });

  it("highlights et duoTip renseignés", () => {
    for (const d of destinations) {
      expect(d.highlights.length).toBeGreaterThan(0);
      expect(d.duoTip.trim().length).toBeGreaterThan(0);
    }
  });

  it("une destination homonyme d'une origine (lyon, lille, marseille) ne se propose jamais depuis elle-même", () => {
    const collisions = destinations
      .map((d) => d.slug)
      .filter((slug): slug is OriginSlug => ORIGIN_SLUGS.includes(slug as OriginSlug));
    expect(collisions.length).toBeGreaterThan(0); // sanity : le cas existe bien dans le catalogue

    for (const origin of collisions) {
      const slugs = reachableFrom(origin).map((d) => d.slug);
      expect(slugs).not.toContain(origin);
    }
  });

  it("aucun doublon de slug", () => {
    const slugs = destinations.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("chaque destination a son image dans public/img/ et son crédit Wikimedia", () => {
    for (const d of destinations) {
      expect(
        existsSync(path.join(IMG_DIR, `${d.slug}.jpg`)),
        `public/img/${d.slug}.jpg est absent (hero image cassée en prod)`
      ).toBe(true);
      expect(credits[d.slug], `${d.slug} n'a pas d'entrée dans credits.json`).toBeDefined();
    }
  });
});
