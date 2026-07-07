import { describe, expect, it } from "vitest";
import { bookingUrl, hostelUrl, trainUrl } from "@/lib/links";
import { destinations } from "@/lib/destinations";
import type { Criteria } from "@/lib/types";

const criteria: Criteria = {
  origin: "paris",
  budget: 300,
  travelers: 2,
  profile: null,
  vibes: ["mer"],
  month: 9,
  nights: 4,
};

const etretat = destinations.find((d) => d.slug === "etretat")!;

describe("liens de réservation", () => {
  it("trainline · slugs origine et destination, accents retirés", () => {
    expect(trainUrl(criteria, etretat)).toBe(
      "https://www.thetrainline.com/fr/horaires-des-trains/paris-a-etretat"
    );
    expect(trainUrl({ ...criteria, origin: "lyon" }, etretat)).toContain("/lyon-a-");
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

  it("hostelworld · recherche ville", () => {
    expect(hostelUrl(etretat)).toContain("hostelworld.com");
    expect(hostelUrl(etretat)).toContain(encodeURIComponent("Étretat, France"));
  });

  it("les noms composés donnent des slugs propres", () => {
    const deauville = destinations.find((d) => d.slug === "deauville")!;
    expect(trainUrl(criteria, deauville)).toContain("paris-a-deauville-trouville");
  });
});
