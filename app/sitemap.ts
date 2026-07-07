import type { MetadataRoute } from "next";
import { destinations } from "@/lib/destinations";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...destinations.map((d) => ({
      url: `${SITE_URL}/destination/${d.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
