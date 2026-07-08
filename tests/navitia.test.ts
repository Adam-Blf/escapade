import { afterEach, describe, expect, it, vi } from "vitest";
import { bestJourneyDuration, formatDuration, navitiaAvailable } from "@/lib/providers/navitia";

const coords = { lat: 48.85, lng: 2.35 };

function jsonResponse(body: unknown, ok = true): Response {
  return { ok, status: ok ? 200 : 500, json: async () => body } as Response;
}

describe("navitiaAvailable", () => {
  afterEach(() => {
    delete process.env.SNCF_API_KEY;
  });

  it("false sans clé, true avec", () => {
    delete process.env.SNCF_API_KEY;
    expect(navitiaAvailable()).toBe(false);
    process.env.SNCF_API_KEY = "test-key";
    expect(navitiaAvailable()).toBe(true);
  });
});

describe("formatDuration", () => {
  it("moins d'une heure -> minutes seules", () => {
    expect(formatDuration(45 * 60)).toBe("45 min");
  });

  it("heures et minutes -> HhMM", () => {
    expect(formatDuration(5 * 3600 + 5 * 60)).toBe("5h05");
  });

  it("arrondit les minutes", () => {
    expect(formatDuration(2 * 3600 + 90)).toBe("2h02");
  });
});

describe("bestJourneyDuration", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.SNCF_API_KEY;
  });

  it("prend le trajet le plus court parmi les propositions", async () => {
    process.env.SNCF_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          journeys: [{ duration: 7200 }, { duration: 5400 }, { duration: 9000 }],
        })
      ) as unknown as typeof fetch
    );
    const result = await bestJourneyDuration(coords, coords, new Date("2026-09-01"));
    expect(result).toBe("1h30");
  });

  it("ignore les durées invalides (absentes ou nulles)", async () => {
    process.env.SNCF_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({ journeys: [{ duration: 0 }, {}, { duration: 3600 }] })
      ) as unknown as typeof fetch
    );
    const result = await bestJourneyDuration(coords, coords, new Date("2026-09-01"));
    expect(result).toBe("1h00");
  });

  it("null si aucun trajet exploitable", async () => {
    process.env.SNCF_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ journeys: [] })) as unknown as typeof fetch
    );
    expect(await bestJourneyDuration(coords, coords, new Date("2026-09-01"))).toBeNull();
  });

  it("throw si la réponse n'est pas ok", async () => {
    process.env.SNCF_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({}, false)) as unknown as typeof fetch
    );
    await expect(bestJourneyDuration(coords, coords, new Date("2026-09-01"))).rejects.toThrow();
  });
});
