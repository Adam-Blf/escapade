import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { amadeusAvailable } from "@/lib/providers/amadeus";

const coords = { lat: 45.8992, lng: 6.1294 };

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as Response;
}

function tokenResponse(): Response {
  return jsonResponse({ access_token: "tok-1", expires_in: 1800 });
}

/**
 * `cachedToken` est un état de module privé : sans réimport frais, le token
 * mis en cache par un test fausserait la séquence de mocks fetch du suivant.
 */
async function freshCheapestDouble() {
  vi.resetModules();
  const mod = await import("@/lib/providers/amadeus");
  return mod.cheapestDouble;
}

describe("amadeusAvailable", () => {
  afterEach(() => {
    delete process.env.AMADEUS_CLIENT_ID;
    delete process.env.AMADEUS_CLIENT_SECRET;
  });

  it("false si une seule des deux clés est présente", () => {
    process.env.AMADEUS_CLIENT_ID = "id";
    delete process.env.AMADEUS_CLIENT_SECRET;
    expect(amadeusAvailable()).toBe(false);
  });

  it("true si les deux clés sont présentes", () => {
    process.env.AMADEUS_CLIENT_ID = "id";
    process.env.AMADEUS_CLIENT_SECRET = "secret";
    expect(amadeusAvailable()).toBe(true);
  });
});

describe("cheapestDouble", () => {
  beforeEach(() => {
    process.env.AMADEUS_CLIENT_ID = "id";
    process.env.AMADEUS_CLIENT_SECRET = "secret";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.AMADEUS_CLIENT_ID;
    delete process.env.AMADEUS_CLIENT_SECRET;
  });

  it("choisit l'offre la moins chère par nuit parmi plusieurs hôtels", async () => {
    const cheapestDouble = await freshCheapestDouble();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(tokenResponse())
        .mockResolvedValueOnce(jsonResponse({ data: [{ hotelId: "H1" }, { hotelId: "H2" }] }))
        .mockResolvedValueOnce(
          jsonResponse({
            data: [
              { hotel: { name: "Hôtel Cher" }, offers: [{ price: { total: "400" } }] },
              { hotel: { name: "Hôtel Pas Cher" }, offers: [{ price: { total: "200" } }] },
            ],
          })
        ) as unknown as typeof fetch
    );

    const result = await cheapestDouble(coords, "2026-08-10", "2026-08-14");
    expect(result).toEqual({ nightlyDuo: 50, hotelName: "Hôtel Pas Cher" });
  });

  it("null si aucun hôtel trouvé autour du point", async () => {
    const cheapestDouble = await freshCheapestDouble();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(tokenResponse())
        .mockResolvedValueOnce(jsonResponse({ data: [] })) as unknown as typeof fetch
    );
    expect(await cheapestDouble(coords, "2026-08-10", "2026-08-14")).toBeNull();
  });

  it("ignore les offres sans prix exploitable", async () => {
    const cheapestDouble = await freshCheapestDouble();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(tokenResponse())
        .mockResolvedValueOnce(jsonResponse({ data: [{ hotelId: "H1" }] }))
        .mockResolvedValueOnce(jsonResponse({ data: [{ hotel: { name: "X" }, offers: [] }] })) as unknown as typeof fetch
    );
    expect(await cheapestDouble(coords, "2026-08-10", "2026-08-14")).toBeNull();
  });

  it("throw si l'appel hôtels échoue", async () => {
    const cheapestDouble = await freshCheapestDouble();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(tokenResponse())
        .mockResolvedValueOnce(jsonResponse({}, false, 500)) as unknown as typeof fetch
    );
    await expect(cheapestDouble(coords, "2026-08-10", "2026-08-14")).rejects.toThrow();
  });

  it("throw si l'authentification OAuth échoue", async () => {
    const cheapestDouble = await freshCheapestDouble();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse({}, false, 401)) as unknown as typeof fetch
    );
    await expect(cheapestDouble(coords, "2026-08-10", "2026-08-14")).rejects.toThrow();
  });
});
