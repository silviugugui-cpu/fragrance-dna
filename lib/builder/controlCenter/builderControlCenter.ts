import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createBuilderConfig } from "@/lib/builder/config";
import type { StageExecutionLog } from "@/lib/builder/logger";
import { runBuilderPipeline } from "@/lib/builder/pipeline/orchestrator";
import { PIPELINE_STAGE_ORDER } from "@/lib/builder/pipeline/registry";
import { createDefaultRawImportReader } from "@/lib/builder/rawImport";
import { loadKnowledgeWorkspaceData } from "@/lib/builder/knowledgeWorkspace/knowledgeWorkspace";
import { loadUnresolvedNoteReviewItems } from "@/lib/builder/review/unresolvedNotes";
import { runSprint1ValidationPack } from "@/lib/builder/validationPack/sprint1ValidationPack";
import { loadMasterDatabaseWorkspaceData } from "@/lib/builder/masterDatabaseWorkspace/masterDatabaseWorkspace";
import {
  loadBuilderDecisionWorkspaceData,
  type BuilderDecisionType,
} from "@/lib/builder/decisionEngine/decisionEngine";
import {
  generateDiscoveryJobsFromConnectors,
  generateConnectorJobsFromEnrichmentTasks,
  loadSourcesWorkspaceData,
} from "@/lib/builder/connectors/sourcesWorkspace";
import type { StageName } from "@/lib/builder/contracts";

export type BuilderJobType =
  | "full-run"
  | "stage-run"
  | "dry-run"
  | "rebuild-master-database"
  | "publish-master-database";

export type BuilderJobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface BuilderRunRecord {
  runId: string;
  fromStage: StageName;
  jobType: BuilderJobType;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  status: "success" | "failed";
  warningCount: number;
  errorCount: number;
  completedStages: number;
  totalStages: number;
  logs: StageExecutionLog[];
}

export interface BuilderJobRecord {
  jobId: string;
  runId: string | null;
  type: BuilderJobType;
  fromStage: StageName | null;
  status: BuilderJobStatus;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
  warningCount: number;
  errorCount: number;
  message: string | null;
}

export interface BuilderPublishRecord {
  id: string;
  publishedAt: string;
  version: string;
  runId: string;
  status: "success" | "failed";
}

export interface BuilderActivityRecord {
  id: string;
  at: string;
  type: "job-started" | "job-finished" | "job-failed" | "job-cancelled" | "publish";
  message: string;
}

export interface BuilderLiveExecutionData {
  status: "idle" | "running" | "cancel-requested";
  currentStage: StageName | null;
  currentPerfume: string | null;
  processedCount: number;
  remainingCount: number;
  progressPercent: number;
  estimatedRemainingSeconds: number | null;
  executionSpeedPerMinute: number;
  updatedAt: string;
}

interface BuilderOperationsState {
  currentJobId: string | null;
  cancelRequested: boolean;
  liveExecution: BuilderLiveExecutionData;
  queuedJobs: BuilderJobRecord[];
  jobs: BuilderJobRecord[];
  publishHistory: BuilderPublishRecord[];
  activities: BuilderActivityRecord[];
}

export interface BuilderControlCenterData {
  builderStatus: {
    state: "ready" | "degraded";
    latestRunStatus: "success" | "failed" | "not-run";
    pipelineVersion: string;
    generatedBy: string;
  };
  currentDataset: {
    workbookPath: string;
    importVersion: string;
    worksheetCount: number;
    totalRows: number;
    requiredHeaders: string[];
    identifierColumn: string;
  };
  processingQueue: Array<{
    stage: StageName;
    status: "pending" | "completed" | "failed";
    durationMs: number | null;
    warningCount: number;
    errorCount: number;
    artifactProduced: string | null;
  }>;
  progress: {
    completedStages: number;
    totalStages: number;
    completionPercent: number;
  };
  logs: StageExecutionLog[];
  errors: {
    total: number;
    latest: string[];
  };
  warnings: {
    total: number;
    latest: string[];
  };
  reviewQueue: {
    pendingReviews: number;
    unresolvedItemsPreview: Array<{ rawNote: string; count: number }>;
    knowledgeHealth: "review-required" | "healthy";
  };
  publish: {
    publishedCount: number;
    pendingReviewCount: number;
    validationErrors: number;
    readyForPublish: boolean;
  };
  recentRuns: BuilderRunRecord[];
  validationSummary: {
    totalPerfumes: number;
    executedRules: number;
    warningCount: number;
    errorCount: number;
    affectedPerfumes: number;
    executionTimeMs: number;
  };
  missionControl: {
    overallCompletionPercent: number;
    averageConfidence: number;
    automationPercent: number;
    automaticDecisions: number;
    manualDecisions: number;
    decisionAccuracy: number;
    reviewReduction: number;
    decisionDistribution: Array<{ decision: BuilderDecisionType; count: number }>;
    knowledgeCoveragePercent: number;
    masterDatabaseCoveragePercent: number;
    missingImages: number;
    missingPerfumers: number;
    missingLaunchYears: number;
    pendingEnrichmentJobs: number;
    connectorHealth: number;
    connectorCoverage: number;
    pendingConnectorJobs: number;
    discoveryQueue: number;
    enrichmentQueue: number;
    imageCoverage: number;
    lastSynchronization: string;
    newPerfumesFound: number;
    automaticEnrichment: number;
    synchronizationStatus: "healthy" | "degraded";
    pendingReview: number;
    automaticResolutions: number;
    latestExecution: string;
    currentPipelineVersion: string;
  };
  liveExecution: BuilderLiveExecutionData;
  jobs: {
    queued: BuilderJobRecord[];
    running: BuilderJobRecord[];
    completed: BuilderJobRecord[];
    failed: BuilderJobRecord[];
  };
  reviewMetrics: {
    pendingReviewQueue: number;
    automaticResolutions: number;
    manualResolutions: number;
    confidenceDistribution: Array<{ bucket: string; count: number }>;
  };
  decisionMetrics: {
    totalDecisions: number;
    automaticDecisions: number;
    manualDecisions: number;
    reviewRequired: number;
    decisionAccuracy: number;
    reviewReduction: number;
    automationPercent: number;
    decisionDistribution: Array<{ decision: BuilderDecisionType; count: number }>;
  };
  publishHistory: BuilderPublishRecord[];
  recentActivity: BuilderActivityRecord[];
}

const resolveReadableWorkbookPath = (configuredPath: string): string => {
  const configuredAbsolute = path.resolve(configuredPath);
  if (fs.existsSync(configuredAbsolute)) {
    return configuredAbsolute;
  }

  const preferred = path.resolve(process.cwd(), "public", "RawPerfumeDatabase.xlsx");
  if (fs.existsSync(preferred)) {
    return preferred;
  }

  const fallback = path.resolve(
    process.cwd(),
    "public",
    "FragranceDNA_RawPerfumeDatabase_Export.xlsx",
  );
  if (fs.existsSync(fallback)) {
    return fallback;
  }

  return configuredAbsolute;
};

const getRunsLogPath = (): string => {
  const config = createBuilderConfig();
  return path.join(config.paths.logsRoot, "builder-control-center-runs.json");
};

const getOperationsStatePath = (): string => {
  const config = createBuilderConfig();
  return path.join(config.paths.logsRoot, "builder-operations-state.json");
};

const ensureLogsDir = (): void => {
  const runsPath = getRunsLogPath();
  fs.mkdirSync(path.dirname(runsPath), { recursive: true });
};

const createDefaultLiveExecution = (): BuilderLiveExecutionData => ({
  status: "idle",
  currentStage: null,
  currentPerfume: null,
  processedCount: 0,
  remainingCount: 0,
  progressPercent: 0,
  estimatedRemainingSeconds: null,
  executionSpeedPerMinute: 0,
  updatedAt: new Date().toISOString(),
});

const readOperationsState = (): BuilderOperationsState => {
  const filePath = getOperationsStatePath();
  if (!fs.existsSync(filePath)) {
    return {
      currentJobId: null,
      cancelRequested: false,
      liveExecution: createDefaultLiveExecution(),
      queuedJobs: [],
      jobs: [],
      publishHistory: [],
      activities: [],
    };
  }

  try {
    const text = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(text) as Partial<BuilderOperationsState>;
    return {
      currentJobId: parsed.currentJobId ?? null,
      cancelRequested: parsed.cancelRequested ?? false,
      liveExecution: parsed.liveExecution ?? createDefaultLiveExecution(),
      queuedJobs: parsed.queuedJobs ?? [],
      jobs: parsed.jobs ?? [],
      publishHistory: parsed.publishHistory ?? [],
      activities: parsed.activities ?? [],
    };
  } catch {
    return {
      currentJobId: null,
      cancelRequested: false,
      liveExecution: createDefaultLiveExecution(),
      queuedJobs: [],
      jobs: [],
      publishHistory: [],
      activities: [],
    };
  }
};

const writeOperationsState = (state: BuilderOperationsState): void => {
  ensureLogsDir();
  fs.writeFileSync(getOperationsStatePath(), JSON.stringify(state, null, 2), "utf-8");
};

const appendActivity = (type: BuilderActivityRecord["type"], message: string): void => {
  const state = readOperationsState();
  const next: BuilderActivityRecord = {
    id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    type,
    message,
  };

  state.activities = [next, ...state.activities].slice(0, 80);
  writeOperationsState(state);
};

const readRecentRuns = (): BuilderRunRecord[] => {
  const runsPath = getRunsLogPath();
  if (!fs.existsSync(runsPath)) {
    return [];
  }

  try {
    const text = fs.readFileSync(runsPath, "utf-8");
    const parsed = JSON.parse(text) as BuilderRunRecord[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .slice()
      .sort((left, right) =>
        new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime(),
      )
      .slice(0, 20);
  } catch {
    return [];
  }
};

const writeRecentRuns = (runs: BuilderRunRecord[]): void => {
  ensureLogsDir();
  const runsPath = getRunsLogPath();
  fs.writeFileSync(runsPath, JSON.stringify(runs.slice(0, 50), null, 2), "utf-8");
};

const appendRunRecord = (record: BuilderRunRecord): void => {
  const existing = readRecentRuns();
  writeRecentRuns([record, ...existing]);
};

const createJobRecord = (input: {
  type: BuilderJobType;
  fromStage: StageName | null;
}): BuilderJobRecord => ({
  jobId: `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  runId: null,
  type: input.type,
  fromStage: input.fromStage,
  status: "queued",
  createdAt: new Date().toISOString(),
  startedAt: null,
  finishedAt: null,
  durationMs: null,
  warningCount: 0,
  errorCount: 0,
  message: null,
});

const upsertJob = (job: BuilderJobRecord): void => {
  const state = readOperationsState();
  const remaining = state.jobs.filter((entry) => entry.jobId !== job.jobId);
  state.jobs = [job, ...remaining].slice(0, 120);
  writeOperationsState(state);
};

const setCurrentJob = (jobId: string | null): void => {
  const state = readOperationsState();
  state.currentJobId = jobId;
  writeOperationsState(state);
};

const setCancelRequested = (value: boolean): void => {
  const state = readOperationsState();
  state.cancelRequested = value;
  if (value && state.liveExecution.status === "running") {
    state.liveExecution.status = "cancel-requested";
    state.liveExecution.updatedAt = new Date().toISOString();
  }
  writeOperationsState(state);
};

const setLiveExecution = (next: BuilderLiveExecutionData): void => {
  const state = readOperationsState();
  state.liveExecution = next;
  writeOperationsState(state);
};

const sumLogWarnings = (logs: StageExecutionLog[]): number =>
  logs.reduce((sum, log) => sum + log.warnings.length, 0);

const sumLogErrors = (logs: StageExecutionLog[]): number =>
  logs.reduce((sum, log) => sum + log.errors.length, 0);

const stageOrderFrom = (fromStage: StageName): StageName[] => {
  const index = PIPELINE_STAGE_ORDER.indexOf(fromStage);
  if (index < 0) {
    return PIPELINE_STAGE_ORDER;
  }
  return PIPELINE_STAGE_ORDER.slice(index);
};

const toRunRecord = (
  runId: string,
  fromStage: StageName,
  jobType: BuilderJobType,
  startedAt: string,
  finishedAt: string,
  logs: StageExecutionLog[],
): BuilderRunRecord => {
  const orderedStages = stageOrderFrom(fromStage);
  const completedStages = logs.filter((item) => item.status === "success").length;
  const errorCount = sumLogErrors(logs);

  return {
    runId,
    fromStage,
    jobType,
    startedAt,
    finishedAt,
    durationMs: new Date(finishedAt).getTime() - new Date(startedAt).getTime(),
    status: errorCount > 0 ? "failed" : "success",
    warningCount: sumLogWarnings(logs),
    errorCount,
    completedStages,
    totalStages: orderedStages.length,
    logs,
  };
};

export const runBuilderFromControlCenter = async (
  fromStage: StageName = "import",
  jobType: BuilderJobType = "full-run",
): Promise<BuilderRunRecord> => {
  const state = readOperationsState();
  if (state.currentJobId) {
    throw new Error("A Builder job is already running.");
  }

  const config = createBuilderConfig();
  const reader = createDefaultRawImportReader();
  const payload = reader.read({
    workbookPath: resolveReadableWorkbookPath(config.rawImport.workbookPath),
    worksheetNames: config.rawImport.worksheetNames,
    requiredHeaders: config.rawImport.requiredHeaders,
    identifierColumn: config.rawImport.identifierColumn,
    importVersion: config.rawImport.importVersion,
  });
  const totalRows = payload.rawDatabase.worksheets.reduce(
    (sum, worksheet) => sum + worksheet.rows.length,
    0,
  );

  const job = createJobRecord({ type: jobType, fromStage });
  job.status = "running";
  job.startedAt = new Date().toISOString();
  upsertJob(job);
  setCurrentJob(job.jobId);
  setCancelRequested(false);
  appendActivity("job-started", `Started ${job.type} from stage ${fromStage}.`);

  const startedAt = new Date().toISOString();

  try {
    const result = await runBuilderPipeline({
      fromStage,
      source: "studio-builder-control-center",
      shouldCancel: () => {
        const current = readOperationsState();
        return current.cancelRequested;
      },
      onStageStart: ({ stage, stageRunIndex, totalStages }) => {
        const elapsedSeconds = Math.max(1, (Date.now() - new Date(startedAt).getTime()) / 1000);
        const processedCount = Math.round((totalRows * (stageRunIndex - 1)) / totalStages);
        const remainingCount = Math.max(0, totalRows - processedCount);
        const speedPerMinute = Number(((processedCount / elapsedSeconds) * 60).toFixed(2));
        const estimatedRemainingSeconds =
          speedPerMinute > 0
            ? Math.round((remainingCount / speedPerMinute) * 60)
            : null;

        setLiveExecution({
          status: "running",
          currentStage: stage,
          currentPerfume: null,
          processedCount,
          remainingCount,
          progressPercent: Number(((processedCount / Math.max(1, totalRows)) * 100).toFixed(2)),
          estimatedRemainingSeconds,
          executionSpeedPerMinute: speedPerMinute,
          updatedAt: new Date().toISOString(),
        });
      },
      onStageComplete: ({ stageRunIndex, totalStages }) => {
        const elapsedSeconds = Math.max(1, (Date.now() - new Date(startedAt).getTime()) / 1000);
        const processedCount = Math.round((totalRows * stageRunIndex) / totalStages);
        const remainingCount = Math.max(0, totalRows - processedCount);
        const speedPerMinute = Number(((processedCount / elapsedSeconds) * 60).toFixed(2));
        const estimatedRemainingSeconds =
          speedPerMinute > 0
            ? Math.round((remainingCount / speedPerMinute) * 60)
            : null;

        setLiveExecution({
          status: "running",
          currentStage: null,
          currentPerfume: null,
          processedCount,
          remainingCount,
          progressPercent: Number(((processedCount / Math.max(1, totalRows)) * 100).toFixed(2)),
          estimatedRemainingSeconds,
          executionSpeedPerMinute: speedPerMinute,
          updatedAt: new Date().toISOString(),
        });
      },
    });

    const finishedAt = new Date().toISOString();
    const record = toRunRecord(result.runId, fromStage, jobType, startedAt, finishedAt, result.logs);
    await generateDiscoveryJobsFromConnectors();
    await generateConnectorJobsFromEnrichmentTasks();
    appendRunRecord(record);

    job.runId = record.runId;
    job.status = "completed";
    job.finishedAt = finishedAt;
    job.durationMs = record.durationMs;
    job.warningCount = record.warningCount;
    job.errorCount = record.errorCount;
    upsertJob(job);

    setCurrentJob(null);
    setCancelRequested(false);
    setLiveExecution(createDefaultLiveExecution());
    appendActivity("job-finished", `Completed ${job.type} (${record.runId}).`);
    return record;
  } catch (error) {
    const finishedAt = new Date().toISOString();
    const message = error instanceof Error ? error.message : "Builder run failed.";
    const cancelled = /cancelled/i.test(message);

    const failedRecord: BuilderRunRecord = {
      runId: `builder-run-${Date.now()}`,
      fromStage,
      jobType,
      startedAt,
      finishedAt,
      durationMs: new Date(finishedAt).getTime() - new Date(startedAt).getTime(),
      status: "failed",
      warningCount: 0,
      errorCount: 1,
      completedStages: 0,
      totalStages: stageOrderFrom(fromStage).length,
      logs: [
        {
          stage: fromStage,
          startTime: startedAt,
          finishTime: finishedAt,
          durationMs: new Date(finishedAt).getTime() - new Date(startedAt).getTime(),
          status: "failed",
          errors: [message],
          warnings: [],
          artifactProduced: null,
          artifactType: null,
          artifactVersion: null,
        },
      ],
    };

    appendRunRecord(failedRecord);

    job.runId = failedRecord.runId;
    job.status = cancelled ? "cancelled" : "failed";
    job.finishedAt = finishedAt;
    job.durationMs = failedRecord.durationMs;
    job.warningCount = failedRecord.warningCount;
    job.errorCount = failedRecord.errorCount;
    job.message = message;
    upsertJob(job);

    setCurrentJob(null);
    setCancelRequested(false);
    setLiveExecution(createDefaultLiveExecution());
    appendActivity(
      cancelled ? "job-cancelled" : "job-failed",
      `${cancelled ? "Cancelled" : "Failed"} ${job.type} (${failedRecord.runId}).`,
    );
    return failedRecord;
  }
};

const normalizeStage = (value: string | null): StageName => {
  if (!value) {
    return "import";
  }

  if (PIPELINE_STAGE_ORDER.includes(value as StageName)) {
    return value as StageName;
  }

  return "import";
};

export const runSelectedBuilderStage = async (stageValue: string | null): Promise<BuilderRunRecord> => {
  const stage = normalizeStage(stageValue);
  return runBuilderFromControlCenter(stage, "stage-run");
};

export const runBuilderDryRun = async (): Promise<BuilderRunRecord> => {
  const state = readOperationsState();
  if (state.currentJobId) {
    throw new Error("A Builder job is already running.");
  }

  const job = createJobRecord({ type: "dry-run", fromStage: null });
  job.status = "running";
  job.startedAt = new Date().toISOString();
  upsertJob(job);
  setCurrentJob(job.jobId);
  appendActivity("job-started", "Started dry run validation.");

  const startedAt = new Date().toISOString();
  try {
    const validation = await runSprint1ValidationPack();
    const finishedAt = new Date().toISOString();
    const durationMs = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
    const status: "success" | "failed" = validation.errorCount > 0 ? "failed" : "success";

    const record: BuilderRunRecord = {
      runId: `dry-run-${Date.now()}`,
      fromStage: "validation",
      jobType: "dry-run",
      startedAt,
      finishedAt,
      durationMs,
      status,
      warningCount: validation.warningCount,
      errorCount: validation.errorCount,
      completedStages: status === "success" ? 1 : 0,
      totalStages: 1,
      logs: [
        {
          stage: "validation",
          startTime: startedAt,
          finishTime: finishedAt,
          durationMs,
          status,
          warnings: validation.warningCount > 0 ? [`Warnings: ${validation.warningCount}`] : [],
          errors: validation.errorCount > 0 ? [`Errors: ${validation.errorCount}`] : [],
          artifactProduced: null,
          artifactType: null,
          artifactVersion: null,
        },
      ],
    };

    appendRunRecord(record);
    job.runId = record.runId;
    job.status = status === "success" ? "completed" : "failed";
    job.finishedAt = finishedAt;
    job.durationMs = durationMs;
    job.warningCount = validation.warningCount;
    job.errorCount = validation.errorCount;
    upsertJob(job);

    setCurrentJob(null);
    appendActivity(
      status === "success" ? "job-finished" : "job-failed",
      `Dry run ${status}.`,
    );

    return record;
  } catch (error) {
    const finishedAt = new Date().toISOString();
    const message = error instanceof Error ? error.message : "Dry run failed.";
    const durationMs = new Date(finishedAt).getTime() - new Date(startedAt).getTime();

    const record: BuilderRunRecord = {
      runId: `dry-run-${Date.now()}`,
      fromStage: "validation",
      jobType: "dry-run",
      startedAt,
      finishedAt,
      durationMs,
      status: "failed",
      warningCount: 0,
      errorCount: 1,
      completedStages: 0,
      totalStages: 1,
      logs: [
        {
          stage: "validation",
          startTime: startedAt,
          finishTime: finishedAt,
          durationMs,
          status: "failed",
          warnings: [],
          errors: [message],
          artifactProduced: null,
          artifactType: null,
          artifactVersion: null,
        },
      ],
    };

    appendRunRecord(record);
    job.runId = record.runId;
    job.status = "failed";
    job.finishedAt = finishedAt;
    job.durationMs = durationMs;
    job.errorCount = 1;
    job.message = message;
    upsertJob(job);
    setCurrentJob(null);
    appendActivity("job-failed", `Dry run failed (${record.runId}).`);
    return record;
  }
};

export const rebuildMasterDatabase = async (): Promise<BuilderRunRecord> =>
  runBuilderFromControlCenter("import", "rebuild-master-database");

export const publishMasterDatabase = async (): Promise<BuilderRunRecord> => {
  const result = await runBuilderFromControlCenter("import", "publish-master-database");
  const state = readOperationsState();
  const config = createBuilderConfig();
  const publishRecord: BuilderPublishRecord = {
    id: `publish-${Date.now()}`,
    publishedAt: new Date().toISOString(),
    version: config.pipelineVersion,
    runId: result.runId,
    status: result.status === "success" ? "success" : "failed",
  };

  state.publishHistory = [publishRecord, ...state.publishHistory].slice(0, 50);
  writeOperationsState(state);
  appendActivity("publish", `Published Master Database (${publishRecord.version}).`);
  return result;
};

export const cancelCurrentExecution = async (): Promise<boolean> => {
  const state = readOperationsState();
  if (!state.currentJobId) {
    return false;
  }

  setCancelRequested(true);
  appendActivity("job-cancelled", "Cancellation requested for current Builder job.");
  return true;
};

export const retryBuilderJob = async (jobIdOrRunId: string | null): Promise<BuilderRunRecord | null> => {
  if (!jobIdOrRunId) {
    return null;
  }

  const state = readOperationsState();
  const target = state.jobs.find((job) => job.jobId === jobIdOrRunId || job.runId === jobIdOrRunId);
  if (!target) {
    return null;
  }

  if (target.type === "dry-run") {
    return runBuilderDryRun();
  }

  if (target.type === "rebuild-master-database") {
    return rebuildMasterDatabase();
  }

  if (target.type === "publish-master-database") {
    return publishMasterDatabase();
  }

  return runBuilderFromControlCenter(target.fromStage ?? "import", target.type);
};

const buildConfidenceDistribution = (
  values: number[],
): Array<{ bucket: string; count: number }> => {
  const buckets: Array<{ key: string; min: number; max: number }> = [
    { key: "0.0-0.2", min: 0, max: 0.2 },
    { key: "0.2-0.4", min: 0.2, max: 0.4 },
    { key: "0.4-0.6", min: 0.4, max: 0.6 },
    { key: "0.6-0.8", min: 0.6, max: 0.8 },
    { key: "0.8-1.0", min: 0.8, max: 1.01 },
  ];

  return buckets.map((bucket) => ({
    bucket: bucket.key,
    count: values.filter((value) => value >= bucket.min && value < bucket.max).length,
  }));
};

export const loadBuilderControlCenterData = async (): Promise<BuilderControlCenterData> => {
  const config = createBuilderConfig();
  const reader = createDefaultRawImportReader();
  const decisionWorkspace = loadBuilderDecisionWorkspaceData();

  const payload = reader.read({
    workbookPath: resolveReadableWorkbookPath(config.rawImport.workbookPath),
    worksheetNames: config.rawImport.worksheetNames,
    requiredHeaders: config.rawImport.requiredHeaders,
    identifierColumn: config.rawImport.identifierColumn,
    importVersion: config.rawImport.importVersion,
  });

  const recentRuns = readRecentRuns();
  const latestRun = recentRuns[0] ?? null;
  const latestLogs = latestRun?.logs ?? [];

  const stageLogByName = new Map<StageName, StageExecutionLog>();
  for (const log of latestLogs) {
    stageLogByName.set(log.stage, log);
  }

  const processingQueue = PIPELINE_STAGE_ORDER.map((stage) => {
    const log = stageLogByName.get(stage);
    const status: "pending" | "completed" | "failed" = log
      ? log.status === "success"
        ? "completed"
        : "failed"
      : "pending";

    return {
      stage,
      status,
      durationMs: log?.durationMs ?? null,
      warningCount: log?.warnings.length ?? 0,
      errorCount: log?.errors.length ?? 0,
      artifactProduced: log?.artifactProduced ?? null,
    };
  });

  const completedStages = processingQueue.filter((item) => item.status === "completed").length;
  const validationSummary = await runSprint1ValidationPack();
  const reviewQueue = loadUnresolvedNoteReviewItems(10);
  const notesWorkspace = loadKnowledgeWorkspaceData("note");
  const masterDatabase = loadMasterDatabaseWorkspaceData();
  const sourcesWorkspace = await loadSourcesWorkspaceData();
  const operationsState = readOperationsState();

  const warningMessages = latestLogs.flatMap((log) =>
    log.warnings.map((warning) => `${log.stage}: ${warning}`),
  );
  const errorMessages = latestLogs.flatMap((log) =>
    log.errors.map((error) => `${log.stage}: ${error}`),
  );

  const totalRows = payload.rawDatabase.worksheets.reduce(
    (sum, worksheet) => sum + worksheet.rows.length,
    0,
  );

  const latestRunStatus: "success" | "failed" | "not-run" = latestRun
    ? latestRun.status
    : "not-run";

  const latestErrorCount = latestRun ? latestRun.errorCount : 0;

  const confidenceValues = Object.values(masterDatabase.detailsById).map(
    (detail) => detail.builder.confidence,
  );

  const queuedJobs = operationsState.jobs
    .filter((job) => job.status === "queued")
    .slice(0, 50);
  const runningJobs = operationsState.jobs
    .filter((job) => job.status === "running")
    .slice(0, 20);
  const completedJobs = operationsState.jobs
    .filter((job) => job.status === "completed")
    .slice(0, 50);
  const failedJobs = operationsState.jobs
    .filter((job) => job.status === "failed" || job.status === "cancelled")
    .slice(0, 50);

  const derivedLiveExecution: BuilderLiveExecutionData =
    runningJobs.length > 0
      ? operationsState.liveExecution
      : {
          status: "idle",
          currentStage: latestLogs.find((entry) => entry.status === "running")?.stage ?? null,
          currentPerfume: null,
          processedCount:
            latestRun && latestRun.totalStages > 0
              ? Math.round((totalRows * latestRun.completedStages) / latestRun.totalStages)
              : 0,
          remainingCount:
            latestRun && latestRun.totalStages > 0
              ? Math.max(
                  0,
                  totalRows - Math.round((totalRows * latestRun.completedStages) / latestRun.totalStages),
                )
              : totalRows,
          progressPercent:
            latestRun && latestRun.totalStages > 0
              ? Number(((latestRun.completedStages / latestRun.totalStages) * 100).toFixed(2))
              : 0,
          estimatedRemainingSeconds: null,
          executionSpeedPerMinute:
            latestRun && latestRun.durationMs > 0
              ? Number(((totalRows / latestRun.durationMs) * 60000).toFixed(2))
              : 0,
          updatedAt: new Date().toISOString(),
        };

  return {
    builderStatus: {
      state: latestErrorCount > 0 || validationSummary.errorCount > 0 ? "degraded" : "ready",
      latestRunStatus,
      pipelineVersion: config.pipelineVersion,
      generatedBy: config.generatedBy,
    },
    currentDataset: {
      workbookPath: payload.source.workbookPath,
      importVersion: payload.report.importVersion,
      worksheetCount: payload.rawDatabase.worksheets.length,
      totalRows,
      requiredHeaders: config.rawImport.requiredHeaders,
      identifierColumn: config.rawImport.identifierColumn,
    },
    processingQueue,
    progress: {
      completedStages,
      totalStages: PIPELINE_STAGE_ORDER.length,
      completionPercent: Number(((completedStages / PIPELINE_STAGE_ORDER.length) * 100).toFixed(2)),
    },
    logs: latestLogs,
    errors: {
      total: sumLogErrors(latestLogs) + validationSummary.errorCount,
      latest: errorMessages.slice(0, 20),
    },
    warnings: {
      total: sumLogWarnings(latestLogs) + validationSummary.warningCount,
      latest: warningMessages.slice(0, 20),
    },
    reviewQueue: {
      pendingReviews: reviewQueue.pendingReviews,
      unresolvedItemsPreview: reviewQueue.items.slice(0, 8).map((item) => ({
        rawNote: item.rawNote,
        count: item.occurrenceCount,
      })),
      knowledgeHealth: reviewQueue.knowledgeHealth,
    },
    publish: {
      publishedCount: masterDatabase.published,
      pendingReviewCount: masterDatabase.pendingReview,
      validationErrors: validationSummary.errorCount,
      readyForPublish:
        validationSummary.errorCount === 0 &&
        reviewQueue.pendingReviews === 0 &&
        masterDatabase.pendingReview === 0,
    },
    recentRuns,
    validationSummary: {
      totalPerfumes: validationSummary.totalPerfumes,
      executedRules: validationSummary.executedRules,
      warningCount: validationSummary.warningCount,
      errorCount: validationSummary.errorCount,
      affectedPerfumes: validationSummary.affectedPerfumes,
      executionTimeMs: validationSummary.executionTimeMs,
    },
    missionControl: {
      overallCompletionPercent: masterDatabase.overallCompletionPercent,
      averageConfidence: masterDatabase.averageBuilderConfidence,
      automationPercent: masterDatabase.automationPercentage,
      automaticDecisions: decisionWorkspace.automaticDecisions,
      manualDecisions: decisionWorkspace.manualDecisions,
      decisionAccuracy: decisionWorkspace.decisionAccuracy,
      reviewReduction: decisionWorkspace.reviewReduction,
      decisionDistribution: decisionWorkspace.decisionDistribution,
      knowledgeCoveragePercent: notesWorkspace.coveragePercent,
      masterDatabaseCoveragePercent: masterDatabase.coveragePercent,
      missingImages: masterDatabase.missingImages,
      missingPerfumers: masterDatabase.missingPerfumers,
      missingLaunchYears: masterDatabase.missingLaunchYears,
      pendingEnrichmentJobs: masterDatabase.pendingEnrichmentJobs,
      connectorHealth: sourcesWorkspace.connectorHealth,
      connectorCoverage: sourcesWorkspace.connectorCoverage,
      pendingConnectorJobs: sourcesWorkspace.pendingConnectorJobs,
      discoveryQueue: sourcesWorkspace.discoveryQueue,
      enrichmentQueue: sourcesWorkspace.enrichmentQueue,
      imageCoverage: sourcesWorkspace.imageCoverage,
      lastSynchronization: sourcesWorkspace.lastSynchronization,
      newPerfumesFound: sourcesWorkspace.newPerfumesFound,
      automaticEnrichment: sourcesWorkspace.automaticEnrichment,
      synchronizationStatus: sourcesWorkspace.synchronizationStatus,
      pendingReview: decisionWorkspace.reviewRequired,
      automaticResolutions: decisionWorkspace.automaticDecisions,
      latestExecution: latestRun?.finishedAt ?? "never",
      currentPipelineVersion: config.pipelineVersion,
    },
    liveExecution: derivedLiveExecution,
    jobs: {
      queued: queuedJobs,
      running: runningJobs,
      completed: completedJobs,
      failed: failedJobs,
    },
    reviewMetrics: {
      pendingReviewQueue: reviewQueue.pendingReviews,
      automaticResolutions: masterDatabase.automaticResolutions,
      manualResolutions: reviewQueue.pendingReviews,
      confidenceDistribution: buildConfidenceDistribution(confidenceValues),
    },
    decisionMetrics: {
      totalDecisions: decisionWorkspace.totalDecisions,
      automaticDecisions: decisionWorkspace.automaticDecisions,
      manualDecisions: decisionWorkspace.manualDecisions,
      reviewRequired: decisionWorkspace.reviewRequired,
      decisionAccuracy: decisionWorkspace.decisionAccuracy,
      reviewReduction: decisionWorkspace.reviewReduction,
      automationPercent: decisionWorkspace.automationPercent,
      decisionDistribution: decisionWorkspace.decisionDistribution,
    },
    publishHistory: operationsState.publishHistory.slice(0, 20),
    recentActivity: operationsState.activities.slice(0, 30),
  };
};
