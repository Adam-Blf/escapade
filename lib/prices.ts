import { destinations } from "./destinations";
import { getOrigin } from "./origins";
import { addNights, resolveCheckin, toISODate } from "./dates";
import { amadeusAvailable, cheapestDouble } from "./providers/amadeus";
import { bestJourneyDuration, navitiaAvailable } from "./providers/navitia";
import { airQualityNormal, climateNormal } from "./providers/openmeteo";
import type { OriginSlug, PriceQuote } from "./types";

/**
 * Devis temps réel, contrainte zéro coût :
 *  - train · aucune API prix gratuite n'existe (SNCF ne les expose pas), le
 *    prix reste catalogue MAIS la durée passe en live via Navitia (clé gratuite,
 *    5000 req/j) dès que SNCF_API_KEY est présente ;
 *  - hôtel · chambre double la moins chère via Amadeus Self-Service test
 *    (gratuit) dès que AMADEUS_CLIENT_ID/SECRET sont présentes ;
 *  - climat · normale du mois via Open-Meteo (gratuit, sans clé, toujours actif) ;
 *  - sans aucune clé, tout retombe sur le catalogue : l'app marche toujours.
 * Un cache mémoire 12h protège les quotas gratuits (les instances Fluid
 * Compute de Vercel réutilisent le module entre requêtes).
 */
const CACHE_TTL_MS = 12 * 3600 * 1000;
const cache = new Map<string, { at: number; quote: PriceQuote }>();

export async function getQuote(
  slug: string,
  origin: OriginSlug,
  month: number | null,
  nights = 4,
  startDate: string | null = null
): Promise<PriceQuote | null> {
  const dest = destinations.find((d) => d.slug === slug);
  const transport = dest?.transports[origin];
  if (!dest || !transport) return null;

  const key = `${slug}|${origin}|${month ?? "x"}|${nights}|${startDate ?? "x"}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.quote;

  const quote: PriceQuote = {
    dest: slug,
    origin,
    transportAR: transport.priceAR,
    transportSource: "catalogue",
    transportLive: false,
    liveDuration: null,
    hotelNightlyDuo: null,
    hotelName: null,
    hotelLive: false,
    climateAvgMaxC: null,
    climateRainyDaysPct: null,
    airQualityAvg: null,
  };

  const checkin = resolveCheckin(startDate, month);
  const checkout = addNights(checkin, nights);

  const [duration, hotel, climate, airQuality] = await Promise.allSettled([
    navitiaAvailable()
      ? bestJourneyDuration(getOrigin(origin).coords, dest.coords, checkin)
      : Promise.resolve(null),
    amadeusAvailable()
      ? cheapestDouble(dest.coords, toISODate(checkin), toISODate(checkout))
      : Promise.resolve(null),
    climateNormal(dest.coords, month),
    airQualityNormal(dest.coords, month),
  ]);

  if (duration.status === "fulfilled" && duration.value) {
    quote.liveDuration = duration.value;
  }
  if (hotel.status === "fulfilled" && hotel.value) {
    quote.hotelNightlyDuo = hotel.value.nightlyDuo;
    quote.hotelName = hotel.value.hotelName;
    quote.hotelLive = true;
  }
  if (climate.status === "fulfilled" && climate.value) {
    quote.climateAvgMaxC = climate.value.avgMaxC;
    quote.climateRainyDaysPct = climate.value.rainyDaysPct;
  }
  if (airQuality.status === "fulfilled" && airQuality.value != null) {
    quote.airQualityAvg = airQuality.value;
  }

  cache.set(key, { at: Date.now(), quote });
  return quote;
}
