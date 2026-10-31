"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  publishMasterDatabaseAction,
  rebuildMasterDatabaseAction,
  runBuilderNowAction,
  runDryRunAction,
} from "@/app/studio/_actions/builderControlActions";
import {
  clearStaleFragranticaQueueAction,
  downloadApprovedGoogleImagesAction,
  runGoogleCseEnrichmentAction,
  runCompleteDatabaseSyncAction,
  runFragranticaSmokeTestAction,
} from "@/app/studio/_actions/sourcesActions";
import { resolvePerfumeImageSrc } from "@/lib/design/perfumeImage";
import type { SourcesWorkspaceData } from "@/lib/builder/connectors/sourcesWorkspace";
import type {
  MasterDatabaseDetailPanel,
  MasterDatabaseListRow,
  MasterDatabaseWorkspaceResult,
} from "@/lib/builder/masterDatabaseWorkspace/masterDatabaseWorkspace";

interface StudioFragranceDatabaseWorkspaceProps {
  masterData: MasterDatabaseWorkspaceResult | null;
  sourcesData: SourcesWorkspaceData | null;
  loadError?: string;
}

const formatNumber = (value: number): string => new Intl.NumberFormat("en-US").format(value);
const formatPercent = (value: number): string => `${value.toFixed(2)}%`;

const buildSearchText = (row: MasterDatabaseListRow): string =>
  [row.perfume, row.brand, row.launchYear, row.searchText].join(" ").toLowerCase();

const buildFallbackDetail = (row: MasterDatabaseListRow): MasterDatabaseDetailPanel => ({
  id: row.id,
  perfume: row.perfume,
  brand: row.brand,
  launchYear: row.launchYear,
  source: row.worksheet,
  status: row.usableStatus,
  externalId: "",
  externalUrl: "",
  rating: "",
  voteCount: "",
  sourceFingerprint: "",
  perfumer: "",
  gender: "",
  description: "",
  imageUrl: row.imageUrl || null,
  localImagePath: row.localImagePath || null,
  notes: [],
  matchedNotes: [],
  unresolvedNotes: [],
  mainAccords: [],
  userDnaTestEnabled: row.userDnaTestEnabled,
  userDnaProfiles: [],
  longevityVotes: {},
  sillageVotes: {},
  validation: {
    status: row.validationStatus,
    issues: [],
  },
  review: {
    status: row.reviewStatus,
    reasons: [],
  },
  builder: {
    status: row.builderStatus,
    coveragePercent: row.coveragePercent,
    confidence: row.confidence,
  },
  decision: {
    current: row.reviewRequired ? "REVIEW_REQUIRED" : "UPDATE_EXISTING",
    confidence: row.confidence,
    explanation: "Fallback detail generated from combined DB row.",
    triggeredRules: [],
    sourceConnector: row.worksheet,
    timestamp: new Date().toISOString(),
    suggestedNextAction: row.reviewRequired ? "Send to Review" : "Update canonical entity",
    history: [],
    provenance: [],
    alternativeCandidates: [],
    mergeTrust: {
      automaticMergeCount: 0,
      manualMergeCount: 0,
      conflictCount: 0,
      averageDecisionConfidence: row.confidence,
      topConflictingFields: [],
      topConflictingSources: [],
      outcomes: [],
      unresolvedConflicts: [],
      provenance: [],
    },
  },
  knowledge: {
    status: row.notesCount > 0 ? "mapped" : "unmapped",
    mappedCount: row.notesCount,
    unresolvedCount: 0,
  },
  relationships: {
    sameBrandPerfumes: [],
    commonNotes: [],
  },
  translation: {
    status: "needs-review",
    unresolvedTokens: [],
  },
  canonical: {
    brand: row.brand,
    family: null,
    gender: null,
    accords: [],
    recommendationTags: [],
    availabilityStatus: null,
    longevity: null,
    sillage: null,
  },
  intelligence: {
    completionPercentage: row.completionPercent,
    missingFields: [],
    dataQualityScore: row.confidence * 100,
    builderConfidence: row.confidence,
    reviewRequired: row.reviewRequired,
    automaticResolutionPossible: !row.reviewRequired,
    suggestedConnector: "Review",
    provenanceCompleteness: 0,
    validationCompleteness: row.validationStatus === "passed" ? 100 : row.validationStatus === "warning" ? 70 : 35,
    knowledgeCompleteness: row.notesCount > 0 ? 100 : 0,
    enrichmentTasks: [],
  },
  connectors: {
    discoverySource: row.worksheet,
    requiredConnectors: [],
    missingFields: [],
    pendingEnrichment: 0,
    pendingJobs: 0,
    completedJobs: 0,
    confidence: row.confidence,
    connectorStatus: [],
    connectorHistory: [],
    synchronizationHistory: [],
    importedSources: [row.worksheet],
    lastSynchronized: new Date().toISOString(),
    conflictStatus: "none",
    pendingSynchronizations: 0,
    completedSynchronizations: 0,
    enrichmentHistory: [],
  },
});

export function StudioFragranceDatabaseWorkspace({
  masterData,
  sourcesData,
  loadError,
}: StudioFragranceDatabaseWorkspaceProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string>(masterData?.rows[0]?.id ?? "");

  const fragrantica = sourcesData?.fragrantica ?? null;

  useEffect(() => {
    if (fragrantica?.status !== "running") {
      return;
    }

    const timer = window.setInterval(() => {
      router.refresh();
    }, 3500);

    return () => window.clearInterval(timer);
  }, [fragrantica?.status, router]);

  const availableBrands = useMemo(() => {
    if (!masterData) {
      return [];
    }

    return Array.from(new Set(masterData.rows.map((row) => row.brand))).sort((left, right) =>
      left.localeCompare(right),
    );
  }, [masterData]);

  // Defer the search term so typing stays responsive while filtering large row sets.
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Precompute the per-row search text once instead of rebuilding it on every keystroke.
  const searchableRows = useMemo(() => {
    if (!masterData) {
      return [];
    }

    return masterData.rows.map((row) => ({ row, text: buildSearchText(row) }));
  }, [masterData]);

  const filteredRows = useMemo(() => {
    if (!masterData) {
      return [];
    }

    const normalizedSearch = deferredSearchQuery.trim().toLowerCase();

    return searchableRows
      .filter(({ row, text }) => {
        if (brandFilter !== "all" && row.brand !== brandFilter) {
          return false;
        }

        if (normalizedSearch.length === 0) {
          return true;
        }

        return text.includes(normalizedSearch);
      })
      .map(({ row }) => row);
  }, [brandFilter, deferredSearchQuery, masterData, searchableRows]);

  useEffect(() => {
    if (filteredRows.length === 0) {
      setSelectedId("");
      return;
    }

    if (!filteredRows.some((row) => row.id === selectedId)) {
      setSelectedId(filteredRows[0].id);
    }
  }, [filteredRows, selectedId]);

  const selectedRow = filteredRows.find((row) => row.id === selectedId) ?? filteredRows[0] ?? null;
  const selectedDetail: MasterDatabaseDetailPanel | null =
    selectedRow && masterData ? masterData.detailsById[selectedRow.id] ?? buildFallbackDetail(selectedRow) : null;
  const selectedImage = resolvePerfumeImageSrc(
    selectedDetail?.localImagePath,
    selectedDetail?.imageUrl,
    selectedRow?.localImagePath,
    selectedRow?.imageUrl,
  );

  const workspaceRows = masterData?.workspacePerfumes ?? masterData?.rows.length ?? 0;
  const combinedRows = masterData?.combinedPerfumes ?? masterData?.totalPerfumes ?? workspaceRows;
  const completeRows = masterData?.rows.filter((row) => row.builderStatus === "complete").length ?? 0;
  const partialRows = masterData?.rows.filter((row) => row.builderStatus === "partial").length ?? 0;
  const missingRows = masterData?.rows.filter((row) => row.builderStatus === "missing-core").length ?? 0;
  const completeInfoPercent = workspaceRows > 0 ? Number(((completeRows / workspaceRows) * 100).toFixed(2)) : 0;
  const needsMoreInfoRows = workspaceRows - completeRows;
  const discoveryProgress = fragrantica?.completionPercent ?? 0;
  const fragranticaCandidates =
    sourcesData?.discoveryCandidates.filter((candidate) => candidate.connector === "fragrantica").length ?? 0;
  const fragranticaErrors =
    sourcesData?.executionLogs.filter(
      (log) => log.connector === "fragrantica" && log.status === "failed",
    ).length ?? 0;
  const hasNoImportsYet = (fragrantica?.importedCount ?? 0) === 0 && (fragrantica?.mergedCount ?? 0) === 0;
  const scanStateLabel = fragrantica
    ? fragrantica.status === "running"
      ? "Running"
      : fragrantica.status === "complete"
        ? "Complete"
        : fragrantica.status === "needs-review"
          ? "Needs Review"
          : "Idle"
    : "Idle";

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-amber-200/15 bg-zinc-950/80 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Studio / Fragrance Database</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-amber-100">Fragrance Database Manager</h1>
            <p className="mt-2 max-w-3xl text-sm text-zinc-400">
              Search by brand or perfume, select a record, review the fields you need for the project, and run a FragDB
              scan from the same screen.
            </p>
          </div>
          <form action={runCompleteDatabaseSyncAction}>
            <button
              type="submit"
              className="rounded border border-fuchsia-400/40 bg-fuchsia-500/10 px-4 py-2 text-xs uppercase tracking-[0.1em] text-fuchsia-100 hover:bg-fuchsia-500/20"
            >
              Scan FragDB & Update DB
            </button>
          </form>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <form action={clearStaleFragranticaQueueAction}>
            <button
              type="submit"
              className="rounded border border-zinc-700 bg-zinc-900/70 px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] text-zinc-200 hover:border-amber-300/30"
            >
              Clean Stale FragDB Queue
            </button>
          </form>
          <form action={runFragranticaSmokeTestAction}>
            <button
              type="submit"
              className="rounded border border-cyan-400/35 bg-cyan-500/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] text-cyan-100 hover:bg-cyan-500/20"
            >
              Run FragDB Smoke Test
            </button>
          </form>
          <form action={runGoogleCseEnrichmentAction}>
            <button
              type="submit"
              className="rounded border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] text-emerald-100 hover:bg-emerald-500/20"
            >
              Enrich Missing Fields (Google)
            </button>
          </form>
          <form action={downloadApprovedGoogleImagesAction}>
            <button
              type="submit"
              className="rounded border border-indigo-400/35 bg-indigo-500/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] text-indigo-100 hover:bg-indigo-500/20"
            >
              Download Approved Images
            </button>
          </form>
        </div>
      </header>

      {loadError ? (
        <article className="rounded-xl border border-rose-300/25 bg-rose-950/20 p-4 text-rose-100">
          <p className="text-xs uppercase tracking-[0.14em] text-rose-200">Load Error</p>
          <p className="mt-2 text-sm">{loadError}</p>
        </article>
      ) : null}

      {!loadError && masterData ? (
        <div className="space-y-4">
          <section className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
            <Metric label="Scan State" value={scanStateLabel} />
            <Metric label="Scan Progress" value={formatPercent(discoveryProgress)} />
            <Metric label="Imported" value={formatNumber(fragrantica?.importedCount ?? 0)} />
            <Metric label="Merged" value={formatNumber(fragrantica?.mergedCount ?? 0)} />
            <Metric label="Complete Info" value={formatNumber(completeRows)} />
            <Metric label="Needs More Info" value={formatNumber(needsMoreInfoRows)} />
            <Metric label="Complete Info %" value={formatPercent(completeInfoPercent)} />
            <Metric label="Tracked Source Records" value={formatNumber(fragrantica?.trackedBrands ?? masterData.totalBrands)} />
            <Metric label="Workspace Rows" value={formatNumber(workspaceRows)} />
            <Metric label="Combined DB Total" value={formatNumber(combinedRows)} />
            <Metric label="Pending Review" value={formatNumber(fragrantica?.pendingReviewCount ?? 0)} />
            <Metric label="Partial" value={formatNumber(partialRows)} />
            <Metric label="Missing Core" value={formatNumber(missingRows)} />
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/55 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-300">FragDB Progress</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Real-time import progress for the current crawl. Imported and merged counts update while the scan is running.
                </p>
              </div>
              <div className="rounded border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-xs text-zinc-400">
                <p>Last full sweep: {fragrantica?.lastFullDiscoveryAt ?? "not yet completed"}</p>
                <p className="mt-1 flex flex-wrap items-center gap-2">
                  <span>Current state: {fragrantica?.message ?? "Ready to scan"}</span>
                  <span className="rounded border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 text-[11px] font-medium text-amber-100">
                    {formatPercent(discoveryProgress)}
                  </span>
                </p>
                <p className="mt-1 text-zinc-500">
                  {hasNoImportsYet
                    ? "No imports yet. The crawler is still discovering candidates or waiting on FragDB responses."
                    : "Imports are already flowing into the database."}
                </p>
                <p className="mt-1">Discovered candidates: {formatNumber(fragranticaCandidates)}</p>
                <p className="mt-1">Crawl errors: {formatNumber(fragranticaErrors)}</p>
              </div>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full rounded-full bg-amber-300/80" style={{ width: `${Math.min(100, discoveryProgress)}%` }} />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
              <div className="rounded border border-zinc-800 bg-zinc-950/55 p-3 text-sm text-zinc-300">
                <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Imported vs merged</p>
                <p className="mt-1">Imported: {formatNumber(fragrantica?.importedCount ?? 0)}</p>
                <p className="mt-1">Merged existing: {formatNumber(fragrantica?.mergedCount ?? 0)}</p>
                <p className="mt-1">Pending review: {formatNumber(fragrantica?.pendingReviewCount ?? 0)}</p>
              </div>
              <div className="rounded border border-zinc-800 bg-zinc-950/55 p-3 text-sm text-zinc-300">
                <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Coverage split</p>
                <p className="mt-1">Complete info: {formatNumber(completeRows)}</p>
                <p className="mt-1">Needs more info: {formatNumber(needsMoreInfoRows)}</p>
                <p className="mt-1">Complete percentage: {formatPercent(completeInfoPercent)}</p>
              </div>
              <div className="rounded border border-zinc-800 bg-zinc-950/55 p-3 text-sm text-zinc-300">
                <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Workflow</p>
                <p className="mt-1">Open master record for deeper review if you want to edit the full perfume profile.</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/55 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-300">Database Administration</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Keep the local perfume database synchronized, recalculate derived fields, and publish when the dataset is ready.
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
              <form action={runBuilderNowAction}>
                <button type="submit" className="w-full rounded border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs uppercase tracking-[0.1em] text-emerald-200 hover:bg-emerald-500/20">
                  Run Full Builder
                </button>
              </form>
              <form action={runDryRunAction}>
                <button type="submit" className="w-full rounded border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-xs uppercase tracking-[0.1em] text-cyan-200 hover:bg-cyan-500/20">
                  Dry Run
                </button>
              </form>
              <form action={rebuildMasterDatabaseAction}>
                <button type="submit" className="w-full rounded border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-xs uppercase tracking-[0.1em] text-amber-100 hover:bg-amber-300/20">
                  Rebuild Master DB
                </button>
              </form>
              <form action={publishMasterDatabaseAction}>
                <button type="submit" className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs uppercase tracking-[0.1em] text-zinc-200 hover:border-amber-300/40">
                  Publish Master DB
                </button>
              </form>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <article className="rounded-xl border border-zinc-800 bg-zinc-900/55 p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search perfume, brand, year, notes..."
                  className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-300/40 focus:outline-none"
                />

                <select
                  value={brandFilter}
                  onChange={(event) => setBrandFilter(event.target.value)}
                  className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-300/40 focus:outline-none"
                >
                  <option value="all">Brand: All</option>
                  {availableBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              <p className="mt-3 text-xs text-zinc-500">
                Showing {formatNumber(filteredRows.length)} of {formatNumber(combinedRows)} perfumes.
              </p>

              <div className="mt-4 overflow-hidden rounded border border-zinc-800 bg-zinc-950/55">
                <div className="max-h-[620px] overflow-auto">
                  <table className="w-full border-collapse text-xs text-zinc-300">
                    <thead className="sticky top-0 bg-zinc-950/95 text-zinc-400">
                      <tr>
                        <th className="border-b border-zinc-800 px-3 py-2 text-left">Brand</th>
                        <th className="border-b border-zinc-800 px-3 py-2 text-left">Perfume</th>
                        <th className="border-b border-zinc-800 px-3 py-2 text-left">Year</th>
                        <th className="border-b border-zinc-800 px-3 py-2 text-left">Completion</th>
                        <th className="border-b border-zinc-800 px-3 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.slice(0, 250).map((row) => {
                        const active = row.id === selectedRow?.id;
                        return (
                          <tr
                            key={row.id}
                            onClick={() => setSelectedId(row.id)}
                            className={`cursor-pointer border-b border-zinc-900 transition-colors ${
                              active ? "bg-amber-300/10" : "hover:bg-zinc-800/35"
                            }`}
                          >
                            <td className="px-3 py-2 text-zinc-300">{row.brand}</td>
                            <td className="px-3 py-2 text-zinc-100">{row.perfume}</td>
                            <td className="px-3 py-2 text-zinc-300">{row.launchYear || "n/a"}</td>
                            <td className="px-3 py-2 text-zinc-300">{formatPercent(row.completionPercent)}</td>
                            <td className="px-3 py-2 text-zinc-300">{row.builderStatus}</td>
                          </tr>
                        );
                      })}
                      {filteredRows.length === 0 ? (
                        <tr>
                          <td className="px-3 py-4 text-zinc-500" colSpan={5}>
                            No perfumes match the current search and brand filter.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </article>

            <aside className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/45 p-4">
              {selectedRow && selectedDetail ? (
                <>
                  <article className="rounded border border-zinc-800 bg-zinc-950/55 p-4">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Selected perfume</p>
                    <h3 className="mt-1 text-lg font-semibold text-amber-100">{selectedRow.perfume}</h3>
                    <p className="mt-1 text-sm text-zinc-400">{selectedRow.brand} · {selectedRow.launchYear || "n/a"}</p>
                    <div className="mt-3 overflow-hidden rounded border border-zinc-800 bg-zinc-900/60">
                      <img
                        src={selectedImage.src}
                        alt={`${selectedRow.brand} ${selectedRow.perfume}`}
                        className="h-44 w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-300">
                      <MiniStat label="Builder" value={selectedRow.builderStatus} />
                      <MiniStat label="Validation" value={selectedRow.validationStatus} />
                      <MiniStat label="Review" value={selectedRow.reviewStatus} />
                      <MiniStat label="Confidence" value={selectedRow.confidence.toFixed(2)} />
                      <MiniStat label="Missing Fields" value={formatNumber(selectedRow.missingFieldsCount)} />
                      <MiniStat label="Review Required" value={selectedRow.reviewRequired ? "yes" : "no"} />
                    </div>
                  </article>

                  <article className="rounded border border-zinc-800 bg-zinc-950/55 p-4">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Project fields</p>
                    <div className="mt-2 space-y-2 text-sm text-zinc-300">
                      <Line label="Notes" value={selectedDetail.notes.length > 0 ? selectedDetail.notes.join(", ") : "None"} />
                      <Line label="Main accords" value={selectedDetail.mainAccords.length > 0 ? selectedDetail.mainAccords.join(", ") : "None"} />
                      <Line label="Unresolved notes" value={selectedDetail.unresolvedNotes.length > 0 ? selectedDetail.unresolvedNotes.join(", ") : "None"} />
                      <Line label="Missing fields" value={selectedDetail.intelligence.missingFields.join(", ") || "None"} />
                    </div>
                  </article>

                  <article className="rounded border border-zinc-800 bg-zinc-950/55 p-4 text-sm text-zinc-300">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Detail link</p>
                    <p className="mt-1 text-zinc-400">
                      If you want to inspect or change the record in the full master workspace, open the linked page.
                    </p>
                    <Link
                      href={`/studio/master-database?perfume=${encodeURIComponent(selectedRow.perfume)}&record=${encodeURIComponent(selectedRow.id)}`}
                      className="mt-3 inline-flex rounded border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-xs uppercase tracking-[0.1em] text-amber-100 hover:bg-amber-300/20"
                    >
                      Open master record
                    </Link>
                  </article>
                </>
              ) : (
                <article className="rounded border border-zinc-800 bg-zinc-950/55 p-4 text-sm text-zinc-400">
                  No record selected.
                </article>
              )}
            </aside>
          </section>
        </div>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded border border-zinc-800 bg-zinc-900/55 p-2">
      <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-100">{value}</p>
    </article>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/60 px-2 py-1.5">
      <p className="text-[11px] uppercase tracking-[0.1em] text-zinc-500">{label}</p>
      <p className="mt-1 text-zinc-100">{value}</p>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/60 p-2">
      <p className="text-xs uppercase tracking-[0.1em] text-zinc-500">{label}</p>
      <p className="mt-1 break-words text-zinc-100">{value}</p>
    </div>
  );
}
