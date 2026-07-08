import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/providers/joursFeries", () => ({
  holidaysInRange: vi.fn(async () => [{ date: "2027-05-01", name: "1er mai" }]),
}));

import { GET } from "@/app/api/holidays/route";

function req(qs: string): Request {
  return new Request(`http://localhost/api/holidays?${qs}`);
}

describe("GET /api/holidays", () => {
  it("200 avec les jours fériés de la période demandée", async () => {
    const res = await GET(req("month=5&nights=8"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ holidays: [{ date: "2027-05-01", name: "1er mai" }] });
  });

  it("nights hors bornes est clampé à 14", async () => {
    const res = await GET(req("month=5&nights=999"));
    expect(res.status).toBe(200);
  });

  it("startDate invalide est ignorée, retombe sur le mois", async () => {
    const res = await GET(req("month=5&startDate=n-importe-quoi"));
    expect(res.status).toBe(200);
  });
});
