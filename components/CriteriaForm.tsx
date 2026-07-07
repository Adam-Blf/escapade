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
  const [travelers, setTravelers] = useState<number | null>(null);
  const [profile, setProfile] = useState("");
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
        onSearch({
          budget,
          travelers,
          profile: profile.trim() || null,
          vibes,
          month,
          nights,
        });
      }}
    >
      <div>
        <label htmlFor="budget" className="mb-1 block text-sm font-semibold">
          Budget par personne : <span className="font-mono text-maree">{budget}€</span>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="travelers" className="mb-1 block text-sm font-semibold">
            On part à
          </label>
          <select
            id="travelers"
            value={travelers ?? ""}
            onChange={(e) => setTravelers(e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm"
          >
            <option value="">Je ne sais pas encore</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n === 1 ? "1 (solo)" : `${n} personnes`}
              </option>
            ))}
          </select>
        </div>
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
      </div>

      <div>
        <label htmlFor="profile" className="mb-1 block text-sm font-semibold">
          Qui part ? <span className="font-normal text-inksoft">(optionnel)</span>
        </label>
        <textarea
          id="profile"
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
          rows={2}
          placeholder="Ex : deux étudiantes de 21 ans, petit budget, une préfère la marche à la fête"
          className="w-full resize-none rounded-2xl border border-line bg-paper px-4 py-3 text-sm placeholder:text-inksoft/60"
        />
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
          className="w-full accent-corail"
        />
      </div>

      <button
        type="submit"
        className="mt-1 self-start rounded-full bg-corail px-6 py-3 font-display text-lg font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Trouver où partir
      </button>
    </form>
  );
}
