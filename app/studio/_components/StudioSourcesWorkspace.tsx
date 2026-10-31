"use client";

import {
  cancelConnectorsAction,
  dryRunAllConnectorsAction,
  previewConnectorsAction,
  refreshDiscoveryQueueAction,
  retryFailedConnectorJobsAction,
  runCompleteDatabaseSyncAction,
  runAllConnectorsAction,
  runConnectorAction,
  reviewDiscoveryCandidateAction,
  updateConnectorConfigAction,
} from "@/app/studio/_actions/sourcesActions";
import type { SourcesWorkspaceData } from "@/lib/builder/connectors/sourcesWorkspace";

interface StudioSourcesWorkspaceProps {
  data: SourcesWorkspaceData | null;
  loadError?: string;
}

const formatNumber = (value: number): string => new Intl.NumberFormat("en-US").format(value);
const formatPercent = (value: number): string => `${value.toFixed(2)}%`;
const formatDiscoveryStatus = (value: string): string => value.replace(/-/g, " ");

export function StudioSourcesWorkspace({ data, loadError }: StudioSourcesWorkspaceProps) {
  const fragranticaStatusLabel: Record<NonNullable<SourcesWorkspaceData["fragrantica"]["status"]>, string> = {
    idle: "Idle",
    running: "Running",
    "needs-review": "Needs Review",
    complete: "Complete",
  };

  return (
    <section className="overflow-hidden rounded-xl border border-amber-200/15 bg-zinc-950/80 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <header className="border-b border-amber-200/10 bg-zinc-950/90 px-4 py-3 lg:px-5">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Studio / Fragrance Database</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-amber-100">
          Fragrance Database Manager
        </h1>
        <p className="mt-1 max-w-4xl text-sm text-zinc-400">
          One button scans Fragrantica, updates existing perfumes, adds missing entries automatically, and flags the
          crawl as complete when the current discovery pass has no unresolved items left.
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
          {data.fragrantica.status === "complete" ? (
            <article className="rounded border border-emerald-400/25 bg-emerald-500/10 p-4 text-emerald-50">
              <p className="text-xs uppercase tracking-[0.14em] text-emerald-200">Fragrantica Complete</p>
              <p className="mt-1 text-sm">{data.fragrantica.message}</p>
            </article>
          ) : null}

          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
            <Metric label="Sync State" value={fragranticaStatusLabel[data.fragrantica.status]} />
            <Metric label="Discovery Progress" value={formatPercent(data.fragrantica.completionPercent)} />
            <Metric label="Pending Review" value={formatNumber(data.fragrantica.pendingReviewCount)} />
            <Metric label="Imported" value={formatNumber(data.fragrantica.importedCount)} />
            <Metric label="Merged" value={formatNumber(data.fragrantica.mergedCount)} />
            <Metric label="Tracked Brands" value={formatNumber(data.fragrantica.trackedBrands)} />
            <Metric label="Pending Connector Jobs" value={formatNumber(data.pendingConnectorJobs)} />
            <Metric label="Discovery Queue" value={formatNumber(data.discoveryQueue)} />
            <Metric label="Enrichment Queue" value={formatNumber(data.enrichmentQueue)} />
            <Metric label="Last Full Sweep" value={data.fragrantica.lastFullDiscoveryAt ?? "not yet completed"} />
            <Metric label="Last Sync" value={data.lastSynchronization} />
            <Metric label="Synchronization" value={data.synchronizationStatus} />
          </div>

          <article className="rounded border border-zinc-800 bg-zinc-900/55 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-300">Primary Flow</h2>
                <p className="mt-1 max-w-3xl text-sm text-zinc-400">
                  This flow searches Fragrantica, extracts the fields used for DNA compatibility, updates existing
                  perfumes, and inserts new perfumes that are not yet in the master database.
                </p>
              </div>
              <div className="rounded border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-xs text-zinc-400">
                <p>Cursor: {data.fragrantica.discoveryCursor}</p>
                <p>Sync cursor: {data.fragrantica.syncCursor}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <form action={runCompleteDatabaseSyncAction}>
                <button type="submit" className="rounded border border-fuchsia-400/40 bg-fuchsia-500/10 px-4 py-2 text-xs uppercase tracking-[0.1em] text-fuchsia-100 hover:bg-fuchsia-500/20">
                  Scan Fragrantica & Update DB
                </button>
              </form>
              <form action={refreshDiscoveryQueueAction}>
                <button type="submit" className="rounded border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-xs uppercase tracking-[0.1em] text-amber-100 hover:bg-amber-300/20">
                  Refresh Discovery Queue
                </button>
              </form>
              <form action={dryRunAllConnectorsAction}>
                <button type="submit" className="rounded border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-xs uppercase tracking-[0.1em] text-cyan-200 hover:bg-cyan-500/20">
                  Dry Run
                </button>
              </form>
              <form action={previewConnectorsAction}>
                <button type="submit" className="rounded border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs uppercase tracking-[0.1em] text-zinc-200 hover:border-amber-300/40">
                  Preview Queue Impact
                </button>
              </form>
            </div>

            <div className="mt-3 rounded border border-zinc-800 bg-zinc-950/50 p-3 text-sm text-zinc-300">
              <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Current status</p>
              <p className="mt-1">{data.fragrantica.message}</p>
            </div>
          </article>

          <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-300">Connector Dashboard</h2>
            <div className="mt-3 overflow-auto">
              <table className="w-full min-w-[1400px] border-collapse text-xs text-zinc-300">
                <thead className="bg-zinc-950/90 text-zinc-400">
                  <tr>
                    {[
                      "Connector",
                      "Status",
                      "Health",
                      "Last Run",
                      "Last Success",
                      "Exec Time",
                      "Coverage",
                      "Imported",
                      "Updated",
                      "Failed",
                      "Missing Fields",
                      "Pending",
                      "Discovery Queue",
                      "Enrichment Queue",
                      "Queue",
                      "Priority",
                      "Confidence",
                      "Actions",
                    ].map((header) => (
                      <th key={header} className="border-b border-zinc-800 px-2 py-2 text-left">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.dashboard.map((row) => (
                    <tr key={row.connector} className="border-b border-zinc-900/80">
                      <td className="px-2 py-2">{row.label}</td>
                      <td className="px-2 py-2">{row.status}</td>
                      <td className="px-2 py-2">{formatPercent(row.health)}</td>
                      <td className="px-2 py-2">{row.lastRun}</td>
                      <td className="px-2 py-2">{row.lastSuccessfulRun}</td>
                      <td className="px-2 py-2">{formatNumber(row.executionTimeMs)} ms</td>
                      <td className="px-2 py-2">{formatPercent(row.coverage)}</td>
                      <td className="px-2 py-2">{formatNumber(row.importedRecords)}</td>
                      <td className="px-2 py-2">{formatNumber(row.updatedRecords)}</td>
                      <td className="px-2 py-2">{formatNumber(row.failedRecords)}</td>
                      <td className="px-2 py-2">{formatNumber(row.missingFields)}</td>
                      <td className="px-2 py-2">{formatNumber(row.pendingJobs)}</td>
                      <td className="px-2 py-2">{formatNumber(row.discoveryPending)}</td>
                      <td className="px-2 py-2">{formatNumber(row.enrichmentPending)}</td>
                      <td className="px-2 py-2">{formatNumber(row.queueSize)}</td>
                      <td className="px-2 py-2">{formatNumber(row.priority)}</td>
                      <td className="px-2 py-2">{row.confidence.toFixed(2)}</td>
                      <td className="px-2 py-2">
                        <div className="flex flex-wrap gap-1">
                          <form action={runConnectorAction}>
                            <input type="hidden" name="connector" value={row.connector} />
                            <button type="submit" className="rounded border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-emerald-200">Run</button>
                          </form>
                          <form action={runConnectorAction}>
                            <input type="hidden" name="connector" value={row.connector} />
                            <input type="hidden" name="mode" value="dry-run" />
                            <button type="submit" className="rounded border border-cyan-400/40 bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-cyan-200">Dry</button>
                          </form>
                          <form action={retryFailedConnectorJobsAction}>
                            <input type="hidden" name="connector" value={row.connector} />
                            <button type="submit" className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-zinc-200">Retry</button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-300">Image Connector</h2>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-zinc-300">
                <Line label="Missing Images" value={formatNumber(data.imageConnector.missingImages)} />
                <Line label="Image Queue" value={formatNumber(data.imageConnector.queueSize)} />
                <Line label="Validated Images" value={formatNumber(data.imageConnector.validatedImages)} />
                <Line label="Image Health" value={formatPercent(data.imageConnector.health)} />
              </div>
              <p className="mt-3 text-[11px] uppercase tracking-[0.1em] text-zinc-500">Missing Image Report (sample IDs)</p>
              <div className="mt-2 max-h-[130px] overflow-auto rounded border border-zinc-800 bg-zinc-900/60 px-2 py-2 text-xs text-zinc-300">
                {data.imageConnector.detectedPerfumeIds.length > 0
                  ? data.imageConnector.detectedPerfumeIds.join(", ")
                  : "No missing image IDs."}
              </div>
            </article>

            <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-300">Fragrantica Discovery Connector</h2>
              <p className="mt-2 text-xs text-zinc-300">
                Real discovery scheduler with canonical matching, duplicate detection, candidate review, and automatic master-database handoff for approved discoveries.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-300">
                <Line label="Queue" value={formatNumber(data.discoveryStatistics.pendingDiscoveries)} />
                <Line label="New" value={formatNumber(data.discoveryStatistics.newDiscoveries)} />
                <Line label="Imported" value={formatNumber(data.discoveryStatistics.importedDiscoveries)} />
                <Line label="Canonical Matches" value={formatNumber(data.discoveryStatistics.canonicalMatches)} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-300">
                <Line label="Duplicates" value={formatNumber(data.discoveryStatistics.duplicateDiscoveries)} />
                <Line label="Rejected" value={formatNumber(data.discoveryStatistics.rejectedDiscoveries)} />
                <Line label="Ignored" value={formatNumber(data.discoveryStatistics.ignoredDiscoveries)} />
                <Line label="Average Confidence" value={formatPercent(data.discoveryStatistics.averageConfidence * 100)} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <form action={refreshDiscoveryQueueAction}>
                  <button type="submit" className="rounded border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.08em] text-amber-100 hover:bg-amber-300/20">
                    Sync Discovery Queue
                  </button>
                </form>
                <form action={previewConnectorsAction}>
                  <button type="submit" className="rounded border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-[10px] uppercase tracking-[0.08em] text-cyan-200 hover:bg-cyan-500/20">
                    Preview Queue Impact
                  </button>
                </form>
              </div>
              <div className="mt-3 rounded border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-300">
                <p className="text-[11px] uppercase tracking-[0.1em] text-zinc-500">Scheduler</p>
                <p className="mt-1">Last sync: {data.lastSynchronization}</p>
                <p className="mt-1">Discovery confidence: {formatPercent(data.discoveryStatistics.averageConfidence * 100)}</p>
                <p className="mt-1">Pending review items are routed into the master database after approval.</p>
              </div>
            </article>
          </div>

          <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-300">Discovery Review Queue</h2>
              <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.08em] text-zinc-500">
                <span className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1">Total {formatNumber(data.discoveryStatistics.totalCandidates)}</span>
                <span className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1">Approved {formatNumber(data.discoveryStatistics.approvedDiscoveries)}</span>
                <span className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1">Imported {formatNumber(data.discoveryStatistics.importedDiscoveries)}</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
              <Metric label="New Discoveries" value={formatNumber(data.discoveryStatistics.newDiscoveries)} />
              <Metric label="Pending Discoveries" value={formatNumber(data.discoveryStatistics.pendingDiscoveries)} />
              <Metric label="Imported Discoveries" value={formatNumber(data.discoveryStatistics.importedDiscoveries)} />
              <Metric label="Rejected Discoveries" value={formatNumber(data.discoveryStatistics.rejectedDiscoveries)} />
              <Metric label="Ignored Discoveries" value={formatNumber(data.discoveryStatistics.ignoredDiscoveries)} />
              <Metric label="Merged Discoveries" value={formatNumber(data.discoveryStatistics.mergedDiscoveries)} />
              <Metric label="Duplicate Candidates" value={formatNumber(data.discoveryStatistics.duplicateDiscoveries)} />
              <Metric label="Canonical Matches" value={formatNumber(data.discoveryStatistics.canonicalMatches)} />
            </div>

            <div className="mt-4 overflow-auto rounded border border-zinc-800 bg-zinc-950/55">
              <table className="w-full min-w-[1400px] border-collapse text-xs text-zinc-300">
                <thead className="bg-zinc-950/90 text-zinc-400">
                  <tr>
                    {[
                      "Perfume",
                      "Brand",
                      "Source",
                      "Confidence",
                      "Duplicates",
                      "Status",
                      "Matched Perfume",
                      "Actions",
                    ].map((header) => (
                      <th key={header} className="border-b border-zinc-800 px-2 py-2 text-left">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.discoveryCandidates.length > 0 ? (
                    data.discoveryCandidates.map((candidate) => (
                      <tr key={candidate.id} className="border-b border-zinc-900/80">
                        <td className="px-2 py-2">{candidate.perfume}</td>
                        <td className="px-2 py-2">{candidate.brand}</td>
                        <td className="px-2 py-2">{candidate.source}</td>
                        <td className="px-2 py-2">{formatPercent(candidate.confidence * 100)}</td>
                        <td className="px-2 py-2">{formatNumber(candidate.duplicateCount)}</td>
                        <td className="px-2 py-2">{formatDiscoveryStatus(candidate.status)}</td>
                        <td className="px-2 py-2">{candidate.matchedPerfumeId ?? "-"}</td>
                        <td className="px-2 py-2">
                          <div className="flex flex-wrap gap-1">
                            <DiscoveryActionForm
                              candidateId={candidate.id}
                              action="approve"
                              label="Approve"
                              className="rounded border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-emerald-200"
                            />
                            <DiscoveryActionForm
                              candidateId={candidate.id}
                              action="merge"
                              label="Merge"
                              className="rounded border border-cyan-400/40 bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-cyan-200"
                            />
                            <DiscoveryActionForm
                              candidateId={candidate.id}
                              action="reject"
                              label="Reject"
                              className="rounded border border-rose-400/40 bg-rose-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-rose-200"
                            />
                            <DiscoveryActionForm
                              candidateId={candidate.id}
                              action="ignore"
                              label="Ignore"
                              className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-zinc-200"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-2 py-4 text-zinc-500" colSpan={8}>
                        No discovery candidates are currently queued. Use Sync Discovery Queue to generate Fragrantica discovery items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
              <article className="rounded border border-zinc-800 bg-zinc-950/55 p-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">Discovery History</h3>
                <div className="mt-3 max-h-[260px] space-y-2 overflow-auto">
                  {data.discoveryHistory.length > 0 ? (
                    data.discoveryHistory.slice(0, 20).map((item) => (
                      <div key={item.id} className="rounded border border-zinc-800 bg-zinc-900/60 p-2 text-xs text-zinc-300">
                        <p className="text-zinc-100">{item.perfume} - {item.brand}</p>
                        <p className="text-zinc-500">{item.at}</p>
                        <p className="text-zinc-400">Action: {item.action ?? "discover"} | Status: {formatDiscoveryStatus(item.status)}</p>
                        <p className="text-zinc-500">{item.note}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-500">No discovery history available.</p>
                  )}
                </div>
              </article>

              <article className="rounded border border-zinc-800 bg-zinc-950/55 p-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">Discovery Statistics</h3>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-300">
                  <Line label="Total Candidates" value={formatNumber(data.discoveryStatistics.totalCandidates)} />
                  <Line label="Average Confidence" value={formatPercent(data.discoveryStatistics.averageConfidence * 100)} />
                  <Line label="Approved" value={formatNumber(data.discoveryStatistics.approvedDiscoveries)} />
                  <Line label="Matched Existing" value={formatNumber(data.discoveryStatistics.canonicalMatches)} />
                </div>
                <div className="mt-3 rounded border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-300">
                  Approved discoveries create completed Fragrantica discovery jobs so the Master Database pipeline can consume them on the next refresh.
                </div>
              </article>
            </div>
          </article>

          <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-300">Connector Registry</h2>
            <div className="mt-3 overflow-auto">
              <table className="w-full min-w-[900px] border-collapse text-xs text-zinc-300">
                <thead className="bg-zinc-950/90 text-zinc-400">
                  <tr>
                    {[
                      "Connector",
                      "Discovery",
                      "Enrichment",
                      "Skeleton",
                      "Description",
                    ].map((header) => (
                      <th key={header} className="border-b border-zinc-800 px-2 py-2 text-left">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.registry.map((item) => (
                    <tr key={item.connector} className="border-b border-zinc-900/80">
                      <td className="px-2 py-2">{item.label}</td>
                      <td className="px-2 py-2">{item.supportsDiscovery ? "yes" : "no"}</td>
                      <td className="px-2 py-2">{item.supportsEnrichment ? "yes" : "no"}</td>
                      <td className="px-2 py-2">{item.skeleton ? "yes" : "no"}</td>
                      <td className="px-2 py-2">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-300">Connector Configuration</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
              {data.connectorConfigs.map((item) => (
                <form key={item.connector} action={updateConnectorConfigAction} className="rounded border border-zinc-800 bg-zinc-900/60 p-3">
                  <input type="hidden" name="connector" value={item.connector} />
                  <p className="text-xs uppercase tracking-[0.1em] text-zinc-400">{item.label}</p>
                  <label className="mt-2 flex items-center gap-2 text-xs text-zinc-300">
                    <input type="checkbox" name="enabled" defaultChecked={item.config.enabled} />
                    Enabled
                  </label>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <label className="text-zinc-400">
                      Batch
                      <input type="number" name="batchSize" defaultValue={item.config.batchSize} className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-zinc-100" />
                    </label>
                    <label className="text-zinc-400">
                      Timeout ms
                      <input type="number" name="timeoutMs" defaultValue={item.config.timeoutMs} className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-zinc-100" />
                    </label>
                    <label className="text-zinc-400">
                      Priority
                      <input type="number" name="priority" defaultValue={item.config.priority} className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-zinc-100" />
                    </label>
                  </div>
                  <label className="mt-2 flex items-center gap-2 text-xs text-zinc-300">
                    <input type="checkbox" name="dryRunDefault" defaultChecked={item.config.dryRunDefault} />
                    Dry run by default
                  </label>
                  <button type="submit" className="mt-3 rounded border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-xs uppercase tracking-[0.1em] text-amber-100 hover:bg-amber-300/20">
                    Save Configuration
                  </button>
                </form>
              ))}
            </div>
          </article>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <HistoryCard title="Connector History" rows={data.recentHistory} />
            <HistoryCard title="Execution Logs" rows={data.executionLogs} />
          </div>
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

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/60 p-2">
      <p className="text-zinc-500">{label}</p>
      <p className="mt-1 text-zinc-100">{value}</p>
    </div>
  );
}

function HistoryCard({
  title,
  rows,
}: {
  title: string;
  rows: SourcesWorkspaceData["recentHistory"];
}) {
  return (
    <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-300">{title}</h2>
      <div className="mt-3 max-h-[260px] space-y-2 overflow-auto">
        {rows.length > 0 ? (
          rows.map((item) => (
            <div key={item.id} className="rounded border border-zinc-800 bg-zinc-900/60 p-2 text-xs text-zinc-300">
              <p className="text-zinc-100">{item.connector} - {item.runType}</p>
              <p className="text-zinc-400">{item.startedAt}</p>
              <p className="text-zinc-400">Status: {item.status}</p>
              <p className="text-zinc-400">Imported {formatNumber(item.importedRecords)} / Updated {formatNumber(item.updatedRecords)} / Failed {formatNumber(item.failedRecords)}</p>
              <p className="text-zinc-500">{item.note}</p>
            </div>
          ))
        ) : (
          <p className="text-xs text-zinc-500">No connector history available.</p>
        )}
      </div>
    </article>
  );
}

function DiscoveryActionForm({
  candidateId,
  action,
  label,
  className,
}: {
  candidateId: string;
  action: "approve" | "reject" | "ignore" | "merge";
  label: string;
  className: string;
}) {
  return (
    <form action={reviewDiscoveryCandidateAction}>
      <input type="hidden" name="candidateId" value={candidateId} />
      <input type="hidden" name="action" value={action} />
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
