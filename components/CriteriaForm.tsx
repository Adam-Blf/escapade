"use client";

import { useState } from "react";
import type { Criteria, Vibe } from "@/lib/types";

const VIBES: Array<{ id: Vibe; label: string }> = [
  { id: "mer", label: "Mer" },
  { id: "montagne", label: "Montagne" },
  { id: "lac", label: "Lac" },
  { id: "ville", label: "Ville" },
];

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export function CriteriaForm({ onSearch }: { onSearch: (c: Criteria) => void }) {
  const [budget, setBudget] = useState(300);
  const [travelers, setTravelers] = useState<1 | 2 | null>(null);
  const [vibes, setVibes] = useState<Vibe[]>(["mer"]);
  const [month, setMonth] = useState<number | null>(8);
  const [nights, setNights] = useState(4);

  const toggleVibe = (v: Vibe) =>
    setVibes((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch({ budget, travelers, vibes, month, nights });
      }}
    >
      <div>
        <label htmlFor="budget" className="mb-1 block text-sm font-semibold">
          Budget total : <span className="font-mono text-maree">{budget}€</span>
        </label>
        <input
          id="budget"
          type="range"
          min={100}
          max={1200}
          step={25}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full accent-corail"
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Envie de</legend>
        <div className="flex flex-wrap gap-2">
          {VIBES.map((v) => (
            <label
              key={v.id}
              className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                vibes.includes(v.id)
                  ? "border-maree bg-maree text-white"
                  : "border-line bg-card hover:border-maree"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={vibes.includes(v.id)}
                onChange={() => toggleVibe(v.id)}
              />
              {v.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">On part</legend>
        <div className="flex gap-2">
          {([
            [1, "Seul(e)"],
            [2, "À deux"],
            [null, "Peu importe"],
          ] as const).map(([val, label]) => (
            <label
              key={label}
              className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                travelers === val
                  ? "border-maree bg-maree text-white"
                  : "border-line bg-card hover:border-maree"
              }`}
            >
              <input
                type="radio"
                name="travelers"
                className="sr-only"
                checked={travelers === val}
                onChange={() => setTravelers(val)}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="month" className="mb-1 block text-sm font-semibold">
            Mois
          </label>
          <select
            id="month"
            value={month ?? ""}
            onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm"
          >
            <option value="">Flexible</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="nights" className="mb-1 block text-sm font-semibold">
            Nuits : <span className="font-mono text-maree">{nights}</span>
          </label>
          <input
            id="nights"
            type="range"
            min={1}
            max={14}
            value={nights}
            onChange={(e) => setNights(Number(e.target.value))}
            className="mt-2 w-full accent-corail"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-1 rounded-full bg-corail px-6 py-3 font-display text-lg font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Trouver où partir
      </button>
    </form>
  );
}
