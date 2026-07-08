import type { MetadataRoute } from "next";
import { destinations } from "@/lib/destinations";
import { LOCALES } from "@/lib/i18n/dictionaries";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const lang of LOCALES) {
    entries.push({
      url: `${SITE_URL}/${lang}`,
      changeFrequency: "weekly",
      priority: 1,
    });
    for (const d of destinations) {
      entries.push({
        url: `${SITE_URL}/${lang}/destination/${d.slug}`,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }
  return entries;
}
