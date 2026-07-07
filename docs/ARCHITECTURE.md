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
  │    ├─ navitia.ts     durée réelle de trajet (SNCF, env-gated)
  │    └─ amadeus.ts     prix hôtel live (env-gated)
  ├─ links.ts            deep-links de réservation (Trainline, Booking, HostelWorld)
  ├─ share.ts            Criteria ↔ query params, assainissement des entrées
  ├─ recent.ts           historique des recherches (localStorage, client-only)
  ├─ compare.ts           sélection de destinations à comparer (toggle, limite à 3)
  ├─ theme.ts             thème clair/sombre manuel (script anti-flash, localStorage)
  ├─ site.ts              constantes du site (nom, URL) pour metadata/sitemap
  ├─ useLiveQuote.ts     hook consommant /api/prices pour un ticket donné
  └─ version.ts          version applicative (importée depuis package.json)

components/       UI pure, consomme lib/
  ├─ Planner.tsx          orchestrateur de recherche (mode texte / critères, état de session)
  ├─ CriteriaForm.tsx      mode critères
  ├─ TicketCard.tsx        carte résultat + actions de réservation/partage
  ├─ Comparator.tsx        modal de comparaison de 2-3 destinations
  ├─ DestinationBudget.tsx budget interactif de la page détail
  ├─ DonateButton.tsx      lien Payment Link Stripe, masqué si non configuré
  └─ ThemeToggle.tsx       bascule clair/sombre manuelle

app/              routing Next.js App Router
  ├─ page.tsx                page d'accueil (monte <Planner />)
  ├─ destination/[slug]/page.tsx  page détail (generateStaticParams + metadata par page)
  ├─ soutenir/page.tsx       page don
  ├─ api/prices/route.ts    endpoint de devis temps réel (utilisé par useLiveQuote)
  ├─ sitemap.ts / robots.ts  SEO
  ├─ manifest.ts             PWA
  └─ icon.tsx / apple-icon.tsx / opengraph-image.tsx / icon-192 / icon-512
                             icônes et image OG générées au build (next/og, zéro asset binaire)
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
