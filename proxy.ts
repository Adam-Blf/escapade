import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "@/lib/i18n/dictionaries";

/** Langue préférée déduite de l'en-tête Accept-Language, repli sur le français. */
function preferredLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language");
  if (!header) return DEFAULT_LOCALE;
  const first = header.split(",")[0]?.split("-")[0]?.toLowerCase();
  return first && isLocale(first) ? first : DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLocale) return NextResponse.next();

  const locale = preferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Exclut aussi tout chemin avec une extension de fichier (assets statiques
    // sous public/ comme /img/*.jpg) : sans clause, /img/dieppe.jpg était
    // redirigé vers /fr/img/dieppe.jpg (inexistant), cassant l'optimiseur
    // d'image Next.js. Bug réel trouvé en QA visuelle, pas théorique.
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|icon|apple-icon|opengraph-image|.*\\..*).*)",
  ],
};
