import type { Coords } from "../types";

/**
 * Amadeus Self-Service, environnement test (gratuit, quota mensuel).
 * https://developers.amadeus.com · clés AMADEUS_CLIENT_ID / AMADEUS_CLIENT_SECRET.
 * L'app fonctionne sans : ce module n'est appelé que si les clés existent.
 */
const BASE = "https://test.api.amadeus.com";
const TIMEOUT_MS = 8_000;

export function amadeusAvailable(): boolean {
  return Boolean(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.value;
  }
  const res = await fetch(`${BASE}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_CLIENT_ID!,
      client_secret: process.env.AMADEUS_CLIENT_SECRET!,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Amadeus OAuth -> ${res.status}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.value;
}

async function get<T>(path: string, params: Record<string, string>): Promise<T> {
  const token = await getToken();
  const url = new URL(path, BASE);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Amadeus GET ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

interface HotelListResponse {
  data?: Array<{ hotelId: string }>;
}

interface HotelOffersResponse {
  data?: Array<{
    hotel?: { name?: string };
    offers?: Array<{ price?: { total?: string; currency?: string } }>;
  }>;
}

export interface HotelQuote {
  /** Prix total chambre double / nuit, le moins cher trouvé */
  nightlyDuo: number;
  hotelName: string;
}

/**
 * Chambre double la moins chère autour du point demandé.
 * Deux appels : hotels/by-geocode puis hotel-offers sur les 20 premiers ids.
 */
export async function cheapestDouble(
  coords: Coords,
  checkin: string,
  checkout: string
): Promise<HotelQuote | null> {
  const list = await get<HotelListResponse>(
    "/v1/reference-data/locations/hotels/by-geocode",
    {
      latitude: String(coords.lat),
      longitude: String(coords.lng),
      radius: "8",
      radiusUnit: "KM",
    }
  );
  const ids = (list.data ?? []).slice(0, 20).map((h) => h.hotelId);
  if (ids.length === 0) return null;

  const offers = await get<HotelOffersResponse>("/v3/shopping/hotel-offers", {
    hotelIds: ids.join(","),
    checkInDate: checkin,
    checkOutDate: checkout,
    adults: "2",
    roomQuantity: "1",
    currency: "EUR",
    bestRateOnly: "true",
  });

  const nights = Math.max(
    1,
    Math.round(
      (new Date(checkout).getTime() - new Date(checkin).getTime()) / 86_400_000
    )
  );

  let best: HotelQuote | null = null;
  for (const entry of offers.data ?? []) {
    const total = Number(entry.offers?.[0]?.price?.total);
    if (!Number.isFinite(total) || total <= 0) continue;
    const nightly = Math.round(total / nights);
    if (!best || nightly < best.nightlyDuo) {
      best = { nightlyDuo: nightly, hotelName: entry.hotel?.name ?? "hôtel" };
    }
  }
  return best;
}
