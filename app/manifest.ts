import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME}, trouve où partir`,
    short_name: SITE_NAME,
    description:
      "Décris ton envie de vacances en une phrase ou coche tes critères : budget réel, seul ou à deux.",
    start_url: "/",
    display: "standalone",
    background_color: "#edf2ef",
    theme_color: "#0e6d68",
    lang: "fr",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
