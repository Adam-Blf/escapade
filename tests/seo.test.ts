import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import manifest from "@/app/manifest";
import { destinations } from "@/lib/destinations";
import { LOCALES } from "@/lib/i18n/dictionaries";
import { SITE_URL } from "@/lib/site";

describe("sitemap", () => {
  it("contient une home + une entrée par destination, pour chaque langue", () => {
    const entries = sitemap();
    expect(entries).toHaveLength(LOCALES.length * (destinations.length + 1));
    for (const lang of LOCALES) {
      expect(entries.map((e) => e.url)).toContain(`${SITE_URL}/${lang}`);
    }
  });

  it("chaque destination a une URL /<lang>/destination/<slug> unique et valide", () => {
    const urls = sitemap().map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const lang of LOCALES) {
      for (const d of destinations) {
        expect(urls).toContain(`${SITE_URL}/${lang}/destination/${d.slug}`);
      }
    }
  });
});

describe("robots", () => {
  it("autorise tout sauf /api/, référence le sitemap", () => {
    const r = robots();
    expect(r.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    const rules = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    expect(rules.allow).toBe("/");
    expect(rules.disallow).toBe("/api/");
  });
});

describe("manifest", () => {
  it("a un nom, un start_url et au moins deux icônes", () => {
    const m = manifest();
    expect(m.name).toContain("Escapade");
    expect(m.start_url).toBe("/");
    expect(m.icons!.length).toBeGreaterThanOrEqual(2);
    for (const icon of m.icons!) {
      expect(icon.src).toMatch(/^\/icon-(192|512)$/);
    }
  });
});
