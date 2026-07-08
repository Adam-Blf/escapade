import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DonateButton } from "@/components/DonateButton";
import { isLocale, type Locale } from "@/lib/i18n/dictionaries";

const COPY: Record<
  Locale,
  { title: string; description: string; p1: string; p2: string; notReady: string; back: string }
> = {
  fr: {
    title: "Soutenir Escapade",
    description:
      "Escapade est gratuit et sans commission. Un don, si tu veux, aide à garder le projet en vie.",
    p1: "Escapade est gratuit, sans compte et sans commission sur les liens de réservation : chaque train, hôtel ou auberge que tu réserves via le site rapporte zéro euro à qui que ce soit ici.",
    p2: "Le catalogue de destinations, les prix indicatifs et les devis en temps réel sont tenus à jour à la main. Si le site t'a fait gagner du temps ou trouver un bon plan, un don libre aide à couvrir l'hébergement du site et le temps passé dessus.",
    notReady: "Le don en ligne n'est pas encore configuré, repasse bientôt.",
    back: "← Retour à la recherche",
  },
  en: {
    title: "Support Escapade",
    description:
      "Escapade is free with no commission. A donation, if you'd like, helps keep the project alive.",
    p1: "Escapade is free, no account needed, no commission on booking links: every train, hotel or hostel you book through the site earns nobody here a single euro.",
    p2: "The destination catalogue, indicative prices and live quotes are kept up to date by hand. If the site saved you time or found you a good deal, a free-amount donation helps cover hosting and the time spent on it.",
    notReady: "Online donations aren't set up yet — check back soon.",
    back: "← Back to search",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "fr";
  const { title, description } = COPY[lang];
  return { title, description };
}

export default async function SoutenirPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang: Locale = raw;
  const c = COPY[lang];
  const url = process.env.NEXT_PUBLIC_STRIPE_DONATION_URL;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-16">
      <nav>
        <Link
          href={`/${lang}`}
          className="font-mono text-xs font-semibold uppercase tracking-widest text-inksoft transition-colors hover:text-ink"
        >
          {c.back}
        </Link>
      </nav>

      <h1 className="mt-8 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
        {c.title}
      </h1>

      <div className="mt-6 space-y-4 text-lg leading-relaxed text-inksoft">
        <p>{c.p1}</p>
        <p>{c.p2}</p>
      </div>

      <div className="mt-8">
        {url ? (
          <DonateButton className="px-6 py-3 text-sm" />
        ) : (
          <p className="rounded-2xl border border-line bg-card px-4 py-3 text-sm text-inksoft">
            {c.notReady}
          </p>
        )}
      </div>
    </main>
  );
}
