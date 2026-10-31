"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { BuilderDecisionWorkspaceResult } from "@/lib/builder/decisionEngine/decisionEngine";

interface StudioDecisionReviewWorkspaceProps {
  data: BuilderDecisionWorkspaceResult | null;
  loadError?: string;
}

const formatNumber = (value: number): string => new Intl.NumberFormat("en-US").format(value);

const formatPercent = (value: number): string => `${value.toFixed(2)}%`;

export function StudioDecisionReviewWorkspace({ data, loadError }: StudioDecisionReviewWorkspaceProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const reviewItems = data?.reviewQueue ?? [];
  const selectedItem = reviewItems[selectedIndex] ?? null;
  const selectedConflicts = selectedItem?.mergeTrust.unresolvedConflicts ?? [];

  const decisionRows = useMemo(() => {
    return reviewItems.map((item, index) => ({
      item,
      index,
      selected: index === selectedIndex,
    }));
  }, [reviewItems, selectedIndex]);

  return (
    <section className="overflow-hidden rounded-xl border border-amber-200/15 bg-zinc-950/80 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <header className="border-b border-amber-200/10 bg-zinc-950/90 px-4 py-3 lg:px-5">
        <h1 className="text-xl font-semibold tracking-tight text-amber-100">Builder Decision Review Workspace</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Review-only queue for unresolved merge conflicts with competing evidence.
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
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
            <TopMetric label="Review Required" value={formatNumber(data.reviewRequired)} />
            <TopMetric label="Automatic Merges" value={formatNumber(data.automaticMerges)} />
            <TopMetric label="Manual Merges" value={formatNumber(data.manualMerges)} />
            <TopMetric label="Conflict Count" value={formatNumber(data.conflictCount)} />
            <TopMetric label="Auto-Resolution Rate" value={formatPercent(data.autoResolutionRate)} />
            <TopMetric label="Avg Merge Confidence" value={formatPercent(data.averageDecisionConfidence)} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
            <article className="rounded-lg border border-zinc-800 bg-zinc-900/45">
              <div className="border-b border-zinc-800 px-3 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
                  Review Queue
                </h2>
                <p className="mt-1 text-xs text-zinc-500">Only unresolved conflicts are listed here.</p>
              </div>

              {reviewItems.length === 0 ? (
                <div className="px-3 py-4 text-sm text-zinc-400">No unresolved conflicts were generated.</div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  <div className="grid grid-cols-[1.3fr_1fr_110px_130px_110px] border-b border-zinc-800 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                    <span>Perfume</span>
                    <span>Brand</span>
                    <span>Conflicts</span>
                    <span>Merge Confidence</span>
                    <span>Decision</span>
                  </div>

                  {decisionRows.map(({ item, index, selected }) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className={`grid w-full grid-cols-[1.3fr_1fr_110px_130px_110px] items-center px-3 py-3 text-left text-sm transition-colors ${
                        selected ? "bg-amber-300/10 text-amber-100" : "bg-transparent text-zinc-200 hover:bg-zinc-800/35"
                      }`}
                    >
                      <span className="truncate pr-3">{item.perfume}</span>
                      <span className="truncate pr-3">{item.brand}</span>
                      <span>{item.mergeTrust.unresolvedConflicts.length}</span>
                      <span>{item.mergeTrust.averageDecisionConfidence.toFixed(2)}%</span>
                      <span className="truncate pr-3">{item.currentDecision}</span>
                    </button>
                  ))}
                </div>
              )}
            </article>

            <aside className="rounded-lg border border-zinc-800 bg-zinc-900/45">
              <div className="border-b border-zinc-800 px-4 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
                  Decision Detail
                </h2>
              </div>

              {selectedItem ? (
                <div className="space-y-3 px-4 py-3">
                  <SectionCard title="Current Decision">
                    <p className="text-sm font-semibold text-amber-100">{selectedItem.currentDecision}</p>
                    <PairLine label="Confidence" value={selectedItem.confidence.toFixed(2)} />
                    <PairLine label="Source Connector" value={selectedItem.sourceConnector} />
                    <PairLine label="Suggested Action" value={selectedItem.suggestedNextAction} />
                    <PairLine label="Timestamp" value={selectedItem.timestamp} />
                  </SectionCard>

                  <SectionCard title="Explanation">
                    <p className="text-sm text-zinc-200">{selectedItem.explanation}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.1em] text-zinc-500">Triggered Rules</p>
                    <PillGrid values={selectedItem.triggeredRules} />
                  </SectionCard>

                  <SectionCard title="Unresolved Conflicts">
                    {selectedConflicts.length > 0 ? (
                      <ul className="space-y-2 text-xs text-zinc-300">
                        {selectedConflicts.map((conflict) => (
                          <li key={`${conflict.field}-${conflict.competingValues.join("|")}`} className="rounded border border-zinc-800 bg-zinc-900/55 p-2">
                            <p className="text-zinc-100">{conflict.field}</p>
                            <p className="mt-1 text-zinc-400">Competing values: {conflict.competingValues.join(" | ") || "n/a"}</p>
                            <p className="mt-1 text-zinc-400">Sources: {conflict.sources.join(", ") || "n/a"}</p>
                            <p className="mt-1 text-zinc-400">Recommended: {conflict.recommendedResolution}</p>
                            <p className="mt-1 text-zinc-500">{conflict.decisionExplanation}</p>
                            <p className="mt-1 text-zinc-500">Confidence {conflict.confidence.toFixed(2)}%</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-zinc-400">No unresolved conflicts for this record.</p>
                    )}
                  </SectionCard>

                  <SectionCard title="Source Trust">
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {selectedConflicts.length > 0 ? (
                        selectedConflicts.flatMap((conflict) =>
                          conflict.sourceTrust.map((entry) => (
                            <li key={`${conflict.field}-${entry.source}`}>
                              - {conflict.field}: {entry.source} / trust {entry.trust.toFixed(2)}
                            </li>
                          )),
                        )
                      ) : (
                        <li>- No source trust entries</li>
                      )}
                    </ul>
                  </SectionCard>

                  <SectionCard title="Alternative Candidates">
                    {selectedItem.alternativeCandidates.length > 0 ? (
                      <ul className="space-y-2 text-xs text-zinc-300">
                        {selectedItem.alternativeCandidates.map((candidate) => (
                          <li key={candidate.id} className="rounded border border-zinc-800 bg-zinc-900/55 p-2">
                            <p className="text-zinc-100">{candidate.perfume}</p>
                            <p className="mt-1 text-zinc-400">
                              {candidate.brand} / {candidate.launchYear} / {candidate.decision}
                            </p>
                            <p className="mt-1 text-zinc-500">{candidate.reason}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-zinc-400">No alternative candidates were generated.</p>
                    )}
                  </SectionCard>

                  <SectionCard title="Provenance">
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {selectedItem.mergeTrust.provenance.length > 0 ? (
                        selectedItem.mergeTrust.provenance.map((entry) => (
                          <li key={`${entry.field}-${entry.source}-${entry.connector}`}>
                            - {entry.field}: {entry.source} / {entry.connector} / trust {entry.trustScore.toFixed(2)} / confidence {entry.decisionConfidence.toFixed(2)}
                          </li>
                        ))
                      ) : (
                        <li>- No provenance entries</li>
                      )}
                    </ul>
                  </SectionCard>

                  <SectionCard title="Decision History">
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {selectedItem.decisionHistory.length > 0 ? (
                        selectedItem.decisionHistory.map((entry) => (
                          <li key={`${entry.ruleId}-${entry.at}`}>
                            - {entry.at}: {entry.ruleId} / {entry.decision} / {entry.reason}
                          </li>
                        ))
                      ) : (
                        <li>- No decision history available</li>
                      )}
                    </ul>
                  </SectionCard>
                </div>
              ) : (
                <div className="px-4 py-4 text-sm text-zinc-400">No selected decision.</div>
              )}
            </aside>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function TopMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/55 p-2">
      <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{title}</p>
      <div className="mt-2">{children}</div>
    </article>
  );
}

function PairLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-1 flex items-center justify-between gap-2 text-xs">
      <span className="text-zinc-400">{label}</span>
      <span className="text-zinc-100">{value}</span>
    </div>
  );
}

function PillGrid({ values }: { values: string[] }) {
  if (values.length === 0) {
    return <p className="text-xs text-zinc-500">No values.</p>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {values.map((value) => (
        <span key={value} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs text-zinc-200">
          {value}
        </span>
      ))}
    </div>
  );
}