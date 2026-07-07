import Link from "next/link";
import type { MissionControlDashboardData } from "@/lib/builder/missionControl/missionControlDashboard";

interface StudioDashboardProps {
  data: MissionControlDashboardData | null;
  loadError?: string;
}

export function StudioDashboard({ data, loadError }: StudioDashboardProps) {
  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-amber-200/15 bg-zinc-950/75 p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-amber-100">
          Mission Control Dashboard
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-amber-50/75">
          Operational control center with real Builder telemetry and direct navigation into Builder workspaces.
        </p>
      </header>

      {loadError ? (
        <article className="rounded-xl border border-rose-300/25 bg-rose-950/20 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-rose-200">Load Error</h2>
          <p className="mt-2 text-sm text-rose-100">{loadError}</p>
        </article>
      ) : null}

      {!loadError && data ? (
        <>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
            {data.cards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="rounded-xl border border-amber-200/15 bg-zinc-950/70 p-5 hover:border-amber-200/35"
              >
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-200/90">
                  {card.title}
                </h2>
                <p className="mt-2 text-lg font-semibold text-zinc-100">{card.primary}</p>
                <p className="mt-1 text-sm text-zinc-300">{card.secondary}</p>
                <ul className="mt-3 space-y-1 text-xs text-zinc-400">
                  {card.details.map((detail) => (
                    <li key={detail}>- {detail}</li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>

          <article className="rounded-xl border border-amber-200/15 bg-zinc-950/70 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-200/90">
              Quick Actions
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-zinc-200 hover:border-amber-300/40"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </article>
        </>
      ) : null}
    </section>
  );
}
