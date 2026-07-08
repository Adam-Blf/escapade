import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/providers/navitia", () => ({
  navitiaAvailable: vi.fn(() => false),
  bestJourneyDuration: vi.fn(),
}));
vi.mock("@/lib/providers/amadeus", () => ({
  amadeusAvailable: vi.fn(() => false),
  cheapestDouble: vi.fn(),
}));
vi.mock("@/lib/providers/openmeteo", () => ({
  climateNormal: vi.fn(async () => null),
  airQualityNormal: vi.fn(async () => null),
}));

import { getQuote } from "@/lib/prices";
import { navitiaAvailable, bestJourneyDuration } from "@/lib/providers/navitia";
import { amadeusAvailable, cheapestDouble } from "@/lib/providers/amadeus";
import { airQualityNormal, climateNormal } from "@/lib/providers/openmeteo";

const mockedNavitiaAvailable = vi.mocked(navitiaAvailable);
const mockedBestJourneyDuration = vi.mocked(bestJourneyDuration);
const mockedAmadeusAvailable = vi.mocked(amadeusAvailable);
const mockedCheapestDouble = vi.mocked(cheapestDouble);
const mockedClimateNormal = vi.mocked(climateNormal);
const mockedAirQualityNormal = vi.mocked(airQualityNormal);

// Chaque test utilise un nombre de nuits distinct : lib/prices.ts cache par
// clé dest|origin|month|nights|startDate, un module-level Map partagé entre
// tous les tests de ce fichier (un seul import statique, non réinitialisé).
let nightsCounter = 1;
function uniqueNights(): number {
  return nightsCounter++;
}

beforeEach(() => {
  mockedNavitiaAvailable.mockReturnValue(false);
  mockedAmadeusAvailable.mockReturnValue(false);
  mockedBestJourneyDuration.mockReset();
  mockedCheapestDouble.mockReset();
  mockedClimateNormal.mockResolvedValue(null);
  mockedAirQualityNormal.mockResolvedValue(null);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("getQuote", () => {
  it("null si la destination n'existe pas", async () => {
    expect(await getQuote("atlantide", "paris", 8, uniqueNights(), null)).toBeNull();
  });

  it("null si aucune liaison n'est proposée depuis cette origine (marseille depuis marseille)", async () => {
    expect(await getQuote("marseille", "marseille", 8, uniqueNights(), null)).toBeNull();
  });

  it("retombe sur le catalogue quand aucune clé n'est configurée", async () => {
    const quote = await getQuote("etretat", "paris", 8, uniqueNights(), null);
    expect(quote).not.toBeNull();
    expect(quote!.transportSource).toBe("catalogue");
    expect(quote!.transportLive).toBe(false);
    expect(quote!.hotelLive).toBe(false);
    expect(quote!.hotelNightlyDuo).toBeNull();
    expect(quote!.liveDuration).toBeNull();
    expect(quote!.airQualityAvg).toBeNull();
    expect(mockedBestJourneyDuration).not.toHaveBeenCalled();
    expect(mockedCheapestDouble).not.toHaveBeenCalled();
  });

  it("intègre la qualité de l'air (toujours actif, sans clé)", async () => {
    mockedAirQualityNormal.mockResolvedValue(24);
    const quote = await getQuote("nice", "paris", 8, uniqueNights(), null);
    expect(quote!.airQualityAvg).toBe(24);
  });

  it("intègre la durée live quand Navitia est disponible", async () => {
    mockedNavitiaAvailable.mockReturnValue(true);
    mockedBestJourneyDuration.mockResolvedValue("1h30");
    const quote = await getQuote("nice", "paris", 8, uniqueNights(), null);
    expect(quote!.liveDuration).toBe("1h30");
    expect(quote!.transportLive).toBe(false); // le prix reste catalogue, seule la durée est live
  });

  it("intègre l'hôtel live quand Amadeus est disponible", async () => {
    mockedAmadeusAvailable.mockReturnValue(true);
    mockedCheapestDouble.mockResolvedValue({ nightlyDuo: 60, hotelName: "Test Hotel" });
    const quote = await getQuote("nice", "paris", 8, uniqueNights(), null);
    expect(quote!.hotelLive).toBe(true);
    expect(quote!.hotelNightlyDuo).toBe(60);
    expect(quote!.hotelName).toBe("Test Hotel");
  });

  it("un volet en échec n'empêche pas les autres (Promise.allSettled)", async () => {
    mockedNavitiaAvailable.mockReturnValue(true);
    mockedBestJourneyDuration.mockRejectedValue(new Error("navitia down"));
    mockedAmadeusAvailable.mockReturnValue(true);
    mockedCheapestDouble.mockResolvedValue({ nightlyDuo: 60, hotelName: "OK Hotel" });
    mockedAirQualityNormal.mockRejectedValue(new Error("openmeteo down"));

    const quote = await getQuote("nice", "paris", 8, uniqueNights(), null);
    expect(quote!.liveDuration).toBeNull();
    expect(quote!.hotelLive).toBe(true);
    expect(quote!.airQualityAvg).toBeNull();
  });

  it("met en cache : un deuxième appel identique ne rappelle pas les providers", async () => {
    mockedNavitiaAvailable.mockReturnValue(true);
    mockedBestJourneyDuration.mockResolvedValue("2h00");

    const nights = uniqueNights();
    await getQuote("nice", "paris", 8, nights, null);
    await getQuote("nice", "paris", 8, nights, null);
    expect(mockedBestJourneyDuration).toHaveBeenCalledTimes(1);
  });

  it("des paramètres différents (mois) invalident le cache", async () => {
    mockedNavitiaAvailable.mockReturnValue(true);
    mockedBestJourneyDuration.mockResolvedValue("2h00");

    const nights = uniqueNights();
    await getQuote("nice", "paris", 6, nights, null);
    await getQuote("nice", "paris", 12, nights, null);
    expect(mockedBestJourneyDuration).toHaveBeenCalledTimes(2);
  });
});
