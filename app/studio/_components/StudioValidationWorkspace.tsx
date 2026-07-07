import type { Sprint1ValidationPackResult } from "@/lib/builder/validationPack/sprint1ValidationPack";

interface StudioValidationWorkspaceProps {
  result: Sprint1ValidationPackResult | null;
  loadError?: string;
}

const formatNumber = (value: number): string =>
  new Intl.NumberFormat("en-US").format(value);

export function StudioValidationWorkspace({
  result,
  loadError,
}: StudioValidationWorkspaceProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-amber-200/15 bg-zinc-950/80 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <header className="border-b border-amber-200/10 bg-zinc-950/90 px-4 py-3 lg:px-5">
        <h1 className="text-xl font-semibold tracking-tight text-amber-100">
          Validation Pack v1
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Production validation execution over full raw workbook.
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

      {!loadError && result ? (
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-8">
            <div className="rounded border border-zinc-800 bg-zinc-900/55 p-2">
              <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Perfumes</p>
              <p className="mt-1 text-sm font-semibold text-zinc-100">{formatNumber(result.totalPerfumes)}</p>
            </div>
            <div className="rounded border border-zinc-800 bg-zinc-900/55 p-2">
              <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Executed Rules</p>
              <p className="mt-1 text-sm font-semibold text-zinc-100">{formatNumber(result.executedRules)}</p>
            </div>
            <div className="rounded border border-zinc-800 bg-zinc-900/55 p-2">
              <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Pass</p>
              <p className="mt-1 text-sm font-semibold text-emerald-300">{formatNumber(result.passCount)}</p>
            </div>
            <div className="rounded border border-zinc-800 bg-zinc-900/55 p-2">
              <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Warning</p>
              <p className="mt-1 text-sm font-semibold text-amber-300">{formatNumber(result.warningCount)}</p>
            </div>
            <div className="rounded border border-zinc-800 bg-zinc-900/55 p-2">
              <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Error</p>
              <p className="mt-1 text-sm font-semibold text-rose-300">{formatNumber(result.errorCount)}</p>
            </div>
            <div className="rounded border border-zinc-800 bg-zinc-900/55 p-2">
              <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Affected Perfumes</p>
              <p className="mt-1 text-sm font-semibold text-zinc-100">{formatNumber(result.affectedPerfumes)}</p>
            </div>
            <div className="rounded border border-zinc-800 bg-zinc-900/55 p-2">
              <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Exec Time (ms)</p>
              <p className="mt-1 text-sm font-semibold text-zinc-100">{formatNumber(result.executionTimeMs)}</p>
            </div>
            <div className="rounded border border-zinc-800 bg-zinc-900/55 p-2">
              <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Dataset Version</p>
              <p className="mt-1 truncate text-sm font-semibold text-zinc-100">{result.datasetVersion}</p>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/45">
            <div className="grid grid-cols-[1.4fr_repeat(6,minmax(80px,1fr))] border-b border-zinc-800 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-zinc-500">
              <span>Rule</span>
              <span>Executed</span>
              <span>Pass</span>
              <span>Warning</span>
              <span>Error</span>
              <span>Affected</span>
              <span>Time ms</span>
            </div>
            <div>
              {result.ruleMetrics.map((rule) => (
                <div
                  key={rule.ruleId}
                  className="grid grid-cols-[1.4fr_repeat(6,minmax(80px,1fr))] border-b border-zinc-800/80 px-3 py-2 text-sm text-zinc-200"
                >
                  <span className="truncate pr-3">{rule.ruleName}</span>
                  <span>{formatNumber(rule.executedCount)}</span>
                  <span className="text-emerald-300">{formatNumber(rule.passCount)}</span>
                  <span className="text-amber-300">{formatNumber(rule.warningCount)}</span>
                  <span className="text-rose-300">{formatNumber(rule.errorCount)}</span>
                  <span>{formatNumber(rule.affectedPerfumes)}</span>
                  <span>{formatNumber(rule.executionTimeMs)}</span>
                </div>
              ))}
            </div>
          </div>

          <footer className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.12em] text-zinc-500">
            <span>Builder Version: {result.builderVersion}</span>
            <span>Workbook: {result.workbookPath}</span>
            <span>Generated: {result.generatedAt}</span>
          </footer>
        </div>
      ) : null}
    </section>
  );
}
