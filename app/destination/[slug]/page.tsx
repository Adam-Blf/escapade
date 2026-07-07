import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { destinations } from "@/lib/destinations";
import { isOriginSlug, DEFAULT_ORIGIN } from "@/lib/origins";
import { DestinationBudget } from "@/components/DestinationBudget";
import { DisruptionBanner } from "@/components/DisruptionBanner";

const MONTH_NAMES = [
  "janv.", "févr.", "mars", "avril", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dest = destinations.find((d) => d.slug === slug);
  if (!dest) return {};
  const description = `${dest.tagline} Budget réel train + logement + repas depuis Paris, Lyon, Lille, Marseille ou Bordeaux.`;
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
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
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

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-24">
      <nav className="pt-6">
        <Link
          href="/"
          className="font-mono text-xs font-semibold uppercase tracking-widest text-inksoft transition-colors hover:text-ink"
        >
          ← Retour à la recherche
        </Link>
      </nav>

      <div className="pt-6">
        <DisruptionBanner destSlug={dest.slug} origin={o} month={month} />
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
                {MONTH_NAMES[m - 1]}
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
        <h2 className="mb-3 font-display text-2xl font-bold">Les incontournables</h2>
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
          <span className="font-semibold text-ink">Le bon plan à deux ·</span> {dest.duoTip}
        </p>
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
