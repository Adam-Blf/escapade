import type { Destination } from "./types";
import type { Locale } from "./i18n/dictionaries";
import { SITE_NAME, SITE_URL } from "./site";

/**
 * Échappe les séquences pouvant clore prématurément un <script> parent
 * lors du rendu de JSON.stringify dans du HTML.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function websiteJsonLd(lang: Locale, title: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}/${lang}`,
    description,
    inLanguage: lang,
    headline: title,
  };
}

export function destinationJsonLd(dest: Destination, lang: Locale, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: dest.name,
    description,
    url: `${SITE_URL}/${lang}/destination/${dest.slug}`,
    image: `${SITE_URL}/img/${dest.slug}.jpg`,
    geo: {
      "@type": "GeoCoordinates",
      latitude: dest.coords.lat,
      longitude: dest.coords.lng,
    },
    address: {
      "@type": "PostalAddress",
      addressRegion: dest.region,
      addressCountry: "FR",
    },
    touristType: dest.vibes,
  };
}
