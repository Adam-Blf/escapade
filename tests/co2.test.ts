import { describe, expect, it } from "vitest";
import { co2Comparison, co2SavedVsCar, haversineKm } from "@/lib/co2";

describe("haversineKm", () => {
  it("distance nulle entre un point et lui-même", () => {
    expect(haversineKm({ lat: 48.8566, lng: 2.3522 }, { lat: 48.8566, lng: 2.3522 })).toBe(0);
  });

  it("Paris → Marseille ≈ 660 km à vol d'oiseau", () => {
    const d = haversineKm({ lat: 48.8566, lng: 2.3522 }, { lat: 43.2965, lng: 5.3698 });
    expect(d).toBeGreaterThan(630);
    expect(d).toBeLessThan(690);
  });

  it("Paris → Lille ≈ 200 km à vol d'oiseau", () => {
    const d = haversineKm({ lat: 48.8566, lng: 2.3522 }, { lat: 50.6292, lng: 3.0573 });
    expect(d).toBeGreaterThan(180);
    expect(d).toBeLessThan(220);
  });

  it("symétrique (a→b == b→a)", () => {
    const a = { lat: 45.764, lng: 4.8357 };
    const b = { lat: 43.2965, lng: 5.3698 };
    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 6);
  });
});

describe("co2Comparison", () => {
  it("hiérarchie train < voiture < avion", () => {
    const c = co2Comparison(500);
    expect(c.train).toBeLessThan(c.car);
    expect(c.car).toBeLessThan(c.plane);
  });

  it("distance nulle → tout à zéro", () => {
    const c = co2Comparison(0);
    expect(c.train).toBe(0);
    expect(c.car).toBe(0);
    expect(c.plane).toBe(0);
  });

  it("double la distance simple pour représenter l'aller-retour", () => {
    // 500 km simple -> 1000 km AR -> train: 1000 * 2.4g = 2.4kg
    const c = co2Comparison(500);
    expect(c.train).toBeCloseTo(2.4, 1);
  });

  it("linéaire en distance", () => {
    const c1 = co2Comparison(100);
    const c2 = co2Comparison(200);
    expect(c2.train).toBeCloseTo(c1.train * 2, 1);
  });
});

describe("co2SavedVsCar", () => {
  it("le train économise un pourcentage élevé face à la voiture", () => {
    const { kg, percent } = co2SavedVsCar(500);
    expect(kg).toBeGreaterThan(0);
    expect(percent).toBeGreaterThan(90);
    expect(percent).toBeLessThanOrEqual(100);
  });

  it("distance nulle → aucune économie", () => {
    expect(co2SavedVsCar(0)).toEqual({ kg: 0, percent: 0 });
  });
});
