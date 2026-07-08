import { afterEach, describe, expect, it, vi } from "vitest";
import { airQualityNormal, climateNormal } from "@/lib/providers/openmeteo";

const coords = { lat: 43.7, lng: 7.26 };

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
  } as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("climateNormal", () => {
  it("moyenne température max et calcule le % de jours pluvieux sur plusieurs années", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        daily: {
          temperature_2m_max: [20, 24, 28],
          precipitation_sum: [0, 2, 0],
        },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await climateNormal(coords, 8);

    expect(result).not.toBeNull();
    // 3 années x [20,24,28] -> moyenne 24
    expect(result!.avgMaxC).toBeCloseTo(24, 5);
    // 3 années x 1 jour pluvieux sur 3 -> 33%
    expect(result!.rainyDaysPct).toBe(33);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("continue avec les années disponibles si une requête échoue", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ daily: { temperature_2m_max: [10], precipitation_sum: [0] } }))
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce(jsonResponse({ daily: { temperature_2m_max: [30], precipitation_sum: [5] } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await climateNormal(coords, 7);

    expect(result).not.toBeNull();
    expect(result!.avgMaxC).toBeCloseTo(20, 5);
  });

  it("retourne null si toutes les années échouent", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect(await climateNormal(coords, 6)).toBeNull();
  });

  it("retourne null si l'API répond mais sans données exploitables", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ daily: {} })));
    expect(await climateNormal(coords, 6)).toBeNull();
  });

  it("mois null retombe sur le mois courant sans planter", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ daily: { temperature_2m_max: [15], precipitation_sum: [0] } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await climateNormal(coords, null);
    expect(result).not.toBeNull();
  });
});

describe("airQualityNormal", () => {
  it("moyenne l'EAQI horaire sur plusieurs années", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ hourly: { european_aqi: [20, 30, 40] } })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await airQualityNormal(coords, 8);
    expect(result).toBe(30); // moyenne de 20,30,40
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("ignore les valeurs null et continue avec les années disponibles", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ hourly: { european_aqi: [10, null] } }))
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce(jsonResponse({ hourly: { european_aqi: [30] } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await airQualityNormal(coords, 7);
    expect(result).toBe(20); // moyenne de 10 et 30
  });

  it("null si toutes les années échouent", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect(await airQualityNormal(coords, 6)).toBeNull();
  });

  it("null si l'API répond mais sans donnée exploitable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ hourly: {} })));
    expect(await airQualityNormal(coords, 6)).toBeNull();
  });

  it("mois null retombe sur le mois courant sans planter", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ hourly: { european_aqi: [25] } }))
    );
    expect(await airQualityNormal(coords, null)).toBe(25);
  });
});
