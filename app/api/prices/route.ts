import { NextResponse } from "next/server";
import { isOriginSlug, DEFAULT_ORIGIN } from "@/lib/origins";
import { getQuote } from "@/lib/prices";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

export async function GET(request: Request) {
  const rate = checkRateLimit(`prices:${clientIp(request)}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Trop de requêtes, réessaie dans quelques secondes" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rate.retryAfterMs ?? 0) / 1000)) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const dest = searchParams.get("dest");
  const originParam = searchParams.get("origin") ?? DEFAULT_ORIGIN;
  const month = searchParams.get("month");
  const nightsParam = Number(searchParams.get("nights"));
  const nights = Number.isFinite(nightsParam) && nightsParam >= 1
    ? Math.min(14, nightsParam)
    : 4;
  const startDateParam = searchParams.get("startDate");
  const startDate =
    startDateParam && /^\d{4}-\d{2}-\d{2}$/.test(startDateParam) ? startDateParam : null;

  if (!dest) {
    return NextResponse.json({ error: "Paramètre dest manquant" }, { status: 400 });
  }
  if (!isOriginSlug(originParam)) {
    return NextResponse.json({ error: "Origine inconnue" }, { status: 400 });
  }

  const quote = await getQuote(
    dest,
    originParam,
    month ? Number(month) : null,
    nights,
    startDate
  );
  if (!quote) {
    return NextResponse.json(
      { error: "Destination inconnue ou liaison non proposée" },
      { status: 404 }
    );
  }

  return NextResponse.json(quote, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
