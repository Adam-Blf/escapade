## Résumé

<!-- Qu'est-ce que ça change et pourquoi, en 1-3 puces. -->

-

## Vérifications locales

- [ ] `npx vitest run`
- [ ] `npx tsc --noEmit`
- [ ] `npx eslint .`
- [ ] `npx next build`

## Suivi de version

- [ ] `package.json::version` bumpé si le changement est visible utilisateur
      ou touche l'infra (CI, sécurité, dépendances)
- [ ] Entrée ajoutée dans `CHANGELOG.md`
- [ ] `docs/` mis à jour si un concept durable est introduit (nouveau module
      `lib/`, décision d'archi → `docs/adr/`, changement de flux →
      `docs/ARCHITECTURE.md`)

## Test manuel

<!-- Comment as-tu vérifié que ça marche vraiment (pas juste "tests verts") ?
     Capture, commande curl, parcours navigateur, etc. -->
