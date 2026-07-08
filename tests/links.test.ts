import { afterEach, describe, expect, it, vi } from "vitest";
import { bookingUrl, hostelUrl, searchShareUrl, trainUrl, wikipediaUrl } from "@/lib/links";
import { destinations } from "@/lib/destinations";
import type { Criteria } from "@/lib/types";

const criteria: Criteria = {
  origin: "paris",
  budget: 300,
  travelers: 2,
  profile: null,
  vibes: ["mer"],
  month: 9,
  startDate: null,
  nights: 4,
};

const etretat = destinations.find((d) => d.slug === "etretat")!;

describe("liens de réservation", () => {
  it("trainline · slugs origine et destination, accents retirés", () => {
    expect(trainUrl(criteria, etretat)).toBe(
      "https://www.thetrainline.com/en/train-times/paris-to-etretat"
    );
    expect(trainUrl({ ...criteria, origin: "lyon" }, etretat)).toContain("/lyon-to-");
  });

  it("booking · ville, dates et voyageurs pré-remplis", () => {
    const url = new URL(bookingUrl(criteria, etretat));
    expect(url.searchParams.get("ss")).toBe("Étretat, France");
    expect(url.searchParams.get("checkin")).toMatch(/^\d{4}-09-15$/);
    expect(url.searchParams.get("checkout")).toMatch(/^\d{4}-09-19$/);
    expect(url.searchParams.get("group_adults")).toBe("2");
  });

  it("booking · 2 adultes par défaut en config libre", () => {
    const url = new URL(bookingUrl({ ...criteria, travelers: null }, etretat));
    expect(url.searchParams.get("group_adults")).toBe("2");
  });

  it("booking · une date précise prime sur le mois", () => {
    const url = new URL(
      bookingUrl({ ...criteria, startDate: "2027-03-10" }, etretat)
    );
    expect(url.searchParams.get("checkin")).toBe("2027-03-10");
    expect(url.searchParams.get("checkout")).toBe("2027-03-14");
  });

  it("hostelworld · recherche ville", () => {
    expect(hostelUrl(etretat)).toContain("hostelworld.com");
    expect(hostelUrl(etretat)).toContain(encodeURIComponent("Étretat, France"));
  });

  it("les noms composés donnent des slugs propres", () => {
    const deauville = destinations.find((d) => d.slug === "deauville")!;
    expect(trainUrl(criteria, deauville)).toContain("paris-to-deauville-trouville");
  });

  it("wikipedia · toujours fr.wikipedia.org, espaces en underscore", () => {
    expect(wikipediaUrl(etretat)).toBe("https://fr.wikipedia.org/wiki/%C3%89tretat");
    const geneve = destinations.find((d) => d.slug === "geneve")!;
    expect(wikipediaUrl(geneve)).toBe(`https://fr.wikipedia.org/wiki/${encodeURIComponent(geneve.name)}`);
  });

  describe("searchShareUrl", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("sans window (SSR) · base vide, garde la query string", () => {
      const url = searchShareUrl(criteria);
      expect(url.startsWith("/?")).toBe(true);
      expect(url).toContain("o=paris");
    });

    it("avec window · préfixe par l'origine courante", () => {
      vi.stubGlobal("window", { location: { origin: "https://escapade.beloucif.com" } });
      const url = searchShareUrl(criteria);
      expect(url.startsWith("https://escapade.beloucif.com/?")).toBe(true);
    });
  });
});
