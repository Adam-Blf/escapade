// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { applyTheme, currentTheme, getStoredTheme, NO_FLASH_SCRIPT } from "@/lib/theme";

describe("theme", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    window.localStorage.clear();
  });

  it("currentTheme lit l'attribut data-theme, défaut light", () => {
    expect(currentTheme()).toBe("light");
    document.documentElement.setAttribute("data-theme", "dark");
    expect(currentTheme()).toBe("dark");
  });

  it("applyTheme pose l'attribut et persiste le choix", () => {
    applyTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(getStoredTheme()).toBe("dark");
  });

  it("getStoredTheme null si rien de valide n'est stocké", () => {
    expect(getStoredTheme()).toBeNull();
    window.localStorage.setItem("escapade.theme", "purple");
    expect(getStoredTheme()).toBeNull();
  });

  it("le script anti-flash ne référence aucune donnée réseau/identité", () => {
    expect(NO_FLASH_SCRIPT).toContain("data-theme");
    expect(NO_FLASH_SCRIPT).not.toMatch(/fetch|XMLHttpRequest|http/);
  });
});
