# Changelog

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).
Versions alignées sur `package.json`.

## 0.3.0

- Comparateur : sélection de 2 à 3 destinations depuis les résultats,
  affichées côte à côte (budget, transport, mois, highlights).
- Don optionnel via Payment Link Stripe (`DonateButton`, zéro backend,
  masqué si `NEXT_PUBLIC_STRIPE_DONATION_URL` n'est pas configuré) et page
  `/soutenir`.
- SEO complet : metadata (title template, OpenGraph, Twitter card),
  `sitemap.ts`, `robots.ts`, icônes/OG générées dynamiquement via `next/og`
  (zéro asset binaire). Manifest PWA installable. Vercel Analytics.
- Dark mode manuel : bascule persistée (localStorage) qui gagne sur
  `prefers-color-scheme` dans les deux sens, script anti-flash exécuté
  avant le premier paint.

## 0.2.0

- Pages détail par destination (`/destination/[slug]`) avec budget interactif
  (ville de départ, nuits, solo/duo, sélection d'activités) et catalogue
  d'activités curatées par destination.
- Tickets actionnables : deep-links Trainline / Booking / HostelWorld,
  partage (Web Share API avec repli copie de lien).
- Recherche partageable par URL (query params courts et assainis) et
  dernières recherches en local (localStorage).
- Parsing FR enrichi : saisons, "long week-end", nouveaux synonymes
  d'envies (surf, calanques, treks...). Profil de groupe désormais exploité
  par le moteur de scoring (étudiant, enfants, mobilité réduite, calme,
  fête) avec conseils ciblés affichés.
- Prix temps réel best-effort : durée réelle du trajet via l'API SNCF
  (Navitia) et chambre double la moins chère via Amadeus Self-Service,
  toutes deux env-gated avec repli catalogue silencieux.
- Départs multi-villes : Paris, Lyon, Lille, Marseille, Bordeaux, chacune
  avec sa propre matrice de transport vers les 18 destinations.
- Fondation de tests : Vitest, couverture de `lib/parse.ts` et
  `lib/engine.ts` puis de chaque module métier ajouté depuis.

## 0.1.0

- MVP : mode langage naturel et mode critères, moteur de scoring budget,
  catalogue de 18 destinations au départ de Paris, cards façon billet de
  train, dark mode.
