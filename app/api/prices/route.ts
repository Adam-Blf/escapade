import { NextResponse } from "next/server";
import { isOriginSlug, DEFAULT_ORIGIN } from "@/lib/origins";
import { getQuote } from "@/lib/prices";

export async function GET(request: Request) {
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
