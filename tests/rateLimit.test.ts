import { describe, expect, it, vi, afterEach } from "vitest";
import { checkRateLimit } from "@/lib/rateLimit";

describe("checkRateLimit", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("autorise jusqu'à la limite puis bloque", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key, 5, 60_000).allowed).toBe(true);
    }
    const blocked = checkRateLimit(key, 5, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("des clés différentes ont des compteurs indépendants", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    for (let i = 0; i < 3; i++) checkRateLimit(a, 3, 60_000);
    expect(checkRateLimit(a, 3, 60_000).allowed).toBe(false);
    expect(checkRateLimit(b, 3, 60_000).allowed).toBe(true);
  });

  it("réinitialise le compteur une fois la fenêtre expirée", () => {
    vi.useFakeTimers();
    const key = `window-${Math.random()}`;
    for (let i = 0; i < 2; i++) checkRateLimit(key, 2, 1000);
    expect(checkRateLimit(key, 2, 1000).allowed).toBe(false);

    vi.advanceTimersByTime(1001);
    expect(checkRateLimit(key, 2, 1000).allowed).toBe(true);
  });

  it("retryAfterMs reflète le temps restant dans la fenêtre", () => {
    vi.useFakeTimers();
    const key = `retry-${Math.random()}`;
    checkRateLimit(key, 1, 5000);
    vi.advanceTimersByTime(2000);
    const blocked = checkRateLimit(key, 1, 5000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeLessThanOrEqual(3000);
    expect(blocked.retryAfterMs).toBeGreaterThan(2900);
  });
});
