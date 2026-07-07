@AGENTS.md

# CLAUDE.md · Escapade

Planificateur de vacances budget honnête, cible étudiants. Next.js 16 App
Router + Tailwind 4 + framer-motion. Prod sur Vercel (hobby) +
`escapade.beloucif.com`.

## Contrainte n°1 · zéro coût

Aucune dépendance payante, jamais. Toute intégration externe suit le pattern
**env-gated free tier + fallback local** ·
- clés absentes → catalogue statique, l'app marche à 100%
- clés présentes (gratuites · Navitia 5000 req/j, Amadeus sandbox) → données
  live, cache mémoire 12h pour protéger les quotas (`lib/prices.ts`)
- deep-links de résa (Trainline, Booking, HostelWorld) plutôt qu'APIs de
  booking · zéro commission, zéro clé (`lib/links.ts`)
- pas d'API prix train gratuite : le prix train reste catalogue, on ne ment
  pas à l'utilisateur (mention « indicatif » affichée)

## Architecture · la logique métier vit dans lib/, jamais dans les composants

```
lib/types.ts        source de vérité des types (Criteria, Destination, Result…)
lib/destinations.ts catalogue 24 destinations × 5 origines (matrice transports,
                    18 françaises + Europe proche en train direct)
lib/origins.ts      villes de départ (paris|lyon|lille|marseille|bordeaux)
lib/engine.ts       estimate() + rank() · scoring pur, testable sans DOM
lib/parse.ts        texte libre FR → Criteria (regex, pas de LLM · gratuit)
lib/profile.ts      signaux groupe (étudiant/enfants/PMR/fête/calme) → tips + score
lib/prices.ts       orchestrateur devis live (providers/ env-gated)
lib/share.ts        Criteria ↔ query params (o/b/t/v/m/n/p), input hostile assaini
lib/activities.ts   activités curatées par destination (≥4, dont ≥1 gratuite)
components/         UI pure · consomme lib/, ne calcule rien
```

Toute nouvelle feature suit ce découpage · d'abord le module lib/ + ses tests,
ensuite le câblage UI.

## Méthode de travail

1. **Décomposer en tâches PR-métrisables** · une feature = une branche
   `feat/*` = une PR squash-mergée aussitôt verte. Jamais de commit sur main.
2. **TDD sur le métier** · parse, engine, profile, share, links, dates ont
   chacun leur `tests/*.test.ts`. Un bug de parsing = d'abord le test qui le
   reproduit. `npx vitest run` doit rester vert à chaque commit.
3. **Vérifier avant de merger** · `vitest run` + `tsc --noEmit` + `eslint` +
   `next build`. Les quatre, systématiquement.
4. **Données curatées > données inventées** · les prix du catalogue sont des
   estimations résa anticipée réalistes (Ouigo dès 19€, Nomad -50% pour -26
   ans). Toute nouvelle destination exige la matrice transports 5 origines +
   coords + ≥4 activités.
5. **Next 16** · lire `node_modules/next/dist/docs/` avant d'utiliser une API
   du framework (params/searchParams sont des Promise, lint interdit setState
   sync dans les effects → état keyé ou callback rAF).

## Standards

- **Langue** · UI et contenus en FR, code/commits/branches en EN impératif
  court (`feat: …`, `fix: …`), pas de point final, < 72 chars.
- **Identité git** · `Adam Beloucif <adam.beloucif@efrei.net>`. Aucune mention
  d'outil IA nulle part (commits, PR, code).
- **Typographie FR** · médiopoint `·`, jamais de tirets longs.
- **Sécurité** · tout input URL/texte assaini (`share.ts` = référence),
  liens externes `rel="noopener noreferrer"`, secrets uniquement en env
  (`.env.example` documente, `.gitignore` blinde).
- **Design** · style aviation / boarding pass (codes IATA, mono, ligne
  perforée), inspiration supahero.io, palette : `maree`, `corail`, `sable`,
  `ink`, `paper`. Dark mode obligatoire. framer-motion sur toute transition,
  `MotionConfig reducedMotion="user"`.
- **Versioning** · bump `package.json` à chaque feature, version affichée via
  `lib/version.ts` (import du package.json), jamais en dur dans le JSX.

## Pièges connus

- `\b` en fin de motif regex FR bloque les pluriels (« étudiantes ») ·
  toujours tester singulier + pluriel.
- « mais » contient « mai » · les noms de mois exigent `\b…\b` après
  normalisation NFD.
- Une destination ne doit jamais être proposée depuis elle-même
  (`reachableFrom` filtre `slug !== origin`).
- Vitest requiert l'alias `@` dans `vitest.config.ts` (pas hérité de
  tsconfig).
