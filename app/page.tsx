import { Planner } from "@/components/Planner";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-6">
        <p className="font-mono text-sm font-semibold tracking-[0.4em]">ESCAPADE</p>
        <p className="hidden font-mono text-xs text-inksoft sm:block">
          planificateur de vacances, budget honnête
        </p>
      </header>

      <main className="flex-1">
        <Planner />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-6 text-xs text-inksoft">
          <p>
            Photos : Wikipédia / Wikimedia Commons. Prix indicatifs calculés pour un départ
            de Paris, sans valeur contractuelle.
          </p>
          <p>Escapade v0.1.0</p>
        </div>
      </footer>
    </div>
  );
}
