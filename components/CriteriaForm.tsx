"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Criteria, OriginSlug, Vibe } from "@/lib/types";

const VIBES: Vibe[] = ["mer", "montagne", "lac", "ville"];

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CriteriaForm({
  origin,
  onSearch,
}: {
  origin: OriginSlug;
  onSearch: (c: Criteria) => void;
}) {
  const { lang, dict } = useLocale();
  const months = lang === "fr" ? MONTHS_FR : MONTHS_EN;
  const [budget, setBudget] = useState(300);
  const [travelers, setTravelers] = useState<number | null>(null);
  const [profile, setProfile] = useState("");
  const [vibes, setVibes] = useState<Vibe[]>(["mer"]);
  const [month, setMonth] = useState<number | null>(8);
  const [startDate, setStartDate] = useState("");
  const [nights, setNights] = useState(4);
  const todayISO = new Date().toISOString().slice(0, 10);

  const onMonthChange = (v: string) => {
    setMonth(v ? Number(v) : null);
    setStartDate(""); // le mois redevient flexible, la date précise ne tient plus
  };
  const onDateChange = (v: string) => {
    setStartDate(v);
    if (v) setMonth(new Date(`${v}T00:00:00`).getMonth() + 1);
  };

  const toggleVibe = (v: Vibe) =>
    setVibes((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch({
          origin,
          budget,
          travelers,
          profile: profile.trim() || null,
          vibes,
          month,
          startDate: startDate || null,
          nights,
        });
      }}
    >
      <div>
        <label htmlFor="budget" className="mb-1 block text-sm font-semibold">
          {dict.criteriaForm.budgetLabel} : <span className="font-mono text-maree">{budget}€</span>
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
        <legend className="mb-2 text-sm font-semibold">{dict.criteriaForm.vibesLegend}</legend>
        <div className="flex flex-wrap gap-2">
          {VIBES.map((v) => (
            <label
              key={v}
              className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                vibes.includes(v)
                  ? "border-maree bg-maree text-white"
                  : "border-line bg-card hover:border-maree"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={vibes.includes(v)}
                onChange={() => toggleVibe(v)}
              />
              {dict.criteriaForm.vibes[v]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="travelers" className="mb-1 block text-sm font-semibold">
            {dict.criteriaForm.travelersLabel}
          </label>
          <select
            id="travelers"
            value={travelers ?? ""}
            onChange={(e) => setTravelers(e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm"
          >
            <option value="">{dict.criteriaForm.travelersUnknown}</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n === 1 ? dict.criteriaForm.travelersSolo : `${n} ${dict.criteriaForm.travelersN}`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="month" className="mb-1 block text-sm font-semibold">
            {dict.criteriaForm.monthLabel}
          </label>
          <select
            id="month"
            value={month ?? ""}
            onChange={(e) => onMonthChange(e.target.value)}
            className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm"
          >
            <option value="">{dict.criteriaForm.monthFlexible}</option>
            {months.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="start-date" className="mb-1 block text-sm font-semibold">
          {dict.criteriaForm.startDateLabel}{" "}
          <span className="font-normal text-inksoft">{dict.criteriaForm.profileOptional}</span>
        </label>
        <input
          id="start-date"
          type="date"
          min={todayISO}
          value={startDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-inksoft">{dict.criteriaForm.startDateHelp}</p>
      </div>

      <div>
        <label htmlFor="profile" className="mb-1 block text-sm font-semibold">
          {dict.criteriaForm.profileLabel}{" "}
          <span className="font-normal text-inksoft">{dict.criteriaForm.profileOptional}</span>
        </label>
        <textarea
          id="profile"
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
          rows={2}
          placeholder={dict.criteriaForm.profilePlaceholder}
          className="w-full resize-none rounded-2xl border border-line bg-paper px-4 py-3 text-sm placeholder:text-inksoft/60"
        />
      </div>

      <div>
        <label htmlFor="nights" className="mb-1 block text-sm font-semibold">
          {dict.criteriaForm.nightsLabel} : <span className="font-mono text-maree">{nights}</span>
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
        {dict.criteriaForm.submit}
      </button>
    </form>
  );
}
