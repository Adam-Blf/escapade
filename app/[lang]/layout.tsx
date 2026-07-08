import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Bricolage_Grotesque, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { NO_FLASH_SCRIPT } from "@/lib/theme";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n/dictionaries";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import "../globals.css";

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

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

const TITLES: Record<Locale, string> = {
  fr: `${SITE_NAME}, trouve où partir`,
  en: `${SITE_NAME}, find where to go`,
};

const DESCRIPTIONS: Record<Locale, string> = {
  fr: "Décris ton envie de vacances en une phrase ou coche tes critères : Escapade classe les destinations et calcule le budget réel au départ de Paris, Lyon, Lille, Marseille ou Bordeaux, seul ou à deux.",
  en: "Describe the trip you want in one sentence, or pick your criteria: Escapade ranks destinations and works out the real budget departing from Paris, Lyon, Lille, Marseille or Bordeaux, solo or as a couple.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "fr";
  const title = TITLES[lang];
  const description = DESCRIPTIONS[lang];
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s · ${SITE_NAME}` },
    description,
    keywords:
      lang === "fr"
        ? ["vacances pas cher", "voyage étudiant", "week-end pas cher train", "budget vacances", "escapade France", "voyage petit budget"]
        : ["cheap vacation", "student travel", "cheap weekend by train", "travel budget", "budget trip"],
    applicationName: SITE_NAME,
    alternates: {
      canonical: `${SITE_URL}/${lang}`,
      languages: { fr: `${SITE_URL}/fr`, en: `${SITE_URL}/en` },
    },
    openGraph: {
      type: "website",
      locale: lang === "fr" ? "fr_FR" : "en_US",
      siteName: SITE_NAME,
      title,
      description,
      url: `${SITE_URL}/${lang}`,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang: Locale = raw;

  return (
    <html
      lang={lang}
      className={`${bricolage.variable} ${instrument.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Script
          id="theme-no-flash"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }}
        />
        <LocaleProvider lang={lang}>{children}</LocaleProvider>
        <Analytics />
      </body>
    </html>
  );
}
