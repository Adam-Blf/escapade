import { describe, expect, it } from "vitest";
import { addNights, checkinDate, toISODate } from "@/lib/dates";
import { formatDuration } from "@/lib/providers/navitia";

describe("checkinDate", () => {
  const now = new Date("2026-07-07T12:00:00Z");

  it("mois futur cette année → 15 du mois", () => {
    expect(toISODate(checkinDate(9, now))).toBe("2026-09-15");
  });

  it("mois déjà passé → année suivante", () => {
    expect(toISODate(checkinDate(3, now))).toBe("2027-03-15");
  });

  it("mois courant avant le 15 → cette année", () => {
    expect(toISODate(checkinDate(7, now))).toBe("2026-07-15");
  });

  it("sans mois → J+30", () => {
    expect(toISODate(checkinDate(null, now))).toBe("2026-08-06");
  });
});

describe("addNights / toISODate", () => {
  it("ajoute les nuits", () => {
    const checkin = new Date("2026-09-15T00:00:00Z");
    expect(toISODate(addNights(checkin, 4))).toBe("2026-09-19");
  });
});

describe("formatDuration", () => {
  it("heures + minutes", () => {
    expect(formatDuration(2 * 3600 + 15 * 60)).toBe("2h15");
  });

  it("moins d'une heure", () => {
    expect(formatDuration(50 * 60)).toBe("50 min");
  });

  it("minutes paddées", () => {
    expect(formatDuration(5 * 3600 + 5 * 60)).toBe("5h05");
  });
});
