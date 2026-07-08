import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { destinations } from "@/lib/destinations";
import { isOriginSlug, DEFAULT_ORIGIN } from "@/lib/origins";
import { getDictionary, isLocale, LOCALES, type Locale } from "@/lib/i18n/dictionaries";
import { DestinationBudget } from "@/components/DestinationBudget";
import { DisruptionBanner } from "@/components/DisruptionBanner";
import { HolidayBanner } from "@/components/HolidayBanner";
import { JsonLd } from "@/components/JsonLd";
import { destinationJsonLd } from "@/lib/jsonld";
import { wikipediaUrl } from "@/lib/links";

const MONTH_NAMES: Record<Locale, string[]> = {
  fr: ["janv.", "févr.", "mars", "avril", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
  en: ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."],
};

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => destinations.map((d) => ({ lang, slug: d.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const lang = isLocale(rawLang) ? rawLang : "fr";
  const dest = destinations.find((d) => d.slug === slug);
  if (!dest) return {};
  const description =
    lang === "fr"
      ? `${dest.tagline} Budget réel train + logement + repas depuis Paris, Lyon, Lille, Marseille ou Bordeaux.`
      : `${dest.tagline} Real train + lodging + food budget from Paris, Lyon, Lille, Marseille or Bordeaux.`;
  return {
    title: dest.name,
    description,
    openGraph: { title: dest.name, description },
    twitter: { title: dest.name, description },
  };
}

export default async function DestinationPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang: rawLang, slug } = await params;
  if (!isLocale(rawLang)) notFound();
  const lang: Locale = rawLang;
  const dict = getDictionary(lang);
  const monthNames = MONTH_NAMES[lang];

  const sp = await searchParams;
  const dest = destinations.find((d) => d.slug === slug);
  if (!dest) notFound();

  const o = typeof sp.o === "string" && isOriginSlug(sp.o) ? sp.o : DEFAULT_ORIGIN;
  const n = Number(sp.n);
  const nights = Number.isInteger(n) && n >= 1 && n <= 14 ? n : 4;
  const t = Number(sp.t);
  const travelers = Number.isInteger(t) && t >= 1 && t <= 8 ? t : null;
  const m = Number(sp.m);
  const month = Number.isInteger(m) && m >= 1 && m <= 12 ? m : null;
  const startDate =
    typeof sp.d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.d) ? sp.d : null;

  const description =
    lang === "fr"
      ? `${dest.tagline} Budget réel train + logement + repas depuis Paris, Lyon, Lille, Marseille ou Bordeaux.`
      : `${dest.tagline} Real train + lodging + food budget from Paris, Lyon, Lille, Marseille or Bordeaux.`;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-24">
      <JsonLd data={destinationJsonLd(dest, lang, description)} />
      <nav className="pt-6">
        <Link
          href={`/${lang}`}
          className="font-mono text-xs font-semibold uppercase tracking-widest text-inksoft transition-colors hover:text-ink"
        >
          {dict.destinationPage.back}
        </Link>
      </nav>

      <div className="pt-6">
        <DisruptionBanner destSlug={dest.slug} origin={o} month={month} startDate={startDate} />
        <HolidayBanner month={month} startDate={startDate} nights={nights} />
      </div>

      {/* Hero */}
      <header className="grid gap-6 pt-8 md:grid-cols-2 md:items-end">
        <div>
          <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.35em] text-maree">
            {dest.code} · {dest.region}
          </p>
          <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl">
            {dest.name}
          </h1>
          <p className="mt-4 max-w-md text-lg text-inksoft">{dest.tagline}</p>
          <p className="mt-4 flex flex-wrap gap-1.5">
            {dest.bestMonths.map((m) => (
              <span
                key={m}
                className="rounded-full bg-maree/10 px-2.5 py-1 font-mono text-xs font-semibold text-maree"
              >
                {monthNames[m - 1]}
              </span>
            ))}
          </p>
        </div>
        <div className="relative h-64 overflow-hidden rounded-3xl md:h-80">
          <Image
            src={`/img/${dest.slug}.jpg`}
            alt={`${dest.name}, ${dest.region}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </header>

      {/* Incontournables */}
      <section className="pt-10">
        <h2 className="mb-3 font-display text-2xl font-bold">{dict.destinationPage.highlights}</h2>
        <ul className="grid gap-2 sm:grid-cols-3">
          {dest.highlights.map((h) => (
            <li
              key={h}
              className="rounded-2xl border border-line bg-card px-4 py-3 text-sm"
            >
              <span aria-hidden className="mr-2 text-maree">✳</span>
              {h}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-inksoft">
          <span className="font-semibold text-ink">{dict.destinationPage.duoTip}</span> {dest.duoTip}
        </p>
        <a
          href={wikipediaUrl(dest)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block font-mono text-xs font-semibold uppercase tracking-widest text-inksoft transition-colors hover:text-maree"
        >
          {dict.destinationPage.wikipedia}
        </a>
      </section>

      {/* Activités + budget interactif */}
      <section className="pt-10">
        <DestinationBudget
          dest={dest}
          initialOrigin={o}
          initialNights={nights}
          initialTravelers={travelers}
        />
      </section>
    </main>
  );
}
