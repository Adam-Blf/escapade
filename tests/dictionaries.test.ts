import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, LOCALES, getDictionary, isLocale } from "@/lib/i18n/dictionaries";

describe("isLocale", () => {
  it("accepte fr et en, rejette le reste", () => {
    expect(isLocale("fr")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("es")).toBe(false);
    expect(isLocale("")).toBe(false);
  });
});

describe("DEFAULT_LOCALE", () => {
  it("est une locale valide et incluse dans LOCALES", () => {
    expect(isLocale(DEFAULT_LOCALE)).toBe(true);
    expect(LOCALES).toContain(DEFAULT_LOCALE);
  });
});

describe("getDictionary", () => {
  it("renvoie un dictionnaire complet pour chaque locale", () => {
    for (const lang of LOCALES) {
      const dict = getDictionary(lang);
      expect(dict.header.tagline).toBeTruthy();
      expect(dict.footer.disclaimer).toBeTruthy();
    }
  });

  it("les fonctions de pluralisation/formatage produisent du texte non vide", () => {
    const fr = getDictionary("fr");
    const en = getDictionary("en");
    expect(fr.destinationPage.activitiesHelp(12)).toContain("12");
    expect(en.destinationPage.activitiesHelp(12)).toContain("12");
    expect(fr.destinationPage.co2Saved(50, 70)).toContain("50");
    expect(en.comparator.compareCta(1)).not.toContain("destinations");
    expect(en.comparator.compareCta(2)).toContain("destinations");
  });

  it("les libellés de groupe (3+ voyageurs) incluent bien la taille du groupe", () => {
    for (const lang of LOCALES) {
      const dict = getDictionary(lang);
      expect(dict.results.group(4)).toContain("4");
      expect(dict.results.groupTotal(720)).toContain("720");
      expect(dict.results.groupChip(4)).toContain("4");
    }
  });
});
