import { NextResponse } from "next/server";
import { resolveCheckin, addNights } from "@/lib/dates";
import { holidaysInRange } from "@/lib/providers/joursFeries";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

export async function GET(request: Request) {
  const rate = checkRateLimit(`holidays:${clientIp(request)}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Trop de requêtes, réessaie dans quelques secondes" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rate.retryAfterMs ?? 0) / 1000)) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const nightsParam = Number(searchParams.get("nights"));
  const nights = Number.isFinite(nightsParam) && nightsParam >= 1 ? Math.min(14, nightsParam) : 4;
  const startDateParam = searchParams.get("startDate");
  const startDate =
    startDateParam && /^\d{4}-\d{2}-\d{2}$/.test(startDateParam) ? startDateParam : null;

  const checkin = resolveCheckin(startDate, month ? Number(month) : null);
  const checkout = addNights(checkin, nights);
  const holidays = await holidaysInRange(checkin, checkout);

  return NextResponse.json(
    { holidays },
    { headers: { "Cache-Control": "public, max-age=3600" } }
  );
}
