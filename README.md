# Escapade

![version](https://img.shields.io/badge/version-0.1.0-001329?style=flat-square)
![stack](https://img.shields.io/badge/Next.js%2016-TypeScript%20%2B%20Tailwind%204%20%2B%20framer--motion-D4A437?style=flat-square)
![status](https://img.shields.io/badge/status-MVP-001329?style=flat-square)

Planificateur de vacances au départ de Paris, pensé pour les budgets étudiants.
Décris ton envie en une phrase ("pas riche mais envie de voir la mer, 300€,
fin août, seule ou à 2") ou coche tes critères : Escapade classe 18 destinations
françaises et calcule le budget réel, solo et à deux.

## Features

- [x] Mode langage naturel FR : parsing budget, voyageurs, envies (mer / montagne / lac / ville), mois, durée
- [x] Mode critères : sliders budget et nuits, chips envies, radio solo / duo, mois
- [x] Moteur de scoring : match envies, fit budget (ok / juste / au-dessus), saisonnalité
- [x] Estimation budget détaillée par destination : transport AR (tarifs jeunes inclus), hébergement dortoir vs chambre à deux, repas, activités
- [x] Cards résultats en style billet de train (ligne perforée, code gare, route PAR -> XXX)
- [x] 18 destinations avec photos locales (Wikipédia / Wikimedia Commons)
- [x] Dark mode automatique, reduced motion respecté, animations framer-motion

## Stack

Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS 4, framer-motion 12.
Fonts : Bricolage Grotesque (display), Instrument Sans (body), IBM Plex Mono (données billet).
Aucune API externe au runtime : dataset local (`lib/destinations.ts`), images statiques (`public/img`).

## Dev

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de prod
```

## Données et limites

Les prix sont des ordres de grandeur (résa anticipée, tarif -26 ans Nomad,
Ouigo dès 19€) codés dans `lib/destinations.ts`. Ils n'ont aucune valeur
contractuelle : vérifier sur SNCF Connect / Ouigo avant de réserver.
Crédits photos : `public/img/credits.json`.
