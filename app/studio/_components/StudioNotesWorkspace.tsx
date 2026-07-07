"use client";

import { useMemo, useState } from "react";
import type {
  NotesWorkspaceResult,
  NoteWorkspaceListItem,
  NoteWorkspaceStatus,
} from "@/lib/builder/notesWorkspace/notesWorkspace";

interface StudioNotesWorkspaceProps {
  data: NotesWorkspaceResult | null;
  loadError?: string;
}

const formatNumber = (value: number): string =>
  new Intl.NumberFormat("en-US").format(value);

const formatPercent = (value: number): string => `${value.toFixed(2)}%`;

const statusBadgeStyle: Record<NoteWorkspaceStatus, string> = {
  healthy: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  "review-needed": "border-amber-400/35 bg-amber-400/10 text-amber-200",
  "not-observed": "border-zinc-700 bg-zinc-900 text-zinc-400",
};

const reviewBadgeStyle: Record<string, string> = {
  approved: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  "pending-review": "border-amber-400/35 bg-amber-400/10 text-amber-200",
  "not-observed": "border-zinc-700 bg-zinc-900 text-zinc-400",
};

const statusLabel: Record<NoteWorkspaceStatus, string> = {
  healthy: "Healthy",
  "review-needed": "Review Needed",
  "not-observed": "Not Observed",
};

export function StudioNotesWorkspace({ data, loadError }: StudioNotesWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | NoteWorkspaceStatus>("all");
  const [minOccurrences, setMinOccurrences] = useState<number>(0);
  const [selectedNoteId, setSelectedNoteId] = useState<string>(
    data?.selectedNote?.noteId ?? data?.displayedNotes[0]?.noteId ?? "",
  );

  const filteredNotes = useMemo(() => {
    const notes = data?.displayedNotes ?? [];
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return notes.filter((note) => {
      const matchStatus = statusFilter === "all" || note.status === statusFilter;
      const matchMinOccurrences = note.occurrences >= minOccurrences;
      const matchSearch =
        normalizedSearch.length === 0 ||
        note.canonicalName.toLowerCase().includes(normalizedSearch);

      return matchStatus && matchMinOccurrences && matchSearch;
    });
  }, [data?.displayedNotes, minOccurrences, searchQuery, statusFilter]);

  const selected = useMemo(() => {
    if (!data?.selectedNote) {
      return null;
    }

    if (!selectedNoteId || selectedNoteId === data.selectedNote.noteId) {
      return data.selectedNote;
    }

    const listHit = data.displayedNotes.find((item) => item.noteId === selectedNoteId);
    if (!listHit || listHit.noteId !== data.selectedNote.noteId) {
      return data.selectedNote;
    }

    return data.selectedNote;
  }, [data?.displayedNotes, data?.selectedNote, selectedNoteId]);

  return (
    <section className="overflow-hidden rounded-xl border border-amber-200/15 bg-zinc-950/80 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <header className="border-b border-amber-200/10 bg-zinc-950/90 px-4 py-3 lg:px-5">
        <h1 className="text-xl font-semibold tracking-tight text-amber-100">Notes Workspace v1</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Canonical notes intelligence powered by real Builder datasets.
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
            <TopMetric label="Total Notes" value={formatNumber(data.totalNotes)} />
            <TopMetric label="Total Occurrences" value={formatNumber(data.totalOccurrences)} />
            <TopMetric label="Average Occurrences" value={formatNumber(data.averageOccurrences)} />
            <TopMetric label="Pending Review" value={formatNumber(data.pendingReview)} />
            <TopMetric label="Coverage" value={formatPercent(data.coveragePercent)} />
          </div>

          <div className="grid min-h-[780px] grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
            <aside className="rounded-lg border border-zinc-800 bg-zinc-900/45">
              <div className="border-b border-zinc-800 px-3 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">Notes List</h2>
              </div>

              <div className="space-y-3 border-b border-zinc-800 px-3 py-3">
                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-zinc-500">Search</label>
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search canonical note"
                    className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-300/40"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-zinc-500">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as "all" | NoteWorkspaceStatus)}
                    className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 outline-none focus:border-amber-300/40"
                  >
                    <option value="all">All</option>
                    <option value="healthy">Healthy</option>
                    <option value="review-needed">Review Needed</option>
                    <option value="not-observed">Not Observed</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-zinc-500">Min Occurrences</label>
                  <select
                    value={String(minOccurrences)}
                    onChange={(event) => setMinOccurrences(Number(event.target.value))}
                    className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 outline-none focus:border-amber-300/40"
                  >
                    <option value="0">0+</option>
                    <option value="10">10+</option>
                    <option value="50">50+</option>
                    <option value="100">100+</option>
                  </select>
                </div>
              </div>

              <div className="max-h-[560px] overflow-auto px-2 py-2">
                {filteredNotes.length > 0 ? (
                  filteredNotes.map((note) => (
                    <NoteListRow
                      key={note.noteId}
                      note={note}
                      selected={note.noteId === selected?.noteId}
                      onSelect={() => setSelectedNoteId(note.noteId)}
                    />
                  ))
                ) : (
                  <div className="rounded border border-zinc-800 bg-zinc-900/55 px-3 py-3 text-sm text-zinc-400">
                    No notes matched the current filters.
                  </div>
                )}
              </div>
            </aside>

            <main className="rounded-lg border border-zinc-800 bg-zinc-900/45">
              <div className="border-b border-zinc-800 px-4 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">Selected Canonical Note</h2>
              </div>

              {selected ? (
                <div className="space-y-3 px-4 py-3">
                  <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-lg font-semibold text-amber-100">{selected.canonicalName}</p>
                        <p className="mt-1 text-sm text-zinc-400">{selected.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className={`rounded border px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] ${statusBadgeStyle[selected.status]}`}>
                          {statusLabel[selected.status]}
                        </span>
                        <span className={`rounded border px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] ${reviewBadgeStyle[selected.reviewStatus] ?? reviewBadgeStyle["not-observed"]}`}>
                          {selected.reviewStatus}
                        </span>
                      </div>
                    </div>
                  </article>

                  <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Aliases</p>
                    <div className="mt-2 flex max-h-[140px] flex-wrap gap-1 overflow-auto">
                      {selected.aliases.length > 0 ? (
                        selected.aliases.map((alias) => (
                          <span key={`${alias.alias}-${alias.aliasType}`} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs text-zinc-300">
                            {alias.alias} ({alias.aliasType})
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-500">No aliases.</span>
                      )}
                    </div>
                  </article>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    <MetricListCard title="Top Perfumes" items={selected.topPerfumes} />
                    <MetricListCard title="Top Brands" items={selected.topBrands} />
                    <MetricListCard title="Top Main Accords" items={selected.topMainAccords} />
                    <MetricListCard title="Top Co-occurring Notes" items={selected.topCoOccurringNotes} />
                  </div>

                  <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Builder Status & Coverage</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-zinc-300">
                      <div className="rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1.5">
                        Builder Status: <span className="text-zinc-100">{selected.builderStatus}</span>
                      </div>
                      <div className="rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1.5">
                        Coverage: <span className="text-zinc-100">{formatPercent(selected.coveragePercent)}</span>
                      </div>
                      <div className="rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1.5">
                        Occurrences: <span className="text-zinc-100">{formatNumber(selected.occurrences)}</span>
                      </div>
                      <div className="rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1.5">
                        Alias Count: <span className="text-zinc-100">{formatNumber(selected.aliases.length)}</span>
                      </div>
                    </div>
                  </article>
                </div>
              ) : (
                <div className="p-4 text-sm text-zinc-400">No canonical note selected.</div>
              )}
            </main>

            <aside className="rounded-lg border border-zinc-800 bg-zinc-900/45">
              <div className="border-b border-zinc-800 px-4 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">Workspace Intelligence</h2>
              </div>

              <div className="space-y-3 px-4 py-3">
                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Statistics</p>
                  <StatLine label="Active Canonical Notes" value={formatNumber(data.statistics.activeCanonicalNotes)} />
                  <StatLine label="Observed Canonical Notes" value={formatNumber(data.statistics.observedCanonicalNotes)} />
                  <StatLine label="Unresolved Unique Raw Notes" value={formatNumber(data.statistics.unresolvedUniqueRawNotes)} />
                  <StatLine label="Unresolved Raw Occurrences" value={formatNumber(data.statistics.unresolvedRawOccurrences)} />
                  <StatLine label="Unresolved Share" value={formatPercent(data.statistics.unresolvedRawSharePercent)} />
                  <StatLine label="Aliases Total" value={formatNumber(data.statistics.aliasesTotal)} />
                  <StatLine label="Relationships Total" value={formatNumber(data.statistics.relationshipsTotal)} />
                  <StatLine label="Avg Aliases / Note" value={formatNumber(data.statistics.avgAliasesPerNote)} />
                  <StatLine label="Avg Co-occurrence / Observed Note" value={formatNumber(data.statistics.avgCoOccurrencePerObservedNote)} />
                </article>

                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Validation</p>
                  <StatLine label="Raw Import Valid" value={data.validation.rawImportValid ? "true" : "false"} />
                  <StatLine label="Raw Import Errors" value={formatNumber(data.validation.rawImportErrors)} />
                  <StatLine label="Raw Import Warnings" value={formatNumber(data.validation.rawImportWarnings)} />
                </article>

                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Review Status</p>
                  <StatLine label="Approved" value={formatNumber(data.review.approved)} />
                  <StatLine label="Pending Review" value={formatNumber(data.review.pending)} />
                  <StatLine label="Not Observed" value={formatNumber(data.review.notObserved)} />
                </article>

                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Future Translation Status</p>
                  <StatLine label="State" value={data.futureTranslationStatus.state} />
                  <StatLine label="Unresolved Unique Raw Notes" value={formatNumber(data.futureTranslationStatus.unresolvedUniqueRawNotes)} />
                </article>

                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Builder Metadata</p>
                  <p className="mt-2 break-all text-xs text-zinc-300">Workbook: {data.builderMetadata.workbookPath}</p>
                  <p className="mt-1 text-xs text-zinc-300">Import Version: {data.builderMetadata.importVersion}</p>
                  <p className="mt-1 text-xs text-zinc-300">Builder Version: {data.builderMetadata.builderVersion}</p>
                  <p className="mt-1 text-xs text-zinc-300">Generated: {data.builderMetadata.generatedAt}</p>
                </article>

                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Read-only Actions</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" disabled className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-500">
                      Refresh Workspace
                    </button>
                    <button type="button" disabled className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-500">
                      Export Selection
                    </button>
                    <button type="button" disabled className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-500">
                      Open Review Queue
                    </button>
                  </div>
                </article>
              </div>
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

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-zinc-300">
      <span className="pr-2 text-zinc-400">{label}</span>
      <span className="text-zinc-100">{value}</span>
    </div>
  );
}

function MetricListCard({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; count: number }>;
}) {
  return (
    <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{title}</p>
      <div className="mt-2 max-h-[180px] space-y-1 overflow-auto">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs text-zinc-300">
              <span className="truncate pr-2">{item.label}</span>
              <span>{formatNumber(item.count)}</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-zinc-500">No data.</p>
        )}
      </div>
    </article>
  );
}

function NoteListRow({
  note,
  selected,
  onSelect,
}: {
  note: NoteWorkspaceListItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`mb-2 w-full rounded border px-2 py-2 text-left transition-colors ${
        selected
          ? "border-amber-300/40 bg-amber-300/10"
          : "border-zinc-800 bg-zinc-900/50 hover:border-amber-200/20"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`truncate text-sm font-medium ${selected ? "text-amber-100" : "text-zinc-200"}`}>
          {note.canonicalName}
        </p>
        <span className="text-xs text-zinc-400">{formatNumber(note.occurrences)}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        <span className={`rounded border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] ${statusBadgeStyle[note.status]}`}>
          {statusLabel[note.status]}
        </span>
        <span className={`rounded border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] ${reviewBadgeStyle[note.reviewStatus] ?? reviewBadgeStyle["not-observed"]}`}>
          {note.reviewStatus}
        </span>
        <span className="rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-zinc-300">
          {formatPercent(note.coveragePercent)}
        </span>
      </div>
    </button>
  );
}
