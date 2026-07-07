import type { Metadata } from "next";
import Link from "next/link";
import { DonateButton } from "@/components/DonateButton";

export const metadata: Metadata = {
  title: "Soutenir Escapade",
  description: "Escapade est gratuit et sans commission. Un don, si tu veux, aide à garder le projet en vie.",
};

export default function SoutenirPage() {
  const url = process.env.NEXT_PUBLIC_STRIPE_DONATION_URL;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-16">
      <nav>
        <Link
          href="/"
          className="font-mono text-xs font-semibold uppercase tracking-widest text-inksoft transition-colors hover:text-ink"
        >
          ← Retour à la recherche
        </Link>
      </nav>

      <h1 className="mt-8 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
        Soutenir Escapade
      </h1>

      <div className="mt-6 space-y-4 text-lg leading-relaxed text-inksoft">
        <p>
          Escapade est gratuit, sans compte et sans commission sur les liens de
          réservation : chaque train, hôtel ou auberge que tu réserves via le
          site rapporte zéro euro à qui que ce soit ici.
        </p>
        <p>
          Le catalogue de destinations, les prix indicatifs et les devis en
          temps réel sont tenus à jour à la main. Si le site t&apos;a fait
          gagner du temps ou trouver un bon plan, un don libre aide à couvrir
          l&apos;hébergement du site et le temps passé dessus.
        </p>
      </div>

      <div className="mt-8">
        {url ? (
          <DonateButton className="px-6 py-3 text-sm" />
        ) : (
          <p className="rounded-2xl border border-line bg-card px-4 py-3 text-sm text-inksoft">
            Le don en ligne n&apos;est pas encore configuré, repasse bientôt.
          </p>
        )}
      </div>
    </main>
  );
}
