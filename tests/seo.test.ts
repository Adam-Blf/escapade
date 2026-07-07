import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import manifest from "@/app/manifest";
import { destinations } from "@/lib/destinations";
import { SITE_URL } from "@/lib/site";

describe("sitemap", () => {
  it("contient la home + une entrée par destination", () => {
    const entries = sitemap();
    expect(entries).toHaveLength(destinations.length + 1);
    expect(entries[0].url).toBe(SITE_URL);
  });

  it("chaque destination a une URL /destination/<slug> unique et valide", () => {
    const urls = sitemap()
      .slice(1)
      .map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const d of destinations) {
      expect(urls).toContain(`${SITE_URL}/destination/${d.slug}`);
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
