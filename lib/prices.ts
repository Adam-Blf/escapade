import { destinations } from "./destinations";
import type { PriceQuote } from "./types";

/**
 * Chaîne de providers de prix transport.
 * Les connecteurs live s'activent dès que leurs clés sont présentes en env,
 * sinon on retombe sur le catalogue local (prix indicatifs résa anticipée).
 */
interface PriceProvider {
  name: string;
  available: () => boolean;
  quote: (slug: string, month: number | null) => Promise<PriceQuote | null>;
}

/**
 * SNCF / Navitia (https://numerique.sncf.com/startup/api/) : horaires et
 * itinéraires. Les prix ne sont pas exposés publiquement par SNCF, ce
 * connecteur sert d'exemple d'intégration : il valide la desserte réelle.
 */
const navitiaProvider: PriceProvider = {
  name: "sncf-navitia",
  available: () => Boolean(process.env.SNCF_API_KEY),
  quote: async () => {
    // TODO(adam): brancher GET /coverage/sncf/journeys avec SNCF_API_KEY
    // pour valider durée et correspondances en temps réel.
    return null;
  },
};

/**
 * Amadeus Self-Service (https://developers.amadeus.com) : hôtels et vols.
 * Gratuit en sandbox, clés AMADEUS_CLIENT_ID / AMADEUS_CLIENT_SECRET.
 */
const amadeusProvider: PriceProvider = {
  name: "amadeus",
  available: () =>
    Boolean(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET),
  quote: async () => {
    // TODO(adam): OAuth2 client_credentials puis Hotel Search v3
    // pour remplacer lodging.dorm / lodging.duo par des prix live.
    return null;
  },
};

/** Catalogue local : toujours disponible, prix indicatifs. */
const staticProvider: PriceProvider = {
  name: "catalogue",
  available: () => true,
  quote: async (slug) => {
    const dest = destinations.find((d) => d.slug === slug);
    if (!dest) return null;
    return {
      dest: slug,
      transportAR: dest.transport.priceAR,
      source: "catalogue",
      live: false,
    };
  },
};

const providers: PriceProvider[] = [navitiaProvider, amadeusProvider, staticProvider];

export async function getQuote(
  slug: string,
  month: number | null
): Promise<PriceQuote | null> {
  for (const provider of providers) {
    if (!provider.available()) continue;
    try {
      const quote = await provider.quote(slug, month);
      if (quote) return quote;
    } catch {
      // provider en panne : on passe au suivant
    }
  }
  return null;
}
