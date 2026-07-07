import { afterEach, describe, expect, it, vi } from "vitest";
import { activeDisruptions } from "@/lib/providers/navitia";
import { GET } from "@/app/api/disruptions/route";

const coords = { lat: 48.85, lng: 2.35 };

function req(qs: string): Request {
  return new Request(`http://localhost/api/disruptions?${qs}`);
}

describe("activeDisruptions", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.SNCF_API_KEY;
  });

  it("extrait les messages actifs, ignore les perturbations passées", async () => {
    process.env.SNCF_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          disruptions: [
            { status: "active", messages: [{ text: "Travaux sur la ligne" }] },
            { status: "past", messages: [{ text: "Ancienne perturbation" }] },
          ],
        }),
      }) as unknown as typeof fetch
    );
    const result = await activeDisruptions(coords, coords, new Date("2026-08-15"));
    expect(result).toEqual(["Travaux sur la ligne"]);
  });

  it("renvoie [] si la requête échoue, jamais de throw", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network")) as unknown as typeof fetch
    );
    const result = await activeDisruptions(coords, coords, new Date("2026-09-20"));
    expect(result).toEqual([]);
  });

  it("renvoie [] si la réponse n'est pas ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch
    );
    const result = await activeDisruptions(coords, coords, new Date("2026-10-05"));
    expect(result).toEqual([]);
  });
});

describe("GET /api/disruptions", () => {
  it("400 si dest manquant", async () => {
    const res = await GET(req("origin=paris"));
    expect(res.status).toBe(400);
  });

  it("400 si origine inconnue", async () => {
    const res = await GET(req("dest=nice&origin=atlantide"));
    expect(res.status).toBe(400);
  });

  it("404 si destination inconnue", async () => {
    const res = await GET(req("dest=atlantide&origin=paris"));
    expect(res.status).toBe(404);
  });

  it("disruptions vide sans SNCF_API_KEY, sans appel réseau", async () => {
    delete process.env.SNCF_API_KEY;
    const res = await GET(req("dest=nice&origin=paris&month=8"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ disruptions: [] });
  });
});
