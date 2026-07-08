import { afterEach, describe, expect, it, vi } from "vitest";

function jsonResponse(body: unknown, ok = true): Response {
  return { ok, json: async () => body } as Response;
}

/** `cache` est un état de module privé : réimport frais pour isoler chaque test. */
async function freshHolidaysInRange() {
  vi.resetModules();
  const mod = await import("@/lib/providers/joursFeries");
  return mod.holidaysInRange;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("holidaysInRange", () => {
  it("ne garde que les jours fériés dans [checkin, checkout[", async () => {
    const holidaysInRange = await freshHolidaysInRange();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          "2027-05-01": "1er mai",
          "2027-05-08": "Victoire 1945",
          "2027-07-14": "Fête nationale",
        })
      ) as unknown as typeof fetch
    );
    const result = await holidaysInRange(new Date("2027-05-01T00:00:00Z"), new Date("2027-05-09T00:00:00Z"));
    expect(result).toEqual([
      { date: "2027-05-01", name: "1er mai" },
      { date: "2027-05-08", name: "Victoire 1945" },
    ]);
  });

  it("checkout exclu : le jour de retour ne compte pas", async () => {
    const holidaysInRange = await freshHolidaysInRange();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ "2027-05-08": "Victoire 1945" })) as unknown as typeof fetch
    );
    const result = await holidaysInRange(new Date("2027-05-01T00:00:00Z"), new Date("2027-05-08T00:00:00Z"));
    expect(result).toEqual([]);
  });

  it("[] si aucun jour férié dans la période", async () => {
    const holidaysInRange = await freshHolidaysInRange();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ "2027-01-01": "1er janvier" })) as unknown as typeof fetch
    );
    const result = await holidaysInRange(new Date("2027-05-01T00:00:00Z"), new Date("2027-05-05T00:00:00Z"));
    expect(result).toEqual([]);
  });

  it("[] sans throw si l'appel réseau échoue", async () => {
    const holidaysInRange = await freshHolidaysInRange();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch);
    const result = await holidaysInRange(new Date("2027-05-01T00:00:00Z"), new Date("2027-05-05T00:00:00Z"));
    expect(result).toEqual([]);
  });

  it("[] sans throw si la réponse n'est pas ok", async () => {
    const holidaysInRange = await freshHolidaysInRange();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, false)) as unknown as typeof fetch);
    const result = await holidaysInRange(new Date("2027-05-01T00:00:00Z"), new Date("2027-05-05T00:00:00Z"));
    expect(result).toEqual([]);
  });

  it("résultat trié par date", async () => {
    const holidaysInRange = await freshHolidaysInRange();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          "2027-12-25": "Jour de Noël",
          "2027-12-24": "veille",
        })
      ) as unknown as typeof fetch
    );
    const result = await holidaysInRange(new Date("2027-12-20T00:00:00Z"), new Date("2027-12-31T00:00:00Z"));
    expect(result.map((h) => h.date)).toEqual(["2027-12-24", "2027-12-25"]);
  });
});
