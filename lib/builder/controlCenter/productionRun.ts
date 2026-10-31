import fs from "node:fs";
import path from "node:path";
import { createBuilderConfig } from "@/lib/builder/config";
import type { CanonicalMasterPerfumeObject } from "@/lib/builder/intelligence/canonicalBuilderIntelligence";

export type ExecutionStageName =
  | "import"
  | "normalize"
  | "brand-intelligence"
  | "knowledge"
  | "translation"
  | "fragrance-intelligence"
  | "metadata"
  | "validation"
  | "publish";

export type CheckpointStatus = "running" | "paused" | "failed" | "completed" | "cancel-requested";

export interface BuilderRunCheckpoint {
  runId: string;
  status: CheckpointStatus;
  currentStage: ExecutionStageName | null;
  lastCompletedStage: ExecutionStageName | null;
  processedPerfumes: number;
  totalPerfumes: number;
  processingLimit: number | null;
  retryAttempts: number;
  updatedAt: string;
  error: string | null;
}

export interface WorkingDatabaseSnapshot {
  versionId: string;
  runId: string;
  pipelineVersion: string;
  generatedAt: string;
  processingLimit: number | null;
  processedPerfumes: number;
  objects: CanonicalMasterPerfumeObject[];
}

interface DatabaseVersionRecord {
  versionId: string;
  kind: "working" | "published" | "archive";
  runId: string;
  createdAt: string;
  filePath: string;
  processedPerfumes: number;
}

interface DatabaseState {
  workingVersionId: string | null;
  publishedVersionId: string | null;
  lastPublishAt: string | null;
  lastRollbackAt: string | null;
  versions: DatabaseVersionRecord[];
}

export interface BuilderExecutionReport {
  executionId: string;
  executionTimestamp: string;
  executionDurationMs: number;
  builderVersion: string;
  processedPerfumes: number;
  newPerfumes: number;
  updatedPerfumes: number;
  skippedPerfumes: number;
  duplicates: number;
  automaticDecisions: number;
  manualReview: number;
  conflicts: number;
  conflictRate: number;
  automationRate: number;
  averageDecisionConfidence: number;
  imagesMissing: number;
  perfumersMissing: number;
  launchYearsMissing: number;
  notesMissing: number;
  accordsMissing: number;
  brandsMissing: number;
  topMissingFields: Array<{ field: string; count: number }>;
  topConflictFields: Array<{ field: string; count: number }>;
  topMissingBrands: Array<{ brand: string; count: number }>;
  connectorStatistics: {
    connectorHealth: number;
    connectorCoverage: number;
    pendingConnectorJobs: number;
    discoveryQueue: number;
    enrichmentQueue: number;
  };
  synchronizationStatistics: {
    status: "healthy" | "degraded";
    lastSynchronization: string;
    automaticEnrichment: number;
    newPerfumesFound: number;
  };
  builderHealth: "healthy" | "degraded";
  status: "success" | "failed";
}

const getProductionRoot = (): string => {
  const config = createBuilderConfig();
  return path.join(config.paths.publishRoot, "production-run");
};

const getStatePath = (): string => path.join(getProductionRoot(), "database-state.json");
const getWorkingPath = (): string => path.join(getProductionRoot(), "working-master-database.json");
const getPublishedPath = (): string => path.join(getProductionRoot(), "published-master-database.json");
const getCheckpointPath = (): string => path.join(getProductionRoot(), "checkpoint.json");
const getReportsDir = (): string => path.join(getProductionRoot(), "reports");
const getLatestReportPath = (): string => path.join(getReportsDir(), "latest-report.json");

const ensureProductionDirs = (): void => {
  fs.mkdirSync(getProductionRoot(), { recursive: true });
  fs.mkdirSync(getReportsDir(), { recursive: true });
};

const readState = (): DatabaseState => {
  const filePath = getStatePath();
  if (!fs.existsSync(filePath)) {
    return {
      workingVersionId: null,
      publishedVersionId: null,
      lastPublishAt: null,
      lastRollbackAt: null,
      versions: [],
    };
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as DatabaseState;
  } catch {
    return {
      workingVersionId: null,
      publishedVersionId: null,
      lastPublishAt: null,
      lastRollbackAt: null,
      versions: [],
    };
  }
};

const writeState = (state: DatabaseState): void => {
  ensureProductionDirs();
  fs.writeFileSync(getStatePath(), JSON.stringify(state, null, 2), "utf-8");
};

export const writeWorkingDatabaseSnapshot = (snapshot: WorkingDatabaseSnapshot): void => {
  ensureProductionDirs();
  fs.writeFileSync(getWorkingPath(), JSON.stringify(snapshot), "utf-8");

  const state = readState();
  const record: DatabaseVersionRecord = {
    versionId: snapshot.versionId,
    kind: "working",
    runId: snapshot.runId,
    createdAt: snapshot.generatedAt,
    filePath: getWorkingPath(),
    processedPerfumes: snapshot.processedPerfumes,
  };

  state.workingVersionId = snapshot.versionId;
  state.versions = [record, ...state.versions.filter((item) => item.versionId !== snapshot.versionId)].slice(0, 120);
  writeState(state);
};

export const publishWorkingDatabase = (runId: string): { published: boolean; versionId: string | null } => {
  ensureProductionDirs();
  if (!fs.existsSync(getWorkingPath())) {
    return { published: false, versionId: null };
  }

  const state = readState();
  const now = new Date().toISOString();
  const workingRaw = fs.readFileSync(getWorkingPath(), "utf-8");
  const working = JSON.parse(workingRaw) as WorkingDatabaseSnapshot;

  if (fs.existsSync(getPublishedPath()) && state.publishedVersionId) {
    const archivePath = path.join(getProductionRoot(), `archive-${state.publishedVersionId}.json`);
    fs.copyFileSync(getPublishedPath(), archivePath);
    const archiveRecord: DatabaseVersionRecord = {
      versionId: state.publishedVersionId,
      kind: "archive",
      runId,
      createdAt: now,
      filePath: archivePath,
      processedPerfumes: working.processedPerfumes,
    };
    state.versions = [
      archiveRecord,
      ...state.versions,
    ].slice(0, 120);
  }

  fs.writeFileSync(getPublishedPath(), workingRaw, "utf-8");

  const publishedVersion = `${working.versionId}-published`;
  const publishedRecord: DatabaseVersionRecord = {
    versionId: publishedVersion,
    kind: "published",
    runId,
    createdAt: now,
    filePath: getPublishedPath(),
    processedPerfumes: working.processedPerfumes,
  };
  state.publishedVersionId = publishedVersion;
  state.lastPublishAt = now;
  state.versions = [
    publishedRecord,
    ...state.versions,
  ].slice(0, 120);

  writeState(state);
  return { published: true, versionId: publishedVersion };
};

export const rollbackPublishedDatabase = (): { rolledBack: boolean; versionId: string | null } => {
  ensureProductionDirs();
  const state = readState();
  const archive = state.versions.find((item) => item.kind === "archive" && fs.existsSync(item.filePath));
  if (!archive) {
    return { rolledBack: false, versionId: null };
  }

  fs.copyFileSync(archive.filePath, getPublishedPath());
  state.publishedVersionId = `${archive.versionId}-rollback`;
  state.lastRollbackAt = new Date().toISOString();
  writeState(state);
  return { rolledBack: true, versionId: state.publishedVersionId };
};

export const readWorkingDatabaseSnapshot = (): WorkingDatabaseSnapshot | null => {
  if (!fs.existsSync(getWorkingPath())) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(getWorkingPath(), "utf-8")) as WorkingDatabaseSnapshot;
  } catch {
    return null;
  }
};

export const readPublishedDatabaseSnapshot = (): WorkingDatabaseSnapshot | null => {
  if (!fs.existsSync(getPublishedPath())) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(getPublishedPath(), "utf-8")) as WorkingDatabaseSnapshot;
  } catch {
    return null;
  }
};

export const getDatabaseStatus = (): {
  workingVersionId: string | null;
  publishedVersionId: string | null;
  lastPublishAt: string | null;
  lastRollbackAt: string | null;
  workingExists: boolean;
  publishedExists: boolean;
} => {
  const state = readState();
  return {
    workingVersionId: state.workingVersionId,
    publishedVersionId: state.publishedVersionId,
    lastPublishAt: state.lastPublishAt,
    lastRollbackAt: state.lastRollbackAt,
    workingExists: fs.existsSync(getWorkingPath()),
    publishedExists: fs.existsSync(getPublishedPath()),
  };
};

export const writeExecutionCheckpoint = (checkpoint: BuilderRunCheckpoint): void => {
  ensureProductionDirs();
  fs.writeFileSync(getCheckpointPath(), JSON.stringify(checkpoint, null, 2), "utf-8");
};

export const readExecutionCheckpoint = (): BuilderRunCheckpoint | null => {
  if (!fs.existsSync(getCheckpointPath())) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(getCheckpointPath(), "utf-8")) as BuilderRunCheckpoint;
  } catch {
    return null;
  }
};

export const writeExecutionReport = (report: BuilderExecutionReport): void => {
  ensureProductionDirs();
  const reportPath = path.join(getReportsDir(), `${report.executionId}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
  fs.writeFileSync(getLatestReportPath(), JSON.stringify(report, null, 2), "utf-8");
};

export const readLatestExecutionReport = (): BuilderExecutionReport | null => {
  if (!fs.existsSync(getLatestReportPath())) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(getLatestReportPath(), "utf-8")) as BuilderExecutionReport;
  } catch {
    return null;
  }
};
