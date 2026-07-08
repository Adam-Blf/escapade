# Changelog

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).
Versions alignées sur `package.json`.

## 0.5.1

- Page 404 personnalisée (`app/[lang]/not-found.tsx`), sur le thème
  aviation ("Vol détourné"), plus un filet de secours racine pour un
  segment de langue invalide.
- Bouton "Je ne sais pas, surprends-moi" en mode texte : génère des
  critères aléatoires raisonnables (`lib/surprise.ts`) pour qui n'a pas
  d'idée précise.
- Correction : le script anti-flash du thème (inline dans `<script>`)
  déclenchait un warning React lors du rendu de la limite d'erreur
  not-found. Remplacé par `next/script` (`strategy="beforeInteractive"`),
  le pattern officiellement recommandé pour ce cas — confirmé propre en
  build de production.

## 0.5.0

- i18n FR/EN : routing par `app/[lang]/` (`proxy.ts` redirige `/` vers la
  langue préférée du navigateur), coquille UI entièrement traduite
  (Planner, formulaires, tickets, comparateur, pages destination/soutenir),
  sitemap et metadata par langue, sélecteur de langue dans le header. Le
  contenu éditorial des destinations (taglines, highlights, activités)
  reste en français dans les deux langues pour l'instant — traduction de
  contenu prévue comme chantier séparé.
- Correction : `proxy.ts` redirigeait aussi les assets statiques
  (`/img/*.jpg`) vers un chemin préfixé inexistant, cassant l'optimiseur
  d'image Next.js. Trouvé en QA visuelle avant merge.

## 0.4.0

- Europe proche : 6 nouvelles destinations accessibles en train direct depuis
  les 5 villes de départ existantes (Barcelone, Bruxelles, Amsterdam,
  Londres, Genève, Milan), même architecture zéro-coût. Catalogue à 24
  destinations.
- Date de départ exacte, en plus du mois flexible : sélecteur de date dans
  le mode critères, parsing en langage naturel ("le 12 août", "05/09"),
  utilisée pour affiner les durées Navitia, le prix hôtel Amadeus, la
  météo Open-Meteo et les perturbations SNCF.
- Style billet d'embarquement : code-barres décoratif et numéro de billet
  stable sur chaque ticket.
- Correction : le lien de réservation Trainline pointait vers une URL
  invalide (404) ; remplacé par le pattern réel vérifié manuellement.

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
