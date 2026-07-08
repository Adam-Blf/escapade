# 0001 · CSP sans nonce, `'unsafe-inline'` assumé

Date : 2026-07-08
Statut : Accepté

## Contexte

En ajoutant les en-têtes de sécurité HTTP (`next.config.ts`), la Content
Security Policy est la seule partie qui demande un vrai arbitrage. Next.js
documente deux approches (voir `node_modules/next/dist/docs/01-app/02-guides/
content-security-policy.md`) :

1. **Nonce par requête**, généré dans `proxy.ts`, injecté sur chaque script
   et style. C'est l'option "stricte".
2. **CSP statique** dans `next.config.ts`, avec `'unsafe-inline'` sur
   `script-src` et `style-src`.

## Contrainte qui tranche

Next.js est explicite : **une CSP à base de nonce force le rendu dynamique
sur toutes les pages qui l'utilisent**. Les pages statiques ne peuvent pas
recevoir de nonce car il n'existe ni requête ni réponse au moment du build.

Or le projet repose sur la génération statique (`/[lang]` et
`/[lang]/soutenir` sont du SSG, `/[lang]/destination/[slug]` pré-généré via
`generateStaticParams`) — c'est ce qui permet un hébergement Vercel gratuit
performant sans edge functions payantes. Passer en rendu dynamique pour
satisfaire une CSP stricte contredirait la contrainte n°1 du projet (zéro
coût, `escapade.beloucif.com` en hobby plan).

## Ce que la CSP protège ici, concrètement

- Le script anti-flash du thème (`lib/theme.ts` → `next/script
  beforeInteractive`) est **inline par construction** : il doit s'exécuter
  avant tout rendu pour éviter un flash de mauvais thème.
- `framer-motion` et Tailwind injectent des styles via l'attribut `style=""`
  sur quasi tous les éléments animés — `style-src` sans `'unsafe-inline'`
  casserait toutes les animations.
- Il n'y a **aucun script tiers** chargé (pas de GTM, pas de pixel pub) et
  **aucun contenu utilisateur** n'est jamais injecté côté serveur dans un
  `<script>` — le seul autre `<script type="application/ld+json">` du
  projet (`components/JsonLd.tsx`) échappe déjà `<` défensivement et n'est
  de toute façon pas concerné par `script-src` (ce n'est pas un type MIME
  exécutable).

Le risque qu'un nonce strict couvrirait (script injecté par un tiers
compromis) n'a donc pas de surface d'attaque réelle dans ce projet : il n'y
a pas de tiers.

## Décision

CSP statique dans `next.config.ts`, sans nonce :

```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self'
'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src
'self'; object-src 'none'; base-uri 'self'; form-action 'self';
frame-ancestors 'none'; upgrade-insecure-requests
```

Complétée par HSTS (preload), `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`
et `Permissions-Policy` (caméra/micro/géoloc/paiement/USB désactivés, aucun
n'étant utilisé par l'app).

## Conséquences

- **Gagné** : `object-src 'none'`, `frame-ancestors 'none'`,
  `base-uri 'self'`, `form-action 'self'` bloquent déjà la quasi-totalité
  des vecteurs XSS→exfiltration réalistes pour ce projet (pas d'iframe
  embarquable, pas de plugin, pas de détournement de formulaire).
- **Perdu** : `'unsafe-inline'` n'empêcherait pas l'exécution d'un script
  injecté si une XSS venait à exister ailleurs dans le code. Ce n'est donc
  **pas** une défense en profondeur contre une XSS non découverte — juste un
  filet contre l'injection de ressources externes (scripts/styles/images
  d'un domaine tiers), qui reste la classe de risque la plus probable ici
  (compromission de dépendance npm plutôt que XSS applicative, vu l'absence
  d'input utilisateur rendu sans échappement — React échappe par défaut, et
  aucun composant n'utilise `dangerouslySetInnerHTML` avec une valeur non
  contrôlée par le code).
- **Réversible** : si un besoin de script tiers apparaît un jour (analytics
  externe, widget de paiement autre que le lien Stripe actuel), revisiter
  cette décision plutôt que d'élargir `script-src` par domaine au coup par
  coup.

## Alternative rejetée

Subresource Integrity (SRI) expérimental de Next.js aurait permis de garder
`script-src 'self'` sans `'unsafe-inline'` tout en restant statique — mais
il ne couvre que les scripts, pas les styles inline de framer-motion, et
reste marqué expérimental. À réévaluer si Next le stabilise.
