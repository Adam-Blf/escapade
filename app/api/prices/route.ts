import { NextResponse } from "next/server";
import { isOriginSlug, DEFAULT_ORIGIN } from "@/lib/origins";
import { getQuote } from "@/lib/prices";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dest = searchParams.get("dest");
  const originParam = searchParams.get("origin") ?? DEFAULT_ORIGIN;
  const month = searchParams.get("month");

  if (!dest) {
    return NextResponse.json({ error: "Paramètre dest manquant" }, { status: 400 });
  }
  if (!isOriginSlug(originParam)) {
    return NextResponse.json({ error: "Origine inconnue" }, { status: 400 });
  }

  const quote = await getQuote(dest, originParam, month ? Number(month) : null);
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
