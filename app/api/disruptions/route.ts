import { NextResponse } from "next/server";
import { destinations } from "@/lib/destinations";
import { resolveCheckin } from "@/lib/dates";
import { DEFAULT_ORIGIN, getOrigin, isOriginSlug } from "@/lib/origins";
import { activeDisruptions, navitiaAvailable } from "@/lib/providers/navitia";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

export async function GET(request: Request) {
  const rate = checkRateLimit(`disruptions:${clientIp(request)}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Trop de requêtes, réessaie dans quelques secondes" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rate.retryAfterMs ?? 0) / 1000)) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const destSlug = searchParams.get("dest");
  const originParam = searchParams.get("origin") ?? DEFAULT_ORIGIN;
  const month = searchParams.get("month");
  const startDateParam = searchParams.get("startDate");
  const startDate =
    startDateParam && /^\d{4}-\d{2}-\d{2}$/.test(startDateParam) ? startDateParam : null;

  if (!destSlug) {
    return NextResponse.json({ error: "Paramètre dest manquant" }, { status: 400 });
  }
  if (!isOriginSlug(originParam)) {
    return NextResponse.json({ error: "Origine inconnue" }, { status: 400 });
  }
  const dest = destinations.find((d) => d.slug === destSlug);
  if (!dest) {
    return NextResponse.json({ error: "Destination inconnue" }, { status: 404 });
  }

  if (!navitiaAvailable()) {
    return NextResponse.json(
      { disruptions: [] },
      { headers: { "Cache-Control": "public, max-age=3600" } }
    );
  }

  const checkin = resolveCheckin(startDate, month ? Number(month) : null);
  const disruptions = await activeDisruptions(getOrigin(originParam).coords, dest.coords, checkin);

  return NextResponse.json(
    { disruptions },
    { headers: { "Cache-Control": "public, max-age=1800" } }
  );
}
