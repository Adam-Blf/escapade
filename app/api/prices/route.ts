import { NextResponse } from "next/server";
import { getQuote } from "@/lib/prices";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dest = searchParams.get("dest");
  const month = searchParams.get("month");

  if (!dest) {
    return NextResponse.json({ error: "Paramètre dest manquant" }, { status: 400 });
  }

  const quote = await getQuote(dest, month ? Number(month) : null);
  if (!quote) {
    return NextResponse.json({ error: "Destination inconnue" }, { status: 404 });
  }

  return NextResponse.json(quote, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
