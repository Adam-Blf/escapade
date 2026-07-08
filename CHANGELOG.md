# Changelog

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).
Versions alignées sur `package.json`.

## 0.6.2

- Lien "En savoir plus sur Wikipédia ↗" (`lib/links.ts` → `wikipediaUrl`)
  sur chaque page destination. Zéro appel API : juste une URL stable
  vers `fr.wikipedia.org`, cohérent avec le pattern zéro-coût des
  autres deep-links (Trainline, Booking, HostelWorld). Volontairement
  pas de fetch live du résumé Wikipédia : le contenu éditorial des
  destinations est déjà écrit à la main (ton "budget étudiant"), un
  extrait encyclopédique générique irait contre ce choix.
- SNCF open-data (gares) évalué et écarté : le dataset public ne
  contient pas d'info accessibilité PMR (vérifié empiriquement), et
  les seules coordonnées qu'il expose sont déjà curées à la main pour
  les 5 gares d'origine.

## 0.6.1

- Indice de qualité de l'air (`lib/providers/openmeteo.ts` → `airQualityNormal`) :
  EAQI moyenné sur les 3 dernières années pour le mois demandé, via
  l'archive historique Open-Meteo Air Quality (gratuite, sans clé,
  confirmée dispo dès 2013). Nouveau champ `airQualityAvg` sur
  `PriceQuote`, badge "IQA XX" sur les cartes résultat à côté du
  climat. Même limite honnête que la normale climatique : une
  moyenne statistique, pas une prévision.

## 0.6.0

- Alerte jours fériés (`lib/providers/joursFeries.ts`) : API officielle
  gratuite `calendrier.api.gouv.fr` (sans clé, un seul fichier JSON
  couvrant 2006-2031). Signale sur la page destination si le séjour
  chevauche un jour férié France métropole, prix train/hébergement
  souvent plus élevés à ces dates. Nouvelle route `/api/holidays`,
  composant `HolidayBanner.tsx` (silencieux par défaut, même pattern
  que `DisruptionBanner`).

## 0.5.8

- Fix budget honnête : un groupe de 3 à 8 voyageurs (`t=3..8`) affichait
  encore les cartes "Solo" et "À deux", jamais son vrai coût de groupe
  (`totalPP`/`totalGroup` existaient déjà côté `lib/engine.ts` mais
  n'étaient rendus nulle part). `TicketCard.tsx` affiche désormais une
  3e carte "À N, par pers." + total groupe quand `travelers >= 3`. Le
  chip récapitulatif de `Planner.tsx` disait aussi "solo ou à deux"
  pour ces groupes ; corrigé pour afficher "à N".

## 0.5.7

- `CONTRIBUTING.md` : workflow PR-first, checklist de vérification,
  invariants du catalogue destinations, pointeur vers les ADR.
- `.github/PULL_REQUEST_TEMPLATE.md` : checklist tests/version/docs.
- `docs/adr/0001-csp-sans-nonce.md` : premier ADR, documente le choix
  CSP sans nonce (`'unsafe-inline'` assumé) pour préserver la
  génération statique — contexte, alternative rejetée, conséquences.
- `docs/ARCHITECTURE.md` mis à jour : chemins icônes corrigés
  (déplacés sous `[lang]` en 0.5.2), modules `co2.ts`/`surprise.ts`/
  `jsonld.ts` documentés, section CI/sécurité ajoutée.

## 0.5.6

- Coverage tests (`@vitest/coverage-v8`) + 44 tests ajoutés sur des
  trous réels : `lib/prices.ts` (orchestration + cache, 0% → couvert),
  `lib/providers/amadeus.ts` (0% → couvert, incl. cache token isolé
  entre tests via `vi.resetModules`), `lib/providers/navitia.ts`
  (durées de trajet), `lib/i18n/dictionaries.ts`, `lib/origins.ts`
  (fallback), `lib/links.ts` (`searchShareUrl`), `lib/recent.ts`
  (JSON corrompu), `lib/rateLimit.ts` (purge paresseuse), et un test
  d'intégrité du catalogue `lib/destinations.ts` qui encode les règles
  documentées dans CLAUDE.md (≥4 activités, 5 origines, pas
  d'auto-liaison marseille/lyon/lille). 79,7% → 97,1% de couverture
  statements sur `lib/`.

## 0.5.5

- Dependabot (`.github/dependabot.yml`) : mises à jour hebdo npm
  (groupées dev-deps mineures/patch) + github-actions.
- Job `secrets-scan` (gitleaks) ajouté à la CI, en informatif (pas
  encore required check, le temps de valider qu'il ne remonte pas de
  faux positifs sur l'historique).

## 0.5.4

- En-têtes de sécurité HTTP (`next.config.ts` → `headers()`) : CSP,
  HSTS (preload), `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`. CSP sans nonce (documenté
  en commentaire) pour préserver la génération statique · testé en
  prod build + Playwright (thème, images, JSON-LD), zéro violation
  CSP en console.

## 0.5.3

- CI GitHub Actions (`.github/workflows/ci.yml`) : tests, type-check,
  lint et build lancés sur chaque PR et push sur `main`, en jobs
  parallèles. À activer en required check dans les réglages GitHub du
  repo pour bloquer les merges rouges.

## 0.5.2

- JSON-LD structuré (`lib/jsonld.ts`) : schema `WebSite` sur la home,
  `TouristAttraction` (géo, image, région) sur chaque page destination.
  Échappement défensif des `<` pour éviter toute fermeture prématurée du
  `<script>` (`safeJsonLd`).
- `metadataBase` corrigé : `icon.tsx` / `apple-icon.tsx` /
  `opengraph-image.tsx` déplacés sous `app/[lang]/` pour hériter du
  domaine de prod (auparavant résolus vers `localhost:3000`).

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
