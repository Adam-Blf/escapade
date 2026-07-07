import { NextResponse } from "next/server";
import { destinations } from "@/lib/destinations";
import { checkinDate } from "@/lib/dates";
import { DEFAULT_ORIGIN, getOrigin, isOriginSlug } from "@/lib/origins";
import { activeDisruptions, navitiaAvailable } from "@/lib/providers/navitia";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destSlug = searchParams.get("dest");
  const originParam = searchParams.get("origin") ?? DEFAULT_ORIGIN;
  const month = searchParams.get("month");

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

  const checkin = checkinDate(month ? Number(month) : null);
  const disruptions = await activeDisruptions(getOrigin(originParam).coords, dest.coords, checkin);

  return NextResponse.json(
    { disruptions },
    { headers: { "Cache-Control": "public, max-age=1800" } }
  );
}
