# Escapade

<!-- adam-badges:start -->
[![commits](https://img.shields.io/github/commit-activity/t/Adam-Blf/escapade?color=001329&label=commits&style=flat-square)](https://github.com/Adam-Blf/escapade/commits)
[![visites](https://hits.sh/github.com/Adam-Blf/escapade.svg?style=flat-square&label=visites&color=001329)](https://hits.sh/github.com/Adam-Blf/escapade/)
[![last commit](https://img.shields.io/github/last-commit/Adam-Blf/escapade?color=D4A437&style=flat-square&label=dernier%20push)](https://github.com/Adam-Blf/escapade/commits)
[![top language](https://img.shields.io/github/languages/top/Adam-Blf/escapade?style=flat-square)](https://github.com/Adam-Blf/escapade)
[![license](https://img.shields.io/github/license/Adam-Blf/escapade?style=flat-square&color=D4A437)](LICENSE)
<!-- adam-badges:end -->
![version](https://img.shields.io/badge/version-0.4.0-001329?style=flat-square)

Planificateur de vacances au départ de Paris, Lyon, Lille, Marseille ou
Bordeaux, pensé pour les budgets étudiants. Décris ton envie en une phrase
("pas riche mais envie de voir la mer, 300€, fin août, seule ou à 2") ou coche
tes critères : Escapade classe 24 destinations (France + Europe proche
en train direct) et calcule le
budget réel, solo et à deux, avec des prix qui se rafraîchissent en direct
quand c'est possible.

## Contrainte n°1 · zéro coût

Aucune dépendance payante. Chaque intégration externe suit le même
principe : sans clé, l'app tourne à 100 % sur son catalogue statique ; avec
une clé gratuite, elle enrichit l'affichage.

- **Train** · pas d'API de prix publique côté SNCF → prix indicatif du
  catalogue toujours affiché comme tel. Avec `SNCF_API_KEY` (Navitia,
  5000 req/jour gratuites), la durée réelle du meilleur trajet remplace
  l'estimation.
- **Hôtel** · avec `AMADEUS_CLIENT_ID` / `AMADEUS_CLIENT_SECRET`
  (environnement test Amadeus Self-Service, gratuit), la chambre double la
  moins chère autour de la destination est affichée en direct.
- **Réservation** · pas d'API de booking : des deep-links vers Trainline,
  Booking.com et HostelWorld, préremplis avec les bons critères. Zéro
  commission, zéro clé.
- **Don** · bouton de soutien optionnel via un Payment Link Stripe (aucun
  coût fixe, aucun backend). Masqué si `NEXT_PUBLIC_STRIPE_DONATION_URL`
  n'est pas défini.
- **Icônes / OG / PWA** · générées dynamiquement au build via `next/og`
  (`app/icon.tsx`, `app/opengraph-image.tsx`...), zéro asset binaire à
  maintenir.
- **Analytics** · Vercel Analytics, gratuit sur le plan hobby.

## Features

- [x] Mode langage naturel FR : budget, voyageurs, envies, saison, mois,
      durée, ville de départ, profil du groupe (étudiant / enfants / mobilité
      réduite / calme / fête)
- [x] Mode critères : sliders, chips d'envies, sélecteur de ville de départ
- [x] Moteur de scoring : fit budget (ok / juste / au-dessus), envies,
      saisonnalité, signaux de groupe
- [x] 5 villes de départ × 24 destinations (18 françaises + Barcelone,
      Bruxelles, Amsterdam, Londres, Genève, Milan), matrice de transport
      dédiée par liaison
- [x] Date de départ exacte (en plus du mois flexible), parsée aussi en
      langage naturel ("le 12 août", "05/09")
- [x] Prix temps réel best-effort (durée Navitia, hôtel Amadeus) avec repli
      catalogue transparent
- [x] Recherche partageable par URL, dernières recherches en local
- [x] Tickets actionnables : réservation train / hôtel / auberge, partage
- [x] Pages détail par destination avec budget interactif et activités
      curatées (au moins une gratuite par destination)
- [x] Comparateur de 2 à 3 destinations côte à côte
- [x] Don optionnel via Payment Link Stripe (zéro backend, masqué si non
      configuré)
- [x] SEO complet (metadata, sitemap, robots, OG/icônes générées au build),
      PWA installable, Vercel Analytics
- [x] Dark mode manuel (bascule persistée, gagne sur la préférence système,
      zéro flash) en plus du support `prefers-color-scheme`, reduced motion
      respecté, animations framer-motion

## Stack

Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS 4,
framer-motion 12, Vitest. Voir [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
pour l'organisation du code.

## Dev

```bash
npm install
npm run dev         # http://localhost:3000
npm run build       # build de prod
npm run test        # suite vitest
npm run lint        # eslint
```

## Variables d'environnement

Toutes optionnelles — voir [`.env.example`](.env.example) pour le détail et
les liens d'inscription (comptes gratuits) :

| Variable | Sans elle | Avec elle |
|---|---|---|
| `SNCF_API_KEY` | durée catalogue | durée réelle du trajet (Navitia) |
| `AMADEUS_CLIENT_ID` / `AMADEUS_CLIENT_SECRET` | pas de prix hôtel live | chambre double la moins chère en direct |
| `NEXT_PUBLIC_STRIPE_DONATION_URL` | bouton don masqué | bouton don visible |

## Données et limites

Les prix sont des ordres de grandeur (résa anticipée, tarifs jeunes type
-26 ans Nomad, Ouigo dès 19€) codés dans `lib/destinations.ts`. Ils n'ont
aucune valeur contractuelle : vérifier sur SNCF Connect / Ouigo avant de
réserver. Crédits photos : Wikipédia / Wikimedia Commons.

## Historique

Voir [`CHANGELOG.md`](CHANGELOG.md).
