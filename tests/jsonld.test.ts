import { describe, expect, it } from "vitest";
import { safeJsonLd, websiteJsonLd, destinationJsonLd } from "@/lib/jsonld";
import { destinations } from "@/lib/destinations";
import { SITE_URL } from "@/lib/site";

describe("safeJsonLd", () => {
  it("produit du JSON valide", () => {
    expect(() => JSON.parse(safeJsonLd({ a: 1, b: "x" }))).not.toThrow();
  });

  it("échappe les < pour empêcher une fermeture prématurée de <script>", () => {
    const out = safeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>");
  });
});

describe("websiteJsonLd", () => {
  it("a un @type WebSite et une url valide pour la langue", () => {
    const data = websiteJsonLd("fr", "Titre", "Description");
    expect(data["@type"]).toBe("WebSite");
    expect(data.url).toBe(`${SITE_URL}/fr`);
    expect(data.inLanguage).toBe("fr");
  });
});

describe("destinationJsonLd", () => {
  it("a un @type TouristAttraction avec géo et url par destination", () => {
    const dest = destinations[0];
    const data = destinationJsonLd(dest, "fr", "desc");
    expect(data["@type"]).toBe("TouristAttraction");
    expect(data.url).toBe(`${SITE_URL}/fr/destination/${dest.slug}`);
    expect(data.geo.latitude).toBe(dest.coords.lat);
    expect(data.geo.longitude).toBe(dest.coords.lng);
  });

  it("génère un schema valide pour chaque destination du catalogue", () => {
    for (const dest of destinations) {
      const data = destinationJsonLd(dest, "en", "desc");
      expect(() => JSON.parse(safeJsonLd(data))).not.toThrow();
      expect(data.name).toBe(dest.name);
    }
  });
});
