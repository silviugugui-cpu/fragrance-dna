import Link from "next/link";
import type { StudioOperationalWorkspaceData } from "@/lib/builder/studioOperational/studioOperationalWorkspace";

interface StudioOperationalWorkspaceProps {
  data: StudioOperationalWorkspaceData | null;
  loadError?: string;
}

export function StudioOperationalWorkspace({ data, loadError }: StudioOperationalWorkspaceProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-amber-200/15 bg-zinc-950/80 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <header className="border-b border-amber-200/10 bg-zinc-950/90 px-4 py-3 lg:px-5">
        <h1 className="text-xl font-semibold tracking-tight text-amber-100">
          {data?.title ?? "Studio Workspace"}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          {data?.summary ?? "Operational Builder workspace."}
        </p>
      </header>

      {loadError ? (
        <div className="p-4">
          <article className="rounded-lg border border-rose-300/25 bg-rose-950/20 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-rose-200">Load Error</p>
            <p className="mt-1 text-sm text-rose-100">{loadError}</p>
          </article>
        </div>
      ) : null}

      {!loadError && data ? (
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
            {data.primary.map((metric) => (
              <article key={metric.label} className="rounded border border-zinc-800 bg-zinc-900/55 p-2">
                <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{metric.label}</p>
                <p className="mt-1 text-sm font-semibold text-zinc-100">{metric.value}</p>
                <Link
                  href={metric.href}
                  className="mt-2 inline-flex text-xs text-amber-200 hover:text-amber-100"
                >
                  Open
                </Link>
              </article>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
            <article className="rounded-lg border border-zinc-800 bg-zinc-900/45 p-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
                Workspace Actions
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                {data.links.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 hover:border-amber-300/40"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </article>

            <aside className="rounded-lg border border-zinc-800 bg-zinc-900/45 p-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
                Operational Details
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                {data.details.map((detail) => (
                  <li key={detail.label} className="rounded border border-zinc-800 bg-zinc-900/55 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                      {detail.label}
                    </p>
                    <p className="mt-1 break-all text-zinc-100">{detail.value}</p>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      ) : null}
    </section>
  );
}
