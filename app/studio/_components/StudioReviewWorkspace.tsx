"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import type { UnresolvedNoteReviewItem } from "@/lib/builder/review/unresolvedNotes";

type ReviewQueueItem = {
  section: string;
  count: number;
  active?: boolean;
};

const workflowActions: string[] = [
  "Approve",
  "Reject",
  "Create New Canonical Entity",
  "Merge",
  "Split",
  "Skip",
  "History",
];

interface StudioReviewWorkspaceProps {
  reviewItems: UnresolvedNoteReviewItem[];
  pendingReviews: number;
  knowledgeHealth: "review-required" | "healthy";
  currentDatasetVersion: string;
  builderVersion: string;
  knowledgeVersion: string;
  loadError?: string;
}

const ROW_HEIGHT = 46;
const VIEWPORT_HEIGHT = 920;
const OVERSCAN = 6;

const buildQueueItems = (pendingReviews: number): ReviewQueueItem[] => [
  { section: "Notes", count: pendingReviews, active: true },
  { section: "Accords", count: 0 },
  { section: "Brands", count: 0 },
  { section: "Duplicates", count: 0 },
  { section: "Aliases", count: 0 },
];

const formatPercent = (value: number): string => `${value.toFixed(2)}%`;

const bucketLabel: Record<string, string> = {
  top: "Top",
  middle: "Middle",
  base: "Base",
  unknown: "Unknown",
};

export function StudioReviewWorkspace({
  reviewItems,
  pendingReviews,
  knowledgeHealth,
  currentDatasetVersion,
  builderVersion,
  knowledgeVersion,
  loadError,
}: StudioReviewWorkspaceProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const queueItems = buildQueueItems(pendingReviews);
  const selectedItem = reviewItems[selectedIndex] ?? null;

  const totalHeight = reviewItems.length * ROW_HEIGHT;
  const maxStart = Math.max(0, reviewItems.length - 1);
  const startIndex = Math.min(maxStart, Math.floor(scrollTop / ROW_HEIGHT));
  const endIndex = Math.min(
    reviewItems.length,
    startIndex + Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT) + OVERSCAN,
  );

  const visibleRows = useMemo(
    () => reviewItems.slice(startIndex, endIndex),
    [reviewItems, startIndex, endIndex],
  );

  const onTableKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (reviewItems.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((current) => Math.min(reviewItems.length - 1, current + 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((current) => Math.max(0, current - 1));
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setSelectedIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setSelectedIndex(reviewItems.length - 1);
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-amber-200/15 bg-zinc-950/80 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <header className="border-b border-amber-200/10 bg-zinc-950/90 px-4 py-3 lg:px-5">
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-zinc-400">
          <span className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1">
            Knowledge Health: {knowledgeHealth}
          </span>
          <span className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1">
            Pending Reviews: {pendingReviews}
          </span>
          <span className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1">
            Dataset Version: {currentDatasetVersion}
          </span>
          <span className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1">
            Builder Version: {builderVersion}
          </span>
        </div>
      </header>

      <div className="grid min-h-[650px] grid-cols-1 xl:grid-cols-[250px_minmax(0,1fr)_360px]">
        <aside className="border-b border-r border-amber-200/10 bg-zinc-950/85 xl:border-b-0">
          <div className="border-b border-amber-200/10 px-4 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
              Review Queue
            </h2>
            <p className="mt-1 text-xs text-zinc-500">Pending count: {pendingReviews}</p>
          </div>

          <div className="space-y-2 px-3 py-3">
            {queueItems.map((item) => (
              <button
                key={item.section}
                type="button"
                className={`w-full rounded-lg border px-3 py-3 text-left transition-colors ${
                  item.active
                    ? "border-amber-300/35 bg-amber-300/10"
                    : "border-zinc-800 bg-zinc-900/55 hover:border-amber-200/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className={`text-sm font-medium ${item.active ? "text-amber-100" : "text-zinc-200"}`}>
                    {item.section}
                  </p>
                  <span className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs text-zinc-300">
                    {item.count}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="border-b border-amber-200/10 bg-zinc-950/70 xl:border-b-0 xl:border-r">
          <div className="border-b border-amber-200/10 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
                Review List
              </h2>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                <button
                  type="button"
                  disabled
                  className="rounded border border-zinc-700 px-2 py-1 text-zinc-500"
                >
                  Sorting (planned)
                </button>
                <button
                  type="button"
                  disabled
                  className="rounded border border-zinc-700 px-2 py-1 text-zinc-500"
                >
                  Filtering (planned)
                </button>
              </div>
            </div>
          </div>

          {loadError ? (
            <div className="px-4 py-4">
              <article className="rounded-lg border border-rose-300/25 bg-rose-950/20 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-rose-200">Load Error</p>
                <p className="mt-1 text-sm text-rose-100">{loadError}</p>
              </article>
            </div>
          ) : null}

          {!loadError && reviewItems.length === 0 ? (
            <div className="px-4 py-4">
              <article className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-sm text-zinc-300">
                  No unresolved note entries found in current Raw Import payload.
                </p>
              </article>
            </div>
          ) : null}

          {!loadError ? (
            <div className="px-4 py-4">
              <div
                className="rounded-lg border border-zinc-800 bg-zinc-900/45"
                tabIndex={0}
                onKeyDown={onTableKeyDown}
              >
                <div className="grid grid-cols-[1.4fr_90px_1.2fr_110px_1fr] border-b border-zinc-800 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                  <span>Raw Value</span>
                  <span>Occurrences</span>
                  <span>Source Fragrances</span>
                  <span>Status</span>
                  <span>Candidate</span>
                </div>

                <div
                  className="relative overflow-auto"
                  style={{ height: `${VIEWPORT_HEIGHT}px` }}
                  onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
                >
                  <div style={{ height: `${totalHeight}px`, position: "relative" }}>
                    {visibleRows.map((item, visibleIndex) => {
                      const index = startIndex + visibleIndex;
                      const selected = index === selectedIndex;
                      return (
                        <button
                          key={`${item.rawNote}-${index}`}
                          type="button"
                          onClick={() => setSelectedIndex(index)}
                          className={`absolute left-0 grid w-full grid-cols-[1.4fr_90px_1.2fr_110px_1fr] items-center border-b border-zinc-800 px-3 text-left text-sm transition-colors ${
                            selected
                              ? "bg-amber-300/10 text-amber-100"
                              : "bg-transparent text-zinc-200 hover:bg-zinc-800/35"
                          }`}
                          style={{
                            top: `${index * ROW_HEIGHT}px`,
                            height: `${ROW_HEIGHT}px`,
                          }}
                        >
                          <span className="truncate pr-3">{item.rawNote}</span>
                          <span>{item.occurrenceCount}</span>
                          <span className="truncate pr-3">
                            {item.sourceFragrances.slice(0, 2).join(", ") || "-"}
                          </span>
                          <span className="capitalize">{item.matchStatus}</span>
                          <span className="truncate">{item.candidateMatch ?? "Pending"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </main>

        <aside className="bg-zinc-950/80">
          <div className="border-b border-amber-200/10 px-4 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
              Knowledge Intelligence Panel
            </h2>
          </div>

          <div className="space-y-3 px-4 py-3">
            {selectedItem ? (
              <>
                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">General</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-zinc-300">
                    <div className="col-span-2 rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1.5">
                      Raw Value: <span className="font-medium text-zinc-100">{selectedItem.rawNote}</span>
                    </div>
                    <div className="rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1.5">Occurrences: {selectedItem.occurrenceCount}</div>
                    <div className="rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1.5">Occurrence %: {formatPercent(selectedItem.occurrencePercentage)}</div>
                    <div className="rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1.5">Unique Perfumes: {selectedItem.uniquePerfumes}</div>
                    <div className="rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1.5">Unique Brands: {selectedItem.uniqueBrands}</div>
                    <div className="rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1.5">Unique Positions: {selectedItem.uniquePositions}</div>
                    <div className="rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1.5">Unique Variants: {selectedItem.uniqueVariants}</div>
                  </div>
                </article>

                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Position Distribution</p>
                  <div className="mt-2 space-y-2">
                    {selectedItem.positionDistribution.map((entry) => (
                      <div key={entry.bucket} className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-zinc-300">
                          <span>{bucketLabel[entry.bucket]}</span>
                          <span>{entry.count} ({formatPercent(entry.percentage)})</span>
                        </div>
                        <div className="h-2 rounded bg-zinc-800">
                          <div
                            className="h-2 rounded bg-amber-300/60"
                            style={{ width: `${Math.min(100, Math.max(0, entry.percentage))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Top Perfumes</p>
                  <div className="mt-2 space-y-1">
                    {selectedItem.topPerfumes.length > 0 ? (
                      selectedItem.topPerfumes.map((entry) => (
                        <div key={entry.label} className="flex items-center justify-between text-xs text-zinc-300">
                          <span className="truncate pr-2">{entry.label}</span>
                          <span>{entry.count}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500">No perfume statistics.</p>
                    )}
                  </div>
                </article>

                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Top Brands</p>
                  <div className="mt-2 space-y-1">
                    {selectedItem.topBrands.length > 0 ? (
                      selectedItem.topBrands.map((entry) => (
                        <div key={entry.label} className="flex items-center justify-between text-xs text-zinc-300">
                          <span className="truncate pr-2">{entry.label}</span>
                          <span>{entry.count}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500">No brand statistics.</p>
                    )}
                  </div>
                </article>

                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Raw Variants</p>
                  <div className="mt-2 max-h-40 space-y-1 overflow-auto">
                    {selectedItem.rawVariantCounts.length > 0 ? (
                      selectedItem.rawVariantCounts.map((entry) => (
                        <div key={entry.variant} className="flex items-center justify-between text-xs text-zinc-300">
                          <span className="truncate pr-2">{entry.variant}</span>
                          <span>{entry.count}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500">No variants found.</p>
                    )}
                  </div>
                </article>

                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Related Raw Notes</p>
                  <div className="mt-2 space-y-1">
                    {selectedItem.relatedRawNotes.length > 0 ? (
                      selectedItem.relatedRawNotes.map((entry) => (
                        <div key={entry.label} className="flex items-center justify-between text-xs text-zinc-300">
                          <span className="truncate pr-2">{entry.label}</span>
                          <span>{entry.count}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500">No co-occurrence statistics.</p>
                    )}
                  </div>
                </article>

                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Provenance</p>
                  <p className="mt-1 text-xs text-zinc-300">Workbook: {selectedItem.provenanceDetails.workbookPath}</p>
                  <p className="mt-1 text-xs text-zinc-300">Worksheet: {selectedItem.provenanceDetails.worksheet}</p>
                  <p className="mt-1 text-xs text-zinc-300">Import Version: {selectedItem.provenanceDetails.importVersion}</p>
                  <p className="mt-1 text-xs text-zinc-300">Builder Version: {selectedItem.provenanceDetails.builderVersion}</p>
                </article>

                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Validation State</p>
                  <p className="mt-1 text-sm text-amber-100">{selectedItem.validationState}</p>
                </article>
              </>
            ) : (
              <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3 text-sm text-zinc-400">
                No selected item.
              </article>
            )}
          </div>
        </aside>
      </div>

      <footer className="border-t border-amber-200/10 bg-zinc-950/90 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {workflowActions.map((action) => (
            <button
              key={action}
              type="button"
              disabled
              className="rounded border border-zinc-700 bg-zinc-900/70 px-3 py-1.5 text-xs font-medium text-zinc-500"
            >
              {action}
            </button>
          ))}
          <div className="ml-auto rounded border border-zinc-800 bg-zinc-900/55 px-2 py-1.5 text-xs text-zinc-400">
            Knowledge Version: {knowledgeVersion}
          </div>
        </div>
      </footer>
    </section>
  );
}
