import { MotionConfig } from "framer-motion";
import { Planner } from "@/components/Planner";
import { DonateButton } from "@/components/DonateButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PlaneMark } from "@/components/PlaneMark";
import { APP_VERSION } from "@/lib/version";

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 pt-6">
          <p className="flex items-center gap-1.5 font-mono text-sm font-semibold tracking-[0.4em]">
            ESCAPADE <PlaneMark />
          </p>
          <p className="hidden flex-1 font-mono text-xs text-inksoft sm:block">
            planificateur de vacances, budget honnête
          </p>
          <div className="flex items-center gap-2">
            <DonateButton />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1">
          <Planner />
        </main>

        <footer className="border-t border-line">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-6 text-xs text-inksoft">
            <p>
              Photos : Wikipédia / Wikimedia Commons. Prix indicatifs calculés pour la ville
              de départ choisie, sans valeur contractuelle.
            </p>
            <p>Escapade v{APP_VERSION}</p>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
