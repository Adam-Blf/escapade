import { destinations } from "./destinations";
import { getOrigin } from "./origins";
import { addNights, checkinDate, toISODate } from "./dates";
import { amadeusAvailable, cheapestDouble } from "./providers/amadeus";
import { bestJourneyDuration, navitiaAvailable } from "./providers/navitia";
import type { OriginSlug, PriceQuote } from "./types";

/**
 * Devis temps réel, contrainte zéro coût :
 *  - train · aucune API prix gratuite n'existe (SNCF ne les expose pas), le
 *    prix reste catalogue MAIS la durée passe en live via Navitia (clé gratuite,
 *    5000 req/j) dès que SNCF_API_KEY est présente ;
 *  - hôtel · chambre double la moins chère via Amadeus Self-Service test
 *    (gratuit) dès que AMADEUS_CLIENT_ID/SECRET sont présentes ;
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
  nights = 4
): Promise<PriceQuote | null> {
  const dest = destinations.find((d) => d.slug === slug);
  const transport = dest?.transports[origin];
  if (!dest || !transport) return null;

  const key = `${slug}|${origin}|${month ?? "x"}|${nights}`;
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
  };

  const checkin = checkinDate(month);
  const checkout = addNights(checkin, nights);

  const [duration, hotel] = await Promise.allSettled([
    navitiaAvailable()
      ? bestJourneyDuration(getOrigin(origin).coords, dest.coords, checkin)
      : Promise.resolve(null),
    amadeusAvailable()
      ? cheapestDouble(dest.coords, toISODate(checkin), toISODate(checkout))
      : Promise.resolve(null),
  ]);

  if (duration.status === "fulfilled" && duration.value) {
    quote.liveDuration = duration.value;
  }
  if (hotel.status === "fulfilled" && hotel.value) {
    quote.hotelNightlyDuo = hotel.value.nightlyDuo;
    quote.hotelName = hotel.value.hotelName;
    quote.hotelLive = true;
  }

  cache.set(key, { at: Date.now(), quote });
  return quote;
}
