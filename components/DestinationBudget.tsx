"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { estimate } from "@/lib/engine";
import { ORIGINS, getOrigin } from "@/lib/origins";
import { activitiesOf } from "@/lib/activities";
import { co2Comparison, co2SavedVsCar, haversineKm } from "@/lib/co2";
import type { Destination, OriginSlug } from "@/lib/types";

/**
 * Budget interactif de la page destination : ville de départ, nuits, formule
 * et sélection d'activités recalculent le total en direct.
 */
export function DestinationBudget({
  dest,
  initialOrigin,
  initialNights,
  initialTravelers,
}: {
  dest: Destination;
  initialOrigin: OriginSlug;
  initialNights: number;
  initialTravelers: number | null;
}) {
  const served = ORIGINS.filter((o) => dest.transports[o.slug] && o.slug !== dest.slug);
  const fallbackOrigin = served[0]?.slug ?? "paris";
  const [origin, setOrigin] = useState<OriginSlug>(
    dest.transports[initialOrigin] && initialOrigin !== dest.slug
      ? initialOrigin
      : fallbackOrigin
  );
  const [nights, setNights] = useState(initialNights);
  const [duo, setDuo] = useState(initialTravelers !== 1);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const transport = dest.transports[origin]!;
  const list = activitiesOf(dest.slug);
  const activityTotal = useMemo(
    () => list.filter((a) => picked.has(a.name)).reduce((sum, a) => sum + a.price, 0),
    [list, picked]
  );

  const est = estimate(dest, nights, duo ? 2 : 1, transport);
  const lodging = duo ? est.lodgingDuo : est.lodgingSolo;
  // Le forfait 25€ par défaut est remplacé par la somme des activités choisies
  const total = est.transport + lodging + est.food + (picked.size > 0 ? activityTotal : est.activities);

  const distanceKm = useMemo(
    () => haversineKm(getOrigin(origin).coords, dest.coords),
    [origin, dest.coords]
  );
  const co2 = useMemo(() => co2Comparison(distanceKm), [distanceKm]);
  const savedVsCar = useMemo(() => co2SavedVsCar(distanceKm), [distanceKm]);

  const toggle = (name: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {/* Activités */}
      <section>
        <h2 className="mb-4 font-display text-2xl font-bold">
          À faire sur place
        </h2>
        <ul className="space-y-2">
          {list.map((a) => (
            <li key={a.name}>
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3 transition-colors hover:border-maree">
                <input
                  type="checkbox"
                  checked={picked.has(a.name)}
                  onChange={() => toggle(a.name)}
                  className="h-4 w-4 accent-corail"
                />
                <span className="flex-1 text-sm">
                  {a.name}
                  {a.note && <span className="block text-xs text-inksoft">{a.note}</span>}
                </span>
                <span
                  className={`font-mono text-sm font-semibold ${
                    a.price === 0 ? "text-maree" : ""
                  }`}
                >
                  {a.price === 0 ? "gratuit" : `${a.price}€`}
                </span>
              </label>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-inksoft">
          Coche ce qui te tente : le budget à droite se met à jour. Sans sélection,
          on compte un forfait de {est.activities}€.
        </p>

        {/* Impact carbone · calcul 100% local (haversine + facteurs ADEME), aucun appel réseau */}
        <div className="mt-8 rounded-2xl border border-line bg-card p-5">
          <h3 className="mb-3 font-display text-lg font-bold">Impact carbone (aller-retour)</h3>
          <dl className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-maree/10 py-3">
              <dt className="text-xs text-inksoft">Train</dt>
              <dd className="font-mono text-lg font-bold text-maree">{co2.train} kg</dd>
            </div>
            <div className="rounded-xl bg-paper py-3">
              <dt className="text-xs text-inksoft">Voiture</dt>
              <dd className="font-mono text-lg font-bold">{co2.car} kg</dd>
            </div>
            <div className="rounded-xl bg-paper py-3">
              <dt className="text-xs text-inksoft">Avion</dt>
              <dd className="font-mono text-lg font-bold">{co2.plane} kg</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-inksoft">
            Le train t&apos;évite ~{savedVsCar.kg} kg de CO2e par rapport à la voiture, soit{" "}
            {savedVsCar.percent}% en moins. Ordres de grandeur ADEME (Base Carbone), non
            contractuels.
          </p>
        </div>
      </section>

      {/* Budget */}
      <aside className="h-fit rounded-3xl border border-line bg-card p-6 lg:sticky lg:top-6">
        <h2 className="mb-4 font-display text-xl font-bold">Ton budget</h2>

        <div className="mb-4 flex flex-col gap-3">
          <label className="text-sm font-semibold" htmlFor="dest-origin">
            Départ de
          </label>
          <select
            id="dest-origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value as OriginSlug)}
            className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          >
            {served.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.name} · {dest.transports[o.slug]!.priceAR}€ AR
              </option>
            ))}
          </select>

          <label className="text-sm font-semibold" htmlFor="dest-nights">
            Nuits : <span className="font-mono text-maree">{nights}</span>
          </label>
          <input
            id="dest-nights"
            type="range"
            min={1}
            max={14}
            value={nights}
            onChange={(e) => setNights(Number(e.target.value))}
            className="accent-corail"
          />

          <div className="flex gap-2">
            {[
              [false, "Solo dortoir"],
              [true, "À deux"],
            ].map(([isDuo, label]) => (
              <button
                key={String(isDuo)}
                type="button"
                onClick={() => setDuo(isDuo as boolean)}
                className={`flex-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  duo === isDuo
                    ? "border-maree bg-maree text-white"
                    : "border-line text-inksoft hover:border-maree"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <dl className="space-y-2 border-t border-dashed border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-inksoft">Train AR ({getOrigin(origin).name})</dt>
            <dd className="font-mono">{est.transport}€</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-inksoft">Dodo · {nights} nuits</dt>
            <dd className="font-mono">{lodging}€</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-inksoft">Repas · {nights + 1} jours</dt>
            <dd className="font-mono">{est.food}€</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-inksoft">
              Activités{picked.size > 0 ? ` (${picked.size})` : " (forfait)"}
            </dt>
            <dd className="font-mono">{picked.size > 0 ? activityTotal : est.activities}€</dd>
          </div>
        </dl>

        <motion.p
          key={total}
          initial={{ scale: 0.96, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-4 border-t-2 border-line pt-4 font-display text-4xl font-bold text-maree"
        >
          ~{total}€
          <span className="ml-2 text-base font-normal text-inksoft">par personne</span>
        </motion.p>
        <p className="mt-1 text-xs text-inksoft">{transport.label}, {transport.duration}</p>
      </aside>
    </div>
  );
}
