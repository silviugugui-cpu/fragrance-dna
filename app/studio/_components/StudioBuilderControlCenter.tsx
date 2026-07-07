"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { PIPELINE_STAGE_ORDER } from "@/lib/builder/pipeline/registry";
import type { BuilderControlCenterData, BuilderJobRecord } from "@/lib/builder/controlCenter/builderControlCenter";
import {
  cancelExecutionAction,
  publishMasterDatabaseAction,
  rebuildMasterDatabaseAction,
  retryJobAction,
  runBuilderNowAction,
  runDryRunAction,
  runSelectedStageAction,
} from "@/app/studio/_actions/builderControlActions";

type OperationsSection =
  | "mission-control"
  | "run-builder"
  | "live-execution"
  | "jobs"
  | "review"
  | "publish"
  | "logs";

type MissionOpenTarget = OperationsSection | "sources";

interface StudioBuilderControlCenterProps {
  data: BuilderControlCenterData | null;
  loadError?: string;
  workspaceLabel: string;
  initialSection?: OperationsSection;
}

const safeNumber = (value: number | null | undefined): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const formatNumber = (value: number | null | undefined): string =>
  new Intl.NumberFormat("en-US").format(safeNumber(value));

const formatPercent = (value: number | null | undefined): string =>
  `${safeNumber(value).toFixed(2)}%`;

const formatFixed = (value: number | null | undefined, digits: number = 2): string =>
  safeNumber(value).toFixed(digits);

const sectionLabels: Record<OperationsSection, string> = {
  "mission-control": "Mission Control",
  "run-builder": "Run Builder",
  "live-execution": "Live Execution",
  jobs: "Jobs",
  review: "Review",
  publish: "Publish",
  logs: "Logs",
};

const primaryButtonClass =
  "w-full rounded border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-500/20";
const secondaryButtonClass =
  "w-full rounded border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20";
const compactSecondaryButtonClass =
  "rounded border border-amber-300/40 bg-amber-300/10 px-2 py-1.5 text-xs font-medium text-amber-100 hover:bg-amber-300/20";
const dangerButtonClass =
  "w-full rounded border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-200 hover:bg-rose-500/20";

const statusColor: Record<string, string> = {
  completed: "text-emerald-300",
  failed: "text-rose-300",
  cancelled: "text-amber-300",
  running: "text-cyan-300",
  queued: "text-zinc-300",
};

export function StudioBuilderControlCenter({
  data,
  loadError,
  workspaceLabel,
  initialSection = "mission-control",
}: StudioBuilderControlCenterProps) {
  const [activeSection, setActiveSection] = useState<OperationsSection>(initialSection);
  const [logFilter, setLogFilter] = useState<"all" | "warning" | "error">("all");
  const [logSearch, setLogSearch] = useState("");

  const logRows = useMemo(() => {
    if (!data) {
      return [] as Array<{ type: "warning" | "error"; message: string; source: string }>;
    }

    const warnings = data.warnings.latest.map((message) => ({
      type: "warning" as const,
      message,
      source: "warnings",
    }));

    const errors = data.errors.latest.map((message) => ({
      type: "error" as const,
      message,
      source: "errors",
    }));

    const entries = [...errors, ...warnings];
    const normalizedSearch = logSearch.trim().toLowerCase();

    return entries.filter((entry) => {
      const matchesFilter = logFilter === "all" || entry.type === logFilter;
      const matchesSearch =
        normalizedSearch.length === 0 || entry.message.toLowerCase().includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [data, logFilter, logSearch]);

  const downloadLogs = () => {
    const blob = new Blob([JSON.stringify(logRows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `builder-logs-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="overflow-hidden rounded-xl border border-amber-200/15 bg-zinc-950/80 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <header className="border-b border-amber-200/10 bg-zinc-950/90 px-4 py-3 lg:px-5">
        <h1 className="text-xl font-semibold tracking-tight text-amber-100">
          Builder Operations Workspace
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Operational console for Builder. Entry point: {workspaceLabel}.
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
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-20">
            <TopMetric label="Status" value={data.builderStatus.state} />
            <TopMetric label="Dataset Rows" value={formatNumber(data.currentDataset.totalRows)} />
            <TopMetric label="Pipeline" value={data.missionControl.currentPipelineVersion} />
            <TopMetric label="Latest Execution" value={data.builderStatus.latestRunStatus} />
            <TopMetric label="Overall Completion" value={formatPercent(data.missionControl.overallCompletionPercent)} />
            <TopMetric label="Average Confidence" value={formatFixed(data.missionControl.averageConfidence)} />
            <TopMetric label="Automation %" value={formatPercent(data.missionControl.automationPercent)} />
            <TopMetric label="Automatic Decisions" value={formatNumber(data.missionControl.automaticDecisions)} />
            <TopMetric label="Manual Decisions" value={formatNumber(data.missionControl.manualDecisions)} />
            <TopMetric label="Decision Accuracy" value={formatPercent(data.missionControl.decisionAccuracy)} />
            <TopMetric label="Review Reduction" value={formatPercent(data.missionControl.reviewReduction)} />
            <TopMetric label="Knowledge %" value={formatPercent(data.missionControl.knowledgeCoveragePercent)} />
            <TopMetric label="Master %" value={formatPercent(data.missionControl.masterDatabaseCoveragePercent)} />
            <TopMetric label="Missing Images" value={formatNumber(data.missionControl.missingImages)} />
            <TopMetric label="Missing Perfumers" value={formatNumber(data.missionControl.missingPerfumers)} />
            <TopMetric label="Missing Launch Years" value={formatNumber(data.missionControl.missingLaunchYears)} />
            <TopMetric label="Pending Enrichment" value={formatNumber(data.missionControl.pendingEnrichmentJobs)} />
            <TopMetric label="Connector Health" value={formatPercent(data.missionControl.connectorHealth)} />
            <TopMetric label="Connector Coverage" value={formatPercent(data.missionControl.connectorCoverage)} />
            <TopMetric label="Pending Connector Jobs" value={formatNumber(data.missionControl.pendingConnectorJobs)} />
            <TopMetric label="Discovery Queue" value={formatNumber(data.missionControl.discoveryQueue)} />
            <TopMetric label="Enrichment Queue" value={formatNumber(data.missionControl.enrichmentQueue)} />
            <TopMetric label="Image Coverage" value={formatPercent(data.missionControl.imageCoverage)} />
            <TopMetric label="New Perfumes Found" value={formatNumber(data.missionControl.newPerfumesFound)} />
            <TopMetric label="Automatic Enrichment" value={formatNumber(data.missionControl.automaticEnrichment)} />
            <TopMetric label="Last Synchronization" value={data.missionControl.lastSynchronization} />
            <TopMetric label="Sync Status" value={data.missionControl.synchronizationStatus} />
            <TopMetric label="Pending Review" value={formatNumber(data.missionControl.pendingReview)} />
            <TopMetric label="Validation Errors" value={formatNumber(data.validationSummary.errorCount)} />
          </div>

          <div className="flex flex-wrap gap-2 rounded border border-zinc-800 bg-zinc-900/45 p-2">
            {(Object.keys(sectionLabels) as OperationsSection[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSection(key)}
                className={`rounded border px-3 py-1.5 text-xs uppercase tracking-[0.12em] ${
                  activeSection === key
                    ? "border-amber-300/50 bg-amber-300/10 text-amber-100"
                    : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-amber-300/30"
                }`}
              >
                {sectionLabels[key]}
              </button>
            ))}
          </div>

          {activeSection === "mission-control" ? (
            <MissionControlSection
              data={data}
              onOpenSection={(section) => {
                if (section === "sources") {
                  window.location.href = "/studio/sources";
                  return;
                }

                setActiveSection(section);
              }}
            />
          ) : null}
          {activeSection === "run-builder" ? <RunBuilderSection /> : null}
          {activeSection === "live-execution" ? <LiveExecutionSection data={data} /> : null}
          {activeSection === "jobs" ? <JobsSection data={data} /> : null}
          {activeSection === "review" ? <ReviewSection data={data} /> : null}
          {activeSection === "publish" ? <PublishSection data={data} /> : null}
          {activeSection === "logs" ? (
            <LogsSection
              data={data}
              logRows={logRows}
              logFilter={logFilter}
              logSearch={logSearch}
              setLogFilter={setLogFilter}
              setLogSearch={setLogSearch}
              onDownload={downloadLogs}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function MissionControlSection({
  data,
  onOpenSection,
}: {
  data: BuilderControlCenterData;
  onOpenSection: (section: MissionOpenTarget) => void;
}) {
  const cards: Array<{ title: string; value: string; sub: string; section: MissionOpenTarget }> = [
    {
      title: "Run Builder",
      value: data.builderStatus.latestRunStatus,
      sub: `Progress ${formatPercent(data.progress.completionPercent)}`,
      section: "run-builder",
    },
    {
      title: "Live Execution",
      value: data.liveExecution.status,
      sub: data.liveExecution.currentStage ?? "No running stage",
      section: "live-execution",
    },
    {
      title: "Jobs",
      value: `${data.jobs.running.length} running`,
      sub: `${data.jobs.failed.length} failed`,
      section: "jobs",
    },
    {
      title: "Review",
      value: formatNumber(data.missionControl.pendingReview),
      sub: `Auto ${formatNumber(data.missionControl.automaticDecisions)} / Manual ${formatNumber(data.missionControl.manualDecisions)}`,
      section: "review",
    },
    {
      title: "Decision Accuracy",
      value: formatPercent(data.missionControl.decisionAccuracy),
      sub: `Review reduction ${formatPercent(data.missionControl.reviewReduction)}`,
      section: "review",
    },
    {
      title: "Publish",
      value: data.publish.readyForPublish ? "ready" : "blocked",
      sub: `History ${data.publishHistory.length}`,
      section: "publish",
    },
    {
      title: "Logs",
      value: `${formatNumber(data.errors.total)} errors`,
      sub: `${formatNumber(data.warnings.total)} warnings`,
      section: "logs",
    },
    {
      title: "Sources",
      value: formatNumber(data.missionControl.pendingConnectorJobs),
      sub: `Discovery ${formatNumber(data.missionControl.discoveryQueue)} / Enrichment ${formatNumber(data.missionControl.enrichmentQueue)}`,
      section: "sources",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
      {cards.map((card) => (
        <button
          key={card.title}
          type="button"
          onClick={() => onOpenSection(card.section)}
          className="rounded border border-zinc-800 bg-zinc-900/55 p-3 text-left hover:border-amber-300/35"
        >
          <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{card.title}</p>
          <p className="mt-1 text-lg font-semibold text-zinc-100">{card.value}</p>
          <p className="mt-1 text-xs text-zinc-400">{card.sub}</p>
        </button>
      ))}
    </div>
  );
}

function RunBuilderSection() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      <ActionCard title="Run Full Builder" description="Execute complete pipeline from import to publish.">
        <form action={runBuilderNowAction}>
          <button type="submit" className={primaryButtonClass}>Run Full Builder</button>
        </form>
      </ActionCard>

      <ActionCard title="Run Selected Stage" description="Execute a specific stage from pipeline order.">
        <form action={runSelectedStageAction} className="space-y-2">
          <select
            name="stage"
            defaultValue="import"
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm text-zinc-100 focus:border-amber-300/40 focus:outline-none"
          >
            {PIPELINE_STAGE_ORDER.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
          <button type="submit" className={secondaryButtonClass}>Run Selected Stage</button>
        </form>
      </ActionCard>

      <ActionCard title="Dry Run" description="Execute validation-only operational dry run.">
        <form action={runDryRunAction}>
          <button type="submit" className={secondaryButtonClass}>Run Dry Run</button>
        </form>
      </ActionCard>

      <ActionCard title="Rebuild Master Database" description="Rebuild canonical Master Database through full Builder.">
        <form action={rebuildMasterDatabaseAction}>
          <button type="submit" className={secondaryButtonClass}>Rebuild Master Database</button>
        </form>
      </ActionCard>

      <ActionCard title="Publish Master Database" description="Run publish operation using current Builder pipeline.">
        <form action={publishMasterDatabaseAction}>
          <button type="submit" className={secondaryButtonClass}>Publish Master Database</button>
        </form>
      </ActionCard>

      <ActionCard title="Cancel Current Execution" description="Request cancellation for the running Builder job.">
        <form action={cancelExecutionAction}>
          <button type="submit" className={dangerButtonClass}>Cancel Current Execution</button>
        </form>
      </ActionCard>
    </div>
  );
}

function LiveExecutionSection({ data }: { data: BuilderControlCenterData }) {
  const live = data.liveExecution;
  const progress = Math.max(0, Math.min(100, live.progressPercent));
  return (
    <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">Live Execution</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <PairLine label="Current Stage" value={live.currentStage ?? "idle"} />
        <PairLine label="Current Perfume" value={live.currentPerfume ?? "N/A from pipeline state"} />
        <PairLine label="Processed" value={formatNumber(live.processedCount)} />
        <PairLine label="Remaining" value={formatNumber(live.remainingCount)} />
        <PairLine label="Execution Speed" value={`${formatNumber(live.executionSpeedPerMinute)} / min`} />
        <PairLine label="Estimated Remaining" value={live.estimatedRemainingSeconds ? `${formatNumber(live.estimatedRemainingSeconds)} sec` : "N/A"} />
        <PairLine label="Status" value={live.status} />
        <PairLine label="Updated" value={live.updatedAt} />
      </div>
      <div className="mt-4">
        <p className="text-xs text-zinc-400">Progress</p>
        <div className="mt-1 h-3 overflow-hidden rounded bg-zinc-800">
          <div className="h-full bg-emerald-500/70" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1 text-xs text-zinc-300">{formatPercent(progress)}</p>
      </div>
    </article>
  );
}

function JobsSection({ data }: { data: BuilderControlCenterData }) {
  return (
    <div className="space-y-3">
      <JobGroup title="Queued Jobs" jobs={data.jobs.queued} />
      <JobGroup title="Running Jobs" jobs={data.jobs.running} />
      <JobGroup title="Completed Jobs" jobs={data.jobs.completed} />
      <JobGroup title="Failed Jobs" jobs={data.jobs.failed} showRetry />
    </div>
  );
}

function JobGroup({
  title,
  jobs,
  showRetry = false,
}: {
  title: string;
  jobs: BuilderJobRecord[];
  showRetry?: boolean;
}) {
  return (
    <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">{title}</h2>
      <div className="mt-2 space-y-2">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job.jobId} className="rounded border border-zinc-800 bg-zinc-900/60 p-2 text-xs">
              <p className="text-zinc-100">{job.type}</p>
              <p className="mt-1 text-zinc-400">Job: {job.jobId}</p>
              <p className="text-zinc-400">Run: {job.runId ?? "n/a"}</p>
              <p className="text-zinc-400">From stage: {job.fromStage ?? "n/a"}</p>
              <p className={`mt-1 ${statusColor[job.status] ?? "text-zinc-300"}`}>{job.status}</p>
              <p className="text-zinc-500">Warnings {job.warningCount} / Errors {job.errorCount}</p>
              <p className="text-zinc-500">Duration {job.durationMs ? `${job.durationMs}ms` : "-"}</p>
              {showRetry ? (
                <form action={retryJobAction} className="mt-2">
                  <input type="hidden" name="jobId" value={job.jobId} />
                  <button type="submit" className={compactSecondaryButtonClass}>Retry</button>
                </form>
              ) : null}
            </div>
          ))
        ) : (
          <p className="text-xs text-zinc-500">No jobs.</p>
        )}
      </div>
    </article>
  );
}

function ReviewSection({ data }: { data: BuilderControlCenterData }) {
  return (
    <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">Review</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <PairLine label="Pending Review Queue" value={formatNumber(data.missionControl.pendingReview)} />
        <PairLine label="Automatic Decisions" value={formatNumber(data.missionControl.automaticDecisions)} />
        <PairLine label="Manual Decisions" value={formatNumber(data.missionControl.manualDecisions)} />
        <PairLine label="Decision Accuracy" value={formatPercent(data.missionControl.decisionAccuracy)} />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
        <article className="rounded border border-zinc-800 bg-zinc-900/60 p-2">
          <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Decision Distribution</p>
          <div className="mt-2 space-y-1">
            {data.missionControl.decisionDistribution.map((entry) => (
              <div key={entry.decision} className="flex items-center justify-between text-xs text-zinc-300">
                <span>{entry.decision}</span>
                <span>{formatNumber(entry.count)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded border border-zinc-800 bg-zinc-900/60 p-2">
          <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Confidence Distribution</p>
          <div className="mt-2 space-y-1">
            {data.reviewMetrics.confidenceDistribution.map((entry) => (
              <div key={entry.bucket} className="flex items-center justify-between text-xs text-zinc-300">
                <span>{entry.bucket}</span>
                <span>{formatNumber(entry.count)}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </article>
  );
}

function PublishSection({ data }: { data: BuilderControlCenterData }) {
  return (
    <div className="space-y-3">
      <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">Publish Master Database</h2>
        <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <PairLine label="Published" value={formatNumber(data.publish.publishedCount)} />
          <PairLine label="Last Publish" value={data.publishHistory[0]?.publishedAt ?? "never"} />
          <PairLine label="Published Version" value={data.publishHistory[0]?.version ?? data.builderStatus.pipelineVersion} />
          <PairLine label="Ready For Publish" value={data.publish.readyForPublish ? "true" : "false"} />
        </div>
        <form action={publishMasterDatabaseAction} className="mt-3">
          <button type="submit" className={primaryButtonClass}>Publish Master Database</button>
        </form>
      </article>

      <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">Publish History</h2>
        <div className="mt-2 space-y-2">
          {data.publishHistory.length > 0 ? (
            data.publishHistory.map((item) => (
              <div key={item.id} className="rounded border border-zinc-800 bg-zinc-900/60 p-2 text-xs">
                <p className="text-zinc-100">Version {item.version}</p>
                <p className="text-zinc-400">Run {item.runId}</p>
                <p className="text-zinc-400">Published {item.publishedAt}</p>
                <p className={item.status === "success" ? "text-emerald-300" : "text-rose-300"}>{item.status}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-zinc-500">No publish history.</p>
          )}
        </div>
      </article>
    </div>
  );
}

function LogsSection({
  data,
  logRows,
  logFilter,
  logSearch,
  setLogFilter,
  setLogSearch,
  onDownload,
}: {
  data: BuilderControlCenterData;
  logRows: Array<{ type: "warning" | "error"; message: string; source: string }>;
  logFilter: "all" | "warning" | "error";
  logSearch: string;
  setLogFilter: (value: "all" | "warning" | "error") => void;
  setLogSearch: (value: string) => void;
  onDownload: () => void;
}) {
  return (
    <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">Logs</h2>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select
          value={logFilter}
          onChange={(event) => setLogFilter(event.target.value as "all" | "warning" | "error")}
          className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-100"
        >
          <option value="all">All</option>
          <option value="warning">Warnings</option>
          <option value="error">Errors</option>
        </select>
        <input
          value={logSearch}
          onChange={(event) => setLogSearch(event.target.value)}
          placeholder="Search logs"
          className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500"
        />
        <button type="button" onClick={onDownload} className={compactSecondaryButtonClass}>
          Download
        </button>
        <Link href="/studio/review" className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-200 hover:border-amber-300/40">
          Open Review Queue
        </Link>
      </div>

      <div className="mt-3 max-h-[360px] space-y-1 overflow-auto">
        {logRows.length > 0 ? (
          logRows.map((row, index) => (
            <div key={`${row.type}-${index}`} className="rounded border border-zinc-800 bg-zinc-900/60 px-2 py-1.5 text-xs">
              <p className={row.type === "error" ? "text-rose-300" : "text-amber-200"}>{row.type.toUpperCase()}</p>
              <p className="mt-1 text-zinc-200">{row.message}</p>
            </div>
          ))
        ) : (
          <p className="text-xs text-zinc-500">No logs for current filter/search.</p>
        )}
      </div>

      <div className="mt-3 rounded border border-zinc-800 bg-zinc-900/60 p-2 text-xs text-zinc-300">
        <p>Execution logs: {formatNumber(data.logs.length)}</p>
        <p>Warnings: {formatNumber(data.warnings.total)}</p>
        <p>Errors: {formatNumber(data.errors.total)}</p>
      </div>
    </article>
  );
}

function TopMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded border border-zinc-800 bg-zinc-900/55 p-2">
      <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-100">{value}</p>
    </article>
  );
}

function ActionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
      <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">{title}</p>
      <p className="mt-1 text-xs text-zinc-400">{description}</p>
      <div className="mt-3">{children}</div>
    </article>
  );
}

function PairLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/60 p-2 text-xs">
      <p className="text-zinc-500">{label}</p>
      <p className="mt-1 text-zinc-100">{value}</p>
    </div>
  );
}
