# Contribuer à Escapade

Repo perso, mais le workflow est le même que sur un projet d'équipe : ça
force à ne rien casser en prod. Voir aussi [CLAUDE.md](CLAUDE.md) pour les
contraintes produit (zéro coût, catalogue vs live) et
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) pour le découpage du code.

## Workflow

1. **Jamais de commit direct sur `main`.** Une branche `feat/*` ou `fix/*`
   par changement.
2. **TDD sur le métier.** `parse`, `engine`, `profile`, `share`, `links`,
   `dates`, `prices`, `providers/*` ont chacun leur `tests/*.test.ts`. Un bug
   de parsing ou de scoring = d'abord le test qui le reproduit.
3. **Vérifier avant de pousser**, dans cet ordre :
   ```bash
   npx vitest run
   npx tsc --noEmit
   npx eslint .
   npx next build
   ```
   Les 4 doivent être verts. La CI (`.github/workflows/ci.yml`) les
   re-exécute et bloque le merge si l'un échoue — c'est un filet, pas un
   remplacement de la vérification locale.
4. **Une PR = une feature ou un fix terminé**, pas un fourre-tout. Bump
   `package.json::version` + entrée `CHANGELOG.md` dans la même PR dès que
   le changement est visible pour l'utilisateur ou touche l'infra
   (CI, sécurité, dépendances).
5. **`gh pr create` puis `gh pr merge --squash --delete-branch`** une fois
   les checks requis verts (Tests, Type check, Lint, Build, Secret scan).

## Nouvelle destination au catalogue

`lib/destinations.ts` a des invariants testés dans
`tests/destinations.test.ts` — toute nouvelle entrée doit respecter :

- matrice `transports` renseignée pour au moins une origine parmi
  `paris|lyon|lille|marseille|bordeaux`,
- coords `{ lat, lng }` valides,
- au moins 4 activités dans `lib/activities.ts` (clé = `slug`), dont au
  moins une gratuite,
- `bestMonths` non vide, valeurs 1-12,
- si le `slug` coïncide avec une ville de départ (ex. `lyon`, `lille`,
  `marseille`), ne pas ajouter cette ville dans ses propres `transports` —
  `reachableFrom()` (`lib/engine.ts`) l'exclut déjà côté logique, mais le
  test de catalogue vérifie aussi les données brutes.

## Décisions architecturales

Les choix non-évidents (compromis documentés, pas juste "pourquoi ce
fichier existe") vont dans `docs/adr/NNNN-titre.md`. Un ADR = contexte,
contrainte qui tranche, décision, conséquences assumées. Voir
[docs/adr/0001-csp-sans-nonce.md](docs/adr/0001-csp-sans-nonce.md) pour un
exemple.

## Sécurité

- Tout input externe (query params, texte libre) passe par une validation
  explicite — voir `lib/share.ts` comme référence de style.
- Secrets uniquement en variables d'env (`.env.example` documente,
  `.gitignore` blinde). `gitleaks` tourne en CI sur chaque PR.
- Avant de fusionner une PR qui touche `next.config.ts`, `proxy.ts` ou une
  route `app/api/*`, vérifier qu'aucune violation CSP n'apparaît en
  console (`next build && next start`, puis navigation manuelle ou via
  Playwright).
