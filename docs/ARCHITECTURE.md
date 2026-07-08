# Architecture

## Principe

La logique métier vit exclusivement dans `lib/`. Les composants React ne
calculent rien : ils appellent `lib/` et affichent le résultat. `app/`
n'orchestre que le routing et le rendu serveur.

```
lib/            source de vérité, testée en isolation (tests/*.test.ts)
  ├─ types.ts         types partagés (Criteria, Destination, Result, PriceQuote...)
  ├─ origins.ts        villes de départ desservies (paris|lyon|lille|marseille|bordeaux)
  ├─ destinations.ts    catalogue des 24 destinations (France + Europe proche), matrice de transport par origine
  ├─ activities.ts      activités curatées par destination
  ├─ engine.ts          estimate() + rank() : scoring pur, sans effet de bord
  ├─ parse.ts           texte libre FR → Criteria (regex, aucun appel réseau)
  ├─ profile.ts         signaux de groupe extraits du profil libre → ajustement de score + conseils
  ├─ dates.ts            dates de check-in/out déduites du mois demandé
  ├─ prices.ts           orchestrateur de devis temps réel (voir providers/)
  ├─ providers/
  │    ├─ navitia.ts     durée réelle de trajet + perturbations (SNCF, env-gated)
  │    ├─ amadeus.ts     prix hôtel live (env-gated)
  │    ├─ openmeteo.ts   normale climatique du mois (gratuit, sans clé, toujours actif)
  │    └─ joursFeries.ts jours fériés France métropole (gratuit, sans clé, calendrier.api.gouv.fr)
  ├─ links.ts            deep-links de réservation (Trainline, Booking, HostelWorld)
  ├─ share.ts            Criteria ↔ query params, assainissement des entrées
  ├─ recent.ts           historique des recherches (localStorage, client-only)
  ├─ compare.ts           sélection de destinations à comparer (toggle, limite à 3)
  ├─ co2.ts                distance haversine + comparatif CO2 train/voiture/avion
  ├─ surprise.ts           génère des critères aléatoires ("surprends-moi")
  ├─ jsonld.ts             builders schema.org (WebSite, TouristAttraction)
  ├─ theme.ts             thème clair/sombre manuel (script anti-flash, localStorage)
  ├─ site.ts              constantes du site (nom, URL) pour metadata/sitemap
  ├─ i18n/
  │    ├─ dictionaries.ts  dictionnaires FR/EN (coquille UI uniquement, pas le contenu éditorial)
  │    └─ LocaleProvider.tsx contexte React (lang, dict) posé par app/[lang]/layout.tsx
  ├─ useLiveQuote.ts     hook consommant /api/prices pour un ticket donné
  └─ version.ts          version applicative (importée depuis package.json)

components/       UI pure, consomme lib/
  ├─ Planner.tsx          orchestrateur de recherche (mode texte / critères, état de session)
  ├─ CriteriaForm.tsx      mode critères
  ├─ TicketCard.tsx        carte résultat + actions de réservation/partage
  ├─ Comparator.tsx        modal de comparaison de 2-3 destinations
  ├─ DestinationBudget.tsx budget interactif de la page détail
  ├─ DonateButton.tsx      lien Payment Link Stripe, masqué si non configuré
  ├─ DisruptionBanner.tsx  perturbations SNCF actives sur la liaison (silencieux par défaut)
  ├─ HolidayBanner.tsx     jour férié pendant le séjour (silencieux par défaut)
  ├─ JsonLd.tsx             rend un <script type="application/ld+json"> échappé
  ├─ ThemeToggle.tsx       bascule clair/sombre manuelle
  └─ LangSwitcher.tsx      bascule FR/EN, conserve le chemin courant

app/              routing Next.js App Router
  ├─ [lang]/                 tout ce qui est visitable est sous un préfixe de langue (fr|en)
  │    ├─ layout.tsx          root layout réel (html/body, fonts, LocaleProvider, generateStaticParams,
  │    │                       metadataBase — voir docs/adr/0001-csp-sans-nonce.md pour le contexte sécu)
  │    ├─ page.tsx            page d'accueil (monte <Planner />, JSON-LD WebSite)
  │    ├─ destination/[slug]/page.tsx  page détail (generateStaticParams × langues, JSON-LD TouristAttraction)
  │    ├─ soutenir/page.tsx   page don
  │    └─ icon.tsx / apple-icon.tsx / opengraph-image.tsx
  │                           icônes et image OG (next/og). Doivent rester sous [lang] pour hériter du
  │                           metadataBase du layout — les sortir de ce dossier fait retomber og:image
  │                           sur localhost:3000 en prod (bug réel corrigé, pas théorique).
  ├─ api/prices/route.ts    endpoint de devis temps réel (utilisé par useLiveQuote), hors [lang]
  ├─ api/disruptions/route.ts perturbations SNCF live, hors [lang]
  ├─ api/holidays/route.ts  jours fériés France sur la période du séjour, hors [lang]
  ├─ sitemap.ts / robots.ts  SEO, génère les URLs pour chaque langue
  ├─ manifest.ts             PWA (icon-192 / icon-512, hors [lang] : le manifeste n'est pas localisé)
  └─ not-found.tsx           404 sur le thème aviation

.github/          CI et hygiène du repo
  ├─ workflows/ci.yml       tests + tsc + eslint + build + gitleaks, required checks sur main
  └─ dependabot.yml         mises à jour hebdo npm + github-actions

next.config.ts    en-têtes de sécurité (CSP, HSTS, etc.) — voir docs/adr/

proxy.ts          détecte la langue préférée (Accept-Language) et redirige
                  "/" vers "/fr" ou "/en". Le matcher EXCLUT tout chemin
                  avec une extension de fichier (assets sous public/) —
                  piège rencontré : sans cette exclusion, /img/*.jpg était
                  redirigé vers un chemin préfixé inexistant.
```

## Flux de données

1. L'utilisateur saisit du texte libre ou des critères → `parseText()` ou le
   formulaire produisent un objet `Criteria`.
2. `rank(criteria)` (dans `engine.ts`) calcule un `Estimate` par destination
   atteignable depuis l'origine choisie, et trie par score (envies, budget,
   saisonnalité, signaux de groupe via `profile.ts`).
3. Les `Result[]` sont rendus par `TicketCard`. Chaque carte interroge en
   parallèle `/api/prices` (via `useLiveQuote`) pour tenter d'enrichir la
   durée et le prix hôtel avec des données live ; en cas d'échec ou
   d'absence de clé, l'affichage catalogue reste inchangé.
4. La recherche est sérialisée dans l'URL (`share.ts`) et dans le
   `localStorage` (`recent.ts`) pour être partagée ou reprise.

## Pourquoi ce découpage

- **Testabilité** · tout ce qui décide (parsing, scoring, assainissement,
  génération de liens) est une fonction pure dans `lib/`, testée sans DOM ni
  réseau.
- **Zéro coût par construction** · les seuls points d'intégration externe
  (`providers/`) sont isolés, optionnels par design (`available()` vérifie
  la présence de clés gratuites) et n'ont aucun chemin qui échoue l'app si
  absents.
- **Next.js 16** · `params` et `searchParams` sont des `Promise` dans les
  Server Components (App Router) ; voir `node_modules/next/dist/docs/`
  avant de modifier `app/`.
