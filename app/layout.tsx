import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-plex",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}, trouve où partir`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Décris ton envie de vacances en une phrase ou coche tes critères : Escapade classe les destinations et calcule le budget réel au départ de Paris, Lyon, Lille, Marseille ou Bordeaux, seul ou à deux.",
  keywords: [
    "vacances pas cher",
    "voyage étudiant",
    "week-end pas cher train",
    "budget vacances",
    "escapade France",
    "voyage petit budget",
  ],
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: SITE_NAME,
    title: `${SITE_NAME}, trouve où partir`,
    description:
      "Budget réel train + logement + repas, calculé en une phrase ou trois cases à cocher.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME}, trouve où partir`,
    description: "Le budget réel de tes prochaines vacances, en une phrase.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${bricolage.variable} ${instrument.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
