/**
 * Lien vers le Payment Link Stripe créé manuellement dans le dashboard
 * (aucun backend, aucun webhook). Masqué tant que l'URL n'est pas configurée
 * en prod : jamais de lien mort.
 */
export function DonateButton({ className = "" }: { className?: string }) {
  const url = process.env.NEXT_PUBLIC_STRIPE_DONATION_URL;
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-inksoft transition-colors hover:border-corail hover:text-corail ${className}`}
    >
      Soutenir le projet ↗
    </a>
  );
}
