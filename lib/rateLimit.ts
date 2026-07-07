/**
 * Rate-limit fixed-window en mémoire, sans dépendance externe. Une seule
 * instance suffit pour ce trafic (Vercel Fluid Compute réutilise l'instance
 * entre requêtes, même principe que le cache de lib/prices.ts) : le but
 * n'est pas une exactitude distribuée, mais d'empêcher un script de vider
 * les quotas gratuits (Navitia 5000 req/j, Amadeus) en quelques minutes.
 */

interface Bucket {
  count: number;
  /** Fin de la fenêtre courante (epoch ms). */
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Purge périodique paresseuse : évite de faire grossir la Map indéfiniment
// sous trafic varié sans jamais bloquer une requête pour ça.
const CLEANUP_INTERVAL_MS = 5 * 60_000;
let lastCleanup = Date.now();

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  /** Présent uniquement quand `allowed` est false. */
  retryAfterMs?: number;
}

/**
 * `key` doit déjà inclure tout ce qui distingue les compteurs (IP + route
 * par ex.) : cette fonction ne connaît que des compteurs par fenêtre fixe.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  cleanup(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count < limit) {
    bucket.count += 1;
    return { allowed: true };
  }

  return { allowed: false, retryAfterMs: bucket.resetAt - now };
}

/**
 * IP client côté Vercel : `x-forwarded-for` porte la chaîne de proxys,
 * le premier maillon est le client réel. En local (pas de proxy), on
 * retombe sur une clé fixe — un seul développeur en dev, pas de risque.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "local";
}
