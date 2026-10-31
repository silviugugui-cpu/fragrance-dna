import "server-only";
import fs from "node:fs";
import path from "node:path";
import {
  connectorLabel,
  readConnectorState,
  writeConnectorState,
  type ConnectorConfig,
  type ConnectorConflictRecord,
  type ConnectorDiscoveredCandidate,
  type ConnectorHistoryItem,
  type ConnectorJob,
  type ConnectorJobStatus,
  type ConnectorRegistryItem,
  type ConnectorSynchronizedField,
  type ConnectorState,
  type ConnectorType,
  type ConnectorWorkflow,
} from "@/lib/builder/connectors/connectorState";
import {
  loadMasterDatabaseWorkspaceData,
  type EnrichmentTask,
} from "@/lib/builder/masterDatabaseWorkspace/masterDatabaseWorkspace";
import {
  getCachedFragranticaDatasetStats,
  getAllFragranticaSnapshots,
  listFragranticaSnapshots,
  searchFragranticaFragrances,
  type FragranticaSnapshot,
} from "@/lib/builder/connectors/fragranticaConnector";
import { searchParfumoFragrances, type ParfumoSnapshot } from "@/lib/builder/connectors/parfumoConnector";
import {
  loadManufacturerSites,
  resolveManufacturerTruth,
  searchManufacturerFragrances,
  type ManufacturerSnapshot,
} from "@/lib/builder/connectors/manufacturerConnector";

export interface SourcesConnectorDashboardItem {
  connector: ConnectorType;
  label: string;
  status: "idle" | "running" | "error";
  health: number;
  lastRun: string;
  lastSuccessfulRun: string;
  executionTimeMs: number;
  coverage: number;
  importedRecords: number;
  updatedRecords: number;
  failedRecords: number;
  missingFields: number;
  pendingJobs: number;
  discoveryPending: number;
  enrichmentPending: number;
  queueSize: number;
  confidence: number;
  enabled: boolean;
  priority: number;
}

export interface SourcesWorkspaceData {
  generatedAt: string;
  connectorHealth: number;
  connectorCoverage: number;
  pendingConnectorJobs: number;
  discoveryQueue: number;
  enrichmentQueue: number;
  imageCoverage: number;
  newPerfumesFound: number;
  automaticEnrichment: number;
  lastSynchronization: string;
  synchronizationStatus: "healthy" | "degraded";
  dashboard: SourcesConnectorDashboardItem[];
  registry: ConnectorRegistryItem[];
  imageConnector: {
    missingImages: number;
    detectedPerfumeIds: string[];
    queueSize: number;
    validatedImages: number;
    health: number;
  };
  previews: Array<{
    connector: ConnectorType;
    discoveryTasks: number;
    enrichmentTasks: number;
    previewJobs: number;
    topFields: Array<{ field: string; count: number }>;
  }>;
  recentHistory: ConnectorHistoryItem[];
  executionLogs: ConnectorHistoryItem[];
  connectorConfigs: Array<{ connector: ConnectorType; label: string; config: ConnectorConfig }>;
  discoveryStatistics: {
    totalCandidates: number;
    newDiscoveries: number;
    pendingDiscoveries: number;
    importedDiscoveries: number;
    rejectedDiscoveries: number;
    ignoredDiscoveries: number;
    mergedDiscoveries: number;
    duplicateDiscoveries: number;
    canonicalMatches: number;
    approvedDiscoveries: number;
    averageConfidence: number;
  };
  discoveryCandidates: Array<ConnectorDiscoveredCandidate & { duplicateCount: number }>;
  discoveryHistory: Array<{
    id: string;
    at: string;
    connector: ConnectorType;
    source: string;
    perfume: string;
    brand: string;
    status: ConnectorDiscoveredCandidate["status"];
    action: ConnectorDiscoveredCandidate["reviewAction"];
    confidence: number;
    note: string;
    matchedPerfumeId: string | null;
    mergedIntoPerfumeId: string | null;
  }>;
  fragrantica: {
    status: "idle" | "running" | "needs-review" | "complete";
    message: string;
    completionPercent: number;
    pendingReviewCount: number;
    importedCount: number;
    mergedCount: number;
    trackedBrands: number;
    discoveryCursor: number;
    syncCursor: number;
    lastFullDiscoveryAt: string | null;
  };
}

interface EnrichmentPoolItem {
  connector: ConnectorType;
  perfumeId: string;
  task: EnrichmentTask;
  confidence: number;
}

const nowIso = (): string => new Date().toISOString();
const connectorVersion = "fragrantica-connector-v1";
const COMPLETE_DB_OUTPUT_PATH = path.join(
  process.cwd(),
  "data",
  "generated",
  "complete-fragrance-database.json",
);

const taskToConnector = (task: EnrichmentTask): ConnectorType => {
  if (task.suggestedConnector === "Image Connector") {
    return "images";
  }

  if (task.suggestedConnector === "Parfumo Connector") {
    return "parfumo";
  }

  if (task.suggestedConnector === "Fragrantica Connector" || task.suggestedConnector === "FragDB Connector") {
    return "fragrantica";
  }

  return "custom";
};

const normalizeText = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, " ");

const canonicalKey = (perfume: string, brand: string): string =>
  `${normalizeText(brand)}::${normalizeText(perfume)}`;

const stableDigest = (value: string): string => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
};

const toFieldSync = (input: {
  field: string;
  rawValue: string;
  canonicalValue: string;
  confidence: number;
  decisionReference: string;
}): ConnectorSynchronizedField => ({
  field: input.field,
  source: "FragDB",
  connector: "fragrantica",
  synchronizedAt: nowIso(),
  confidence: input.confidence,
  rawValue: input.rawValue,
  canonicalValue: input.canonicalValue,
  connectorVersion,
  decisionReference: input.decisionReference,
});

const pushConflict = (state: ConnectorState, input: Omit<ConnectorConflictRecord, "id">): void => {
  const exists = state.conflicts.find(
    (item) =>
      item.perfumeId === input.perfumeId &&
      item.conflictingField === input.conflictingField &&
      item.status === "open" &&
      item.conflictingValues.join("|") === input.conflictingValues.join("|"),
  );

  if (exists) {
    return;
  }

  state.conflicts = [
    {
      id: `conflict-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...input,
    },
    ...state.conflicts,
  ].slice(0, 6000);
};

const clamp = (value: number, min: number = 0, max: number = 100): number =>
  Math.max(min, Math.min(max, value));

const STALE_PENDING_JOB_MAX_AGE_MS = 10 * 60 * 1000;
const STALE_RUNNING_JOB_MAX_AGE_MS = 5 * 60 * 1000;

const isQueuedJob = (job: ConnectorJob): boolean =>
  job.status === "pending" || job.status === "running";

const getJobReferenceTimestamp = (job: ConnectorJob): number | null => {
  const source = job.startedAt ?? job.createdAt;
  const value = Date.parse(source);
  return Number.isFinite(value) ? value : null;
};

const isStaleQueuedJob = (job: ConnectorJob, nowMs: number): boolean => {
  if (!isQueuedJob(job)) {
    return false;
  }

  const reference = getJobReferenceTimestamp(job);
  if (reference === null) {
    return false;
  }

  const maxAge = job.status === "running" ? STALE_RUNNING_JOB_MAX_AGE_MS : STALE_PENDING_JOB_MAX_AGE_MS;
  return nowMs - reference > maxAge;
};

const clearStaleQueuedJobs = (
  state: ConnectorState,
  connector?: ConnectorType,
): { cleared: number; fragranticaCleared: number } => {
  const now = nowIso();
  const nowMs = Date.now();
  let cleared = 0;
  let fragranticaCleared = 0;

  state.jobs = state.jobs.map((job) => {
    if (connector && job.connector !== connector) {
      return job;
    }

    if (!isStaleQueuedJob(job, nowMs)) {
      return job;
    }

    cleared += 1;
    if (job.connector === "fragrantica") {
      fragranticaCleared += 1;
    }

    return {
      ...job,
      status: "cancelled" as ConnectorJobStatus,
      result: job.result ?? "skipped",
      finishedAt: now,
      durationMs: job.durationMs ?? 0,
      errorMessage: "Auto-cancelled stale queued job.",
    };
  });

  return { cleared, fragranticaCleared };
};

type DiscoveryReviewAction = "approve" | "reject" | "ignore" | "merge";

const createDiscoveryJobFromCandidate = (
  candidate: ConnectorDiscoveredCandidate,
  result: "new-perfume" | "matched-existing" | "ambiguous",
): ConnectorJob => ({
  id: `connector-job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  connector: candidate.connector,
  workflow: "discovery",
  perfumeId: candidate.matchedPerfumeId,
  taskId: null,
  groupKey: candidate.canonicalKey,
  field: "discovery",
  priority: 1,
  source: candidate.source,
  reason: result === "matched-existing" ? "Canonical match approved" : "Discovery approval",
  confidence: candidate.confidence,
  status: "completed",
  result,
  createdAt: candidate.resolvedAt ?? candidate.discoveredAt,
  startedAt: candidate.resolvedAt ?? candidate.discoveredAt,
  finishedAt: candidate.resolvedAt ?? candidate.discoveredAt,
  durationMs: 0,
  errorMessage: null,
});

const summarizeDiscoveryCandidates = (state: ConnectorState): Array<ConnectorDiscoveredCandidate & { duplicateCount: number }> => {
  const duplicateCounts = new Map<string, number>();

  for (const candidate of state.discoveredCandidates) {
    duplicateCounts.set(candidate.canonicalKey, (duplicateCounts.get(candidate.canonicalKey) ?? 0) + 1);
  }

  return state.discoveredCandidates
    .slice()
    .sort((left, right) => new Date(right.discoveredAt).getTime() - new Date(left.discoveredAt).getTime())
    .map((candidate) => ({
      ...candidate,
      duplicateCount: duplicateCounts.get(candidate.canonicalKey) ?? 1,
    }));
};

const buildDiscoveryStatistics = (
  candidates: Array<ConnectorDiscoveredCandidate & { duplicateCount: number }>,
): SourcesWorkspaceData["discoveryStatistics"] => {
  const totalCandidates = candidates.length;
  const newDiscoveries = candidates.filter((candidate) => candidate.status === "new").length;
  const pendingDiscoveries = candidates.filter((candidate) => candidate.status === "pending" || candidate.status === "review").length;
  const importedDiscoveries = candidates.filter((candidate) => candidate.status === "imported").length;
  const rejectedDiscoveries = candidates.filter((candidate) => candidate.status === "rejected").length;
  const ignoredDiscoveries = candidates.filter((candidate) => candidate.status === "ignored").length;
  const mergedDiscoveries = candidates.filter((candidate) => candidate.status === "merged").length;
  const duplicateDiscoveries = candidates.filter((candidate) => candidate.status === "duplicate").length;
  const canonicalMatches = candidates.filter((candidate) => candidate.status === "matched").length;
  const approvedDiscoveries = candidates.filter((candidate) => candidate.reviewAction === "approve").length;
  const averageConfidence =
    totalCandidates > 0
      ? Number((candidates.reduce((sum, candidate) => sum + candidate.confidence, 0) / totalCandidates).toFixed(2))
      : 0;

  return {
    totalCandidates,
    newDiscoveries,
    pendingDiscoveries,
    importedDiscoveries,
    rejectedDiscoveries,
    ignoredDiscoveries,
    mergedDiscoveries,
    duplicateDiscoveries,
    canonicalMatches,
    approvedDiscoveries,
    averageConfidence,
  };
};

const buildDiscoveryHistory = (
  candidates: Array<ConnectorDiscoveredCandidate & { duplicateCount: number }>,
): SourcesWorkspaceData["discoveryHistory"] =>
  candidates.map((candidate) => ({
    id: candidate.id,
    at: candidate.resolvedAt ?? candidate.discoveredAt,
    connector: candidate.connector,
    source: candidate.source,
    perfume: candidate.perfume,
    brand: candidate.brand,
    status: candidate.status,
    action: candidate.reviewAction,
    confidence: candidate.confidence,
    note:
      candidate.reviewAction === "approve"
        ? "Approved discovery routed into the master database pipeline."
        : candidate.reviewAction === "merge"
          ? "Merged discovery into the canonical master database flow."
          : candidate.reviewAction === "reject"
            ? "Rejected discovery during manual review."
            : candidate.reviewAction === "ignore"
              ? "Ignored discovery from the active queue."
              : candidate.status === "matched"
                ? "Canonical match detected during discovery."
                : candidate.status === "duplicate"
                  ? "Duplicate canonical key detected before queue execution."
                  : "Discovery candidate detected by the FragDB scheduler.",
    matchedPerfumeId: candidate.matchedPerfumeId,
    mergedIntoPerfumeId: candidate.mergedIntoPerfumeId,
  }));

const ensureDiscoverySchedulerSeeded = (state: ConnectorState): void => {
  const hasDiscoveryMaterial =
    state.discoveredCandidates.length > 0 ||
    state.jobs.some((job) => job.workflow === "discovery");
  if (!hasDiscoveryMaterial) {
    state.scheduler.lastPrioritizationAt = state.scheduler.lastPrioritizationAt ?? nowIso();
  }
};

const buildEnrichmentPool = async (): Promise<{
  master: Awaited<ReturnType<typeof loadMasterDatabaseWorkspaceData>>;
  items: EnrichmentPoolItem[];
}> => {
  const master = await loadMasterDatabaseWorkspaceData();
  const items = Object.values(master.detailsById).flatMap((detail) =>
    detail.intelligence.enrichmentTasks.map((task) => ({
      connector: taskToConnector(task),
      perfumeId: detail.id,
      task,
      confidence: detail.intelligence.builderConfidence,
    })),
  );

  return { master, items };
};

const brandWindow = <T,>(items: T[], cursor: number, size: number): { slice: T[]; nextCursor: number } => {
  if (items.length === 0) {
    return { slice: [], nextCursor: 0 };
  }

  const normalizedSize = Math.max(1, Math.min(size, items.length));
  const start = Math.max(0, cursor % items.length);
  const result: T[] = [];
  for (let offset = 0; offset < normalizedSize; offset += 1) {
    result.push(items[(start + offset) % items.length]);
  }

  return {
    slice: result,
    nextCursor: (start + normalizedSize) % items.length,
  };
};

const createDiscoveryCandidateFromSnapshot = (
  snapshot: FragranticaSnapshot | ParfumoSnapshot | ManufacturerSnapshot,
  connector: ConnectorType,
  source: string,
  match: { id: string } | null,
): ConnectorDiscoveredCandidate => ({
  id: `candidate-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  connector,
  source,
  perfume: snapshot.perfumeName,
  brand: snapshot.brand,
  canonicalKey: canonicalKey(snapshot.perfumeName, snapshot.brand),
  confidence: snapshot.confidence,
  status: match ? "matched" : snapshot.confidence < 0.58 ? "review" : "new",
  reviewAction: null,
  matchedPerfumeId: match?.id ?? null,
  duplicateOfCandidateId: null,
  mergedIntoPerfumeId: null,
  discoveredAt: nowIso(),
  resolvedAt: null,
  externalId: snapshot.externalId,
  externalUrl: snapshot.externalUrl,
});

const createFieldMappings = (
  snapshot: FragranticaSnapshot | ParfumoSnapshot,
  connector: ConnectorType,
  sourceField: string,
  decisionReference: string,
): ConnectorSynchronizedField[] => [
  {
    ...toFieldSync({ field: "brand", rawValue: snapshot.brand, canonicalValue: snapshot.brand, confidence: snapshot.confidence, decisionReference }),
    connector,
    source: sourceField,
  },
  {
    ...toFieldSync({ field: "perfumeName", rawValue: snapshot.perfumeName, canonicalValue: snapshot.perfumeName, confidence: snapshot.confidence, decisionReference }),
    connector,
    source: sourceField,
  },
  {
    ...toFieldSync({ field: "launchYear", rawValue: snapshot.launchYear, canonicalValue: snapshot.launchYear, confidence: snapshot.confidence, decisionReference }),
    connector,
    source: sourceField,
  },
  {
    ...toFieldSync({ field: "perfumer", rawValue: snapshot.perfumer, canonicalValue: snapshot.perfumer, confidence: snapshot.confidence, decisionReference }),
    connector,
    source: sourceField,
  },
  {
    ...toFieldSync({ field: "gender", rawValue: snapshot.gender, canonicalValue: snapshot.gender, confidence: snapshot.confidence, decisionReference }),
    connector,
    source: sourceField,
  },
  {
    ...toFieldSync({ field: "mainAccords", rawValue: snapshot.mainAccords.join(", "), canonicalValue: snapshot.mainAccords.join(", "), confidence: snapshot.confidence, decisionReference }),
    connector,
    source: sourceField,
  },
  {
    ...toFieldSync({ field: "notes", rawValue: snapshot.notes.join(", "), canonicalValue: snapshot.notes.join(", "), confidence: snapshot.confidence, decisionReference }),
    connector,
    source: sourceField,
  },
  {
    ...toFieldSync({ field: "imageUrl", rawValue: snapshot.imageUrl, canonicalValue: snapshot.imageUrl, confidence: snapshot.confidence, decisionReference }),
    connector,
    source: sourceField,
  },
  {
    ...toFieldSync({ field: `${connector}Url`, rawValue: snapshot.externalUrl, canonicalValue: snapshot.externalUrl, confidence: snapshot.confidence, decisionReference }),
    connector,
    source: sourceField,
  },
  {
    ...toFieldSync({ field: "rating", rawValue: `${snapshot.rating}|${snapshot.voteCount}`, canonicalValue: `${snapshot.rating}|${snapshot.voteCount}`, confidence: snapshot.confidence, decisionReference }),
    connector,
    source: sourceField,
  },
  {
    ...toFieldSync({ field: "releaseStatus", rawValue: snapshot.releaseStatus, canonicalValue: snapshot.releaseStatus, confidence: snapshot.confidence, decisionReference }),
    connector,
    source: sourceField,
  },
  {
    ...toFieldSync({ field: "availability", rawValue: snapshot.availability, canonicalValue: snapshot.availability, confidence: snapshot.confidence, decisionReference }),
    connector,
    source: sourceField,
  },
];

const parseListField = (value: string): string[] =>
  value
    .split(/[,|;/]/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 24);

const stringifyParfumoFieldValue = (
  snapshot: ParfumoSnapshot,
  field: string,
): string => {
  if (field === "mainAccords") {
    return snapshot.mainAccords.join(", ");
  }

  if (field === "notes") {
    return snapshot.notes.join(", ");
  }

  const value = (snapshot as unknown as Record<string, unknown>)[field];
  return typeof value === "string" ? value : "";
};

const extractFieldMapFromLatestSync = (
  state: ConnectorState,
  perfumeId: string,
  connector: ConnectorType,
): Map<string, string> => {
  const jobs = state.jobs
    .filter(
      (job) =>
        job.connector === connector &&
        job.perfumeId === perfumeId &&
        job.status === "completed" &&
        Array.isArray(job.synchronizedFields) &&
        job.synchronizedFields.length > 0,
    )
    .sort(
      (left, right) =>
        new Date(right.finishedAt ?? right.createdAt).getTime() -
        new Date(left.finishedAt ?? left.createdAt).getTime(),
    );

  const latest = jobs[0]?.synchronizedFields ?? [];
  return new Map(latest.map((field) => [field.field, field.canonicalValue]));
};

const reconcileParfumoSnapshotWithTruth = async (
  state: ConnectorState,
  row: { id: string; perfume: string; brand: string },
  snapshot: ParfumoSnapshot,
): Promise<{ snapshot: ParfumoSnapshot; overriddenFields: string[]; usedManufacturer: boolean }> => {
  const resolved: ParfumoSnapshot = {
    ...snapshot,
    mainAccords: [...snapshot.mainAccords],
    notes: [...snapshot.notes],
  };

  const fragranticaValues = extractFieldMapFromLatestSync(state, row.id, "fragrantica");
  const manufacturerTruth = await resolveManufacturerTruth(
    row.brand,
    row.perfume,
    state.connectors.custom.config.timeoutMs,
  );
  const overriddenFields: string[] = [];
  let usedManufacturer = false;

  const preferManufacturerOrFragrantica = (
    field: string,
    currentValue: string,
    setValue: (value: string) => void,
    manufacturerValue?: string,
  ): void => {
    const fragranticaValue = (fragranticaValues.get(field) ?? "").trim();
    const normalizedCurrent = normalizeText(currentValue);
    const normalizedFragrantica = normalizeText(fragranticaValue);
    if (!fragranticaValue || normalizedCurrent === normalizedFragrantica) {
      return;
    }

    const normalizedManufacturer = normalizeText(manufacturerValue ?? "");
    if (manufacturerValue && normalizedManufacturer.length > 0) {
      setValue(manufacturerValue);
      overriddenFields.push(field);
      usedManufacturer = true;
      return;
    }

    setValue(fragranticaValue);
    overriddenFields.push(field);
  };

  preferManufacturerOrFragrantica(
    "launchYear",
    resolved.launchYear,
    (value) => {
      resolved.launchYear = value;
    },
    manufacturerTruth?.launchYear,
  );

  preferManufacturerOrFragrantica(
    "perfumer",
    resolved.perfumer,
    (value) => {
      resolved.perfumer = value;
    },
    manufacturerTruth?.perfumer,
  );

  preferManufacturerOrFragrantica("gender", resolved.gender, (value) => {
    resolved.gender = value;
  });

  preferManufacturerOrFragrantica(
    "availability",
    resolved.availability,
    (value) => {
      resolved.availability = value;
    },
    manufacturerTruth?.availability,
  );

  preferManufacturerOrFragrantica(
    "releaseStatus",
    resolved.releaseStatus,
    (value) => {
      resolved.releaseStatus = value;
    },
    manufacturerTruth?.releaseStatus,
  );

  const fragranticaAccords = fragranticaValues.get("mainAccords") ?? "";
  if (
    fragranticaAccords.length > 0 &&
    normalizeText(resolved.mainAccords.join(", ")) !== normalizeText(fragranticaAccords)
  ) {
    resolved.mainAccords = parseListField(fragranticaAccords);
    overriddenFields.push("mainAccords");
  }

  const fragranticaNotes = fragranticaValues.get("notes") ?? "";
  if (
    fragranticaNotes.length > 0 &&
    normalizeText(resolved.notes.join(", ")) !== normalizeText(fragranticaNotes)
  ) {
    resolved.notes = parseListField(fragranticaNotes);
    overriddenFields.push("notes");
  }

  return {
    snapshot: resolved,
    overriddenFields: Array.from(new Set(overriddenFields)),
    usedManufacturer,
  };
};

const appendHistory = (
  state: ConnectorState,
  input: Omit<ConnectorHistoryItem, "id">,
): ConnectorHistoryItem => {
  const entry: ConnectorHistoryItem = {
    id: `connector-history-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...input,
  };
  state.history = [entry, ...state.history].slice(0, 400);
  return entry;
};

const prioritizePendingJobs = (state: ConnectorState): void => {
  const weight = (job: ConnectorJob): number => {
    const connectorPriority = state.connectors[job.connector].config.priority;
    const workflowPriority = job.workflow === "discovery" ? 1 : 2;
    const confidenceWeight = (1 - job.confidence) * 10;
    return connectorPriority * 100 + workflowPriority * 10 + job.priority + confidenceWeight;
  };

  state.jobs = state.jobs.slice().sort((left, right) => {
    if (left.status !== right.status) {
      const statusRank = (status: ConnectorJobStatus): number => {
        if (status === "running") return 1;
        if (status === "pending") return 2;
        if (status === "failed") return 3;
        if (status === "completed") return 4;
        return 5;
      };
      return statusRank(left.status) - statusRank(right.status);
    }

    if (left.status === "pending" || left.status === "running") {
      return weight(left) - weight(right);
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });

  state.scheduler.lastPrioritizationAt = nowIso();
};

const recalcExecutionMetrics = (
  connector: ConnectorType,
  state: ConnectorState,
  totalDiscoveryByConnector: number,
  totalEnrichmentByConnector: number,
): void => {
  const jobs = state.jobs.filter((job) => job.connector === connector);
  const completed = jobs.filter((job) => job.status === "completed");
  const failed = jobs.filter((job) => job.status === "failed");
  const running = jobs.filter((job) => job.status === "running");
  const pending = jobs.filter((job) => job.status === "pending");

  const completedDiscovery = completed.filter((job) => job.workflow === "discovery").length;
  const completedEnrichment = completed.filter((job) => job.workflow === "enrichment").length;
  const totalExpected = totalDiscoveryByConnector + totalEnrichmentByConnector;
  const coverage = totalExpected > 0 ? ((completedDiscovery + completedEnrichment) / totalExpected) * 100 : 100;
  const failRate = jobs.length > 0 ? failed.length / jobs.length : 0;
  const confidence =
    completed.length > 0
      ? completed.reduce((sum, job) => sum + job.confidence, 0) / completed.length
      : 0;

  const health = clamp(coverage * 0.7 + (1 - failRate) * 30);

  const execution = state.connectors[connector].execution;
  execution.status = running.length > 0 ? "running" : failed.length > 0 ? "error" : "idle";
  execution.health = Number(health.toFixed(2));
  execution.coverage = Number(coverage.toFixed(2));
  execution.importedRecords = jobs.length;
  execution.updatedRecords = completed.length;
  execution.failedRecords = failed.length;
  execution.missingFields = Math.max(0, totalExpected - completed.length);
  execution.pendingJobs = pending.length;
  execution.queueSize = pending.length + running.length;
  execution.confidence = Number(confidence.toFixed(2));
};

const buildDashboard = async (state: ConnectorState): Promise<SourcesWorkspaceData> => {
  const staleCleanup = clearStaleQueuedJobs(state);
  if (staleCleanup.cleared > 0) {
    appendHistory(state, {
      connector: "all",
      runType: "sync",
      startedAt: nowIso(),
      finishedAt: nowIso(),
      status: "success",
      executionTimeMs: 0,
      importedRecords: 0,
      updatedRecords: staleCleanup.cleared,
      failedRecords: 0,
      missingFields: 0,
      queueSize: state.jobs.filter((job) => isQueuedJob(job)).length,
      confidence: 1,
      note: `Auto-cleaned ${staleCleanup.cleared} stale queued connector jobs (${staleCleanup.fragranticaCleared} FragDB).`,
    });
  }

  ensureDiscoverySchedulerSeeded(state);
  const discoveryCandidates = summarizeDiscoveryCandidates(state);
  const discoveryStatistics = buildDiscoveryStatistics(discoveryCandidates);
  const discoveryHistory = buildDiscoveryHistory(discoveryCandidates);
  const { master, items: enrichmentItems } = await buildEnrichmentPool();

  const enrichmentByConnector = enrichmentItems.reduce<Record<ConnectorType, number>>(
    (acc, item) => {
      acc[item.connector] += 1;
      return acc;
    },
    {
      "local-excel": 0,
      fragrantica: 0,
      parfumo: 0,
      notino: 0,
      parfimo: 0,
      miraj: 0,
      images: 0,
      custom: 0,
    },
  );

  const discoveryByConnector = state.jobs
    .filter((job) => job.workflow === "discovery")
    .reduce<Record<ConnectorType, number>>(
      (acc, job) => {
        acc[job.connector] += 1;
        return acc;
      },
      {
        "local-excel": 0,
        fragrantica: 0,
        parfumo: 0,
        notino: 0,
        parfimo: 0,
        miraj: 0,
        images: 0,
        custom: 0,
      },
    );

  const dashboard = (Object.keys(state.connectors) as ConnectorType[])
    .map((connector) => {
      recalcExecutionMetrics(
        connector,
        state,
        discoveryByConnector[connector],
        enrichmentByConnector[connector],
      );

      const runtime = state.connectors[connector];
      const connectorJobs = state.jobs.filter((job) => job.connector === connector);
      const discoveryPending = connectorJobs.filter(
        (job) => job.workflow === "discovery" && (job.status === "pending" || job.status === "running"),
      ).length;
      const enrichmentPending = connectorJobs.filter(
        (job) =>
          job.workflow === "enrichment" && (job.status === "pending" || job.status === "running"),
      ).length;

      return {
        connector,
        label: connectorLabel(connector),
        status: runtime.execution.status,
        health: runtime.execution.health,
        lastRun: runtime.execution.lastRun ?? "never",
        lastSuccessfulRun: runtime.execution.lastSuccessfulRun ?? "never",
        executionTimeMs: runtime.execution.executionTimeMs,
        coverage: runtime.execution.coverage,
        importedRecords: runtime.execution.importedRecords,
        updatedRecords: runtime.execution.updatedRecords,
        failedRecords: runtime.execution.failedRecords,
        missingFields: runtime.execution.missingFields,
        pendingJobs: runtime.execution.pendingJobs,
        discoveryPending,
        enrichmentPending,
        queueSize: runtime.execution.queueSize,
        confidence: runtime.execution.confidence,
        enabled: runtime.config.enabled,
        priority: runtime.config.priority,
      } satisfies SourcesConnectorDashboardItem;
    })
    .sort((left, right) => left.priority - right.priority || left.label.localeCompare(right.label));

  const connectorHealth =
    dashboard.length > 0
      ? Number((dashboard.reduce((sum, item) => sum + item.health, 0) / dashboard.length).toFixed(2))
      : 100;

  const connectorCoverage =
    dashboard.length > 0
      ? Number((dashboard.reduce((sum, item) => sum + item.coverage, 0) / dashboard.length).toFixed(2))
      : 100;

  const imageMissingIds = Object.values(master.detailsById)
    .filter((detail) => detail.intelligence.missingFields.includes("image"))
    .map((detail) => detail.id);

  const imageCompleted = state.jobs.filter(
    (job) =>
      job.connector === "images" &&
      job.workflow === "enrichment" &&
      job.status === "completed",
  ).length;

  const imageCoverage =
    master.totalPerfumes > 0
      ? Number((((master.totalPerfumes - imageMissingIds.length) / master.totalPerfumes) * 100).toFixed(2))
      : 100;

  const fieldFrequency = (connector: ConnectorType): Array<{ field: string; count: number }> => {
    const map = new Map<string, number>();
    for (const item of enrichmentItems.filter((entry) => entry.connector === connector)) {
      map.set(item.task.field, (map.get(item.task.field) ?? 0) + 1);
    }

    return Array.from(map.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 6)
      .map(([field, count]) => ({ field, count }));
  };

  const previews = (Object.keys(state.connectors) as ConnectorType[])
    .map((connector) => {
      const discoveryTasks = discoveryByConnector[connector];
      const enrichmentTasks = enrichmentByConnector[connector];
      const batchSize = state.connectors[connector].config.batchSize;
      return {
        connector,
        discoveryTasks,
        enrichmentTasks,
        previewJobs: Math.min(batchSize, discoveryTasks + enrichmentTasks),
        topFields: fieldFrequency(connector),
      };
    })
    .sort((left, right) => right.previewJobs - left.previewJobs);

  const discoveryQueue = state.jobs.filter(
    (job) => job.workflow === "discovery" && (job.status === "pending" || job.status === "running"),
  ).length;

  const enrichmentQueue = state.jobs.filter(
    (job) =>
      job.workflow === "enrichment" && (job.status === "pending" || job.status === "running"),
  ).length;

  const pendingConnectorJobs = discoveryQueue + enrichmentQueue;
  const automaticEnrichment = state.jobs.filter(
    (job) => job.workflow === "enrichment" && job.status === "completed",
  ).length;

  const newPerfumesFound = discoveryStatistics.newDiscoveries;

  const connectorConfigs = (Object.keys(state.connectors) as ConnectorType[]).map((connector) => ({
    connector,
    label: connectorLabel(connector),
    config: state.connectors[connector].config,
  }));

  const fragDbStats =
    getCachedFragranticaDatasetStats() ??
    ({ totalRecords: 0, mode: "sample" as const });

  const fragranticaPendingReviewCount = discoveryCandidates.filter(
    (candidate) =>
      candidate.connector === "fragrantica" &&
      (candidate.status === "new" || candidate.status === "pending" || candidate.status === "review"),
  ).length;
  const fragranticaImportedCount = discoveryCandidates.filter(
    (candidate) =>
      candidate.connector === "fragrantica" &&
      (candidate.status === "imported" || candidate.status === "matched"),
  ).length;
  const fragranticaMergedCount = discoveryCandidates.filter(
    (candidate) => candidate.connector === "fragrantica" && candidate.status === "merged",
  ).length;
  const nowMs = Date.now();
  const fragranticaRunning = state.jobs.some(
    (job) => job.connector === "fragrantica" && isQueuedJob(job) && !isStaleQueuedJob(job, nowMs),
  );
  const fragranticaCompleted =
    Boolean(state.connectorMemory.fragrantica.lastFullDiscoveryAt) &&
    state.connectorMemory.fragrantica.discoveryCursor === 0 &&
    !fragranticaRunning &&
    fragranticaPendingReviewCount === 0;
  const fragranticaCompletionPercent = fragranticaCompleted
    ? 100
    : fragDbStats.totalRecords > 0
      ? Number(
          Math.min(
            99,
            (state.connectorMemory.fragrantica.discoveryCursor / Math.max(1, fragDbStats.totalRecords)) * 100,
          ).toFixed(2),
        )
      : 0;
  const fragranticaStatus: SourcesWorkspaceData["fragrantica"]["status"] = fragranticaRunning
    ? "running"
    : fragranticaCompleted
      ? "complete"
      : fragranticaPendingReviewCount > 0
        ? "needs-review"
        : "idle";
  const fragranticaMessage = fragranticaRunning
    ? "Scanarea FragDB ruleazÄƒ; parfumurile noi È™i update-urile existente sunt adÄƒugate automat cÃ¢nd sunt gÄƒsite."
    : fragranticaCompleted
      ? "Crawl-ul curent FragDB este complet pentru baza urmÄƒritÄƒ acum. Nu mai existÄƒ candidaÈ›i noi sau de revizuit."
      : fragranticaPendingReviewCount > 0
        ? "ExistÄƒ candidaÈ›i FragDB Ã®n aÈ™teptare. DupÄƒ aprobare, baza poate fi consideratÄƒ complet sincronizatÄƒ pentru acest crawl."
        : fragDbStats.mode === "sample"
          ? "Rulezi Ã®n modul FragDB sample (set restrÃ¢ns). Pentru importuri reale la scarÄƒ, adaugÄƒ fragrances.csv complet Ã®n data/fragdb."
          : "PorneÈ™te sincronizarea FragDB pentru a actualiza baza de parfumuri È™i a adÄƒuga automat intrÄƒrile lipsÄƒ.";

  const synchronizationStatus =
    dashboard.some((item) => item.status === "error") ||
    state.jobs.some((job) => job.status === "failed")
      ? "degraded"
      : "healthy";

  const lastSynchronization =
    state.scheduler.lastDiscoverySyncAt ??
    state.scheduler.lastEnrichmentSyncAt ??
    state.lastUpdatedAt;

  return {
    generatedAt: nowIso(),
    connectorHealth,
    connectorCoverage,
    pendingConnectorJobs,
    discoveryQueue,
    enrichmentQueue,
    imageCoverage,
    newPerfumesFound,
    automaticEnrichment,
    lastSynchronization,
    synchronizationStatus,
    dashboard,
    registry: (Object.keys(state.registry) as ConnectorType[])
      .map((connector) => state.registry[connector])
      .sort((left, right) => state.connectors[left.connector].config.priority - state.connectors[right.connector].config.priority),
    imageConnector: {
      missingImages: imageMissingIds.length,
      detectedPerfumeIds: imageMissingIds.slice(0, 50),
      queueSize: state.jobs.filter(
        (job) =>
          job.connector === "images" &&
          job.workflow === "enrichment" &&
          (job.status === "pending" || job.status === "running"),
      ).length,
      validatedImages: imageCompleted,
      health: state.connectors.images.execution.health,
    },
    previews,
    recentHistory: state.history.slice(0, 20),
    executionLogs: state.history.slice(0, 80),
    connectorConfigs,
    discoveryStatistics,
    discoveryCandidates,
    discoveryHistory,
    fragrantica: {
      status: fragranticaStatus,
      message: fragranticaMessage,
      completionPercent: fragranticaCompletionPercent,
      pendingReviewCount: fragranticaPendingReviewCount,
      importedCount: fragranticaImportedCount,
      mergedCount: fragranticaMergedCount,
      trackedBrands: fragDbStats.totalRecords,
      discoveryCursor: state.connectorMemory.fragrantica.discoveryCursor,
      syncCursor: state.connectorMemory.fragrantica.syncCursor,
      lastFullDiscoveryAt: state.connectorMemory.fragrantica.lastFullDiscoveryAt,
    },
  };
};

const generateEnrichmentJobs = async (state: ConnectorState, limit: number): Promise<number> => {
  const { items } = await buildEnrichmentPool();
  const available = Math.max(1, limit);

  const existing = new Set(
    state.jobs
      .filter((job) =>
        job.workflow === "enrichment" &&
        (job.status === "pending" || job.status === "running" || job.status === "completed"),
      )
      .map((job) => `${job.connector}:${job.perfumeId ?? "na"}:${job.field}`),
  );

  const candidates = items
    .filter((item) => state.connectors[item.connector].config.enabled)
    .filter((item) => !existing.has(`${item.connector}:${item.perfumeId}:${item.task.field}`))
    .slice(0, available);

  const created = candidates.map((item) => ({
    id: `connector-job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    connector: item.connector,
    workflow: "enrichment" as ConnectorWorkflow,
    perfumeId: item.perfumeId,
    taskId: item.task.id,
    groupKey: `${item.perfumeId}:${item.task.field}`,
    field: item.task.field,
    priority: state.connectors[item.connector].config.priority,
    source: "master-missing-fields",
    reason: item.task.reason,
    confidence: Number(item.confidence.toFixed(2)),
    status: "pending" as ConnectorJobStatus,
    result: null,
    createdAt: nowIso(),
    startedAt: null,
    finishedAt: null,
    durationMs: null,
    errorMessage: null,
  }));

  if (created.length > 0) {
    state.jobs = [...created, ...state.jobs].slice(0, 12000);
    state.scheduler.lastEnrichmentSyncAt = nowIso();
  }

  return created.length;
};

const generateDiscoveryJobs = (state: ConnectorState, limit: number): number => {
  const available = Math.max(1, limit);
  const existingJobKeys = new Set(
    state.jobs
      .filter((job) => job.workflow === "discovery")
      .map((job) => `${job.connector}:${job.groupKey}`),
  );

  let created = 0;
  for (const candidate of state.discoveredCandidates.slice(0, available * 3)) {
    if (!(candidate.status === "new" || candidate.status === "review" || candidate.status === "matched")) {
      continue;
    }

    const key = `${candidate.connector}:${candidate.canonicalKey}`;
    if (existingJobKeys.has(key)) {
      continue;
    }

    state.jobs = [
      {
        id: `connector-job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        connector: candidate.connector,
        workflow: "discovery" as ConnectorWorkflow,
        perfumeId: candidate.matchedPerfumeId,
        taskId: null,
        groupKey: candidate.canonicalKey,
        field: "discovery",
        priority: state.connectors[candidate.connector].config.priority,
        source: candidate.source,
        reason: candidate.matchedPerfumeId ? "Canonical match from discovery queue" : "Discovery candidate queued",
        confidence: candidate.confidence,
        status: "pending" as ConnectorJobStatus,
        result: null,
        createdAt: nowIso(),
        startedAt: null,
        finishedAt: null,
        durationMs: null,
        errorMessage: null,
      },
      ...state.jobs,
    ].slice(0, 12000);

    existingJobKeys.add(key);
    created += 1;
    if (created >= available) {
      break;
    }
  }

  if (created > 0) {
    state.scheduler.lastDiscoverySyncAt = nowIso();
  }

  return created;
};

const executeFragranticaSynchronization = async (
  state: ConnectorState,
  runType: "run" | "dry-run",
): Promise<{
  importedRecords: number;
  updatedRecords: number;
  failedRecords: number;
  missingFields: number;
  queueSize: number;
  confidence: number;
  executionTimeMs: number;
  status: "success" | "failed";
  note: string;
}> => {
  const started = Date.now();
  const staleCleanup = clearStaleQueuedJobs(state, "fragrantica");
  const master = await loadMasterDatabaseWorkspaceData();
  const runtime = state.connectors.fragrantica;
  const discoveryBatchSize = Math.max(1, Math.min(runtime.config.batchSize, 50));
  const syncBatchSize = Math.max(1, Math.min(runtime.config.batchSize, 30));

  const masterByKey = new Map(
    master.rows.map((row) => [canonicalKey(row.perfume, row.brand), row]),
  );
  const existingCandidateKeys = new Set(
    state.discoveredCandidates.map((candidate) =>
      `${candidate.connector}:${candidate.canonicalKey}:${candidate.externalUrl ?? ""}`,
    ),
  );

  const discoveryBatch = await listFragranticaSnapshots(
    state.connectorMemory.fragrantica.discoveryCursor,
    discoveryBatchSize,
    runtime.config.timeoutMs,
  );
  const syncBatch = await listFragranticaSnapshots(
    state.connectorMemory.fragrantica.syncCursor,
    syncBatchSize,
    runtime.config.timeoutMs,
  );

  if (runType === "dry-run") {
    return {
      importedRecords: discoveryBatch.items.length,
      updatedRecords: 0,
      failedRecords: 0,
      missingFields: Math.max(0, discoveryBatch.totalRecords - discoveryBatch.items.length),
      queueSize: discoveryBatch.items.length,
      confidence: 0,
      executionTimeMs: Date.now() - started,
      status: "success",
      note: `Dry run prepared ${discoveryBatch.items.length} FragDB synchronization probes.`,
    };
  }

  for (const snapshot of discoveryBatch.items) {
    const candidateKey = `${"fragrantica"}:${canonicalKey(snapshot.perfumeName, snapshot.brand)}:${snapshot.externalUrl}`;
    if (existingCandidateKeys.has(candidateKey)) {
      continue;
    }

    existingCandidateKeys.add(candidateKey);
    const match = masterByKey.get(canonicalKey(snapshot.perfumeName, snapshot.brand)) ?? null;
    const candidate = createDiscoveryCandidateFromSnapshot(
      snapshot,
      "fragrantica",
      discoveryBatch.mode === "local" ? "fragdb-local" : "fragdb-sample",
      match,
    );
    state.discoveredCandidates = [candidate, ...state.discoveredCandidates].slice(0, 6000);
  }

  state.connectorMemory.fragrantica.discoveryCursor = discoveryBatch.nextCursor;
  if (discoveryBatch.wrapped && discoveryBatch.totalRecords > 0) {
    state.connectorMemory.fragrantica.lastFullDiscoveryAt = nowIso();
  }

  let synced = 0;
  let changed = 0;
  let failed = 0;
  let confidenceAccumulator = 0;

  for (const snapshot of syncBatch.items) {
    const matchedRow = masterByKey.get(canonicalKey(snapshot.perfumeName, snapshot.brand));
    if (!matchedRow) {
      continue;
    }

    const decisionReference = `decision:${matchedRow.id}:${Date.now()}`;

    try {
      const fieldSync = createFieldMappings(
        snapshot,
        "fragrantica",
        "FragDB",
        decisionReference,
      );
      const digest = stableDigest(JSON.stringify(fieldSync.map((item) => `${item.field}:${item.rawValue}`)));
      const previous = state.connectorMemory.fragrantica.syncIndex[matchedRow.id];
      const hasChanged = !previous || previous.digest !== digest || previous.status !== "active";

      if (hasChanged) {
        changed += 1;
        state.jobs = [
          {
            id: `connector-job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            connector: "fragrantica" as ConnectorType,
            workflow: "enrichment" as ConnectorWorkflow,
            perfumeId: matchedRow.id,
            taskId: null,
            groupKey: matchedRow.id,
            field: "fragrantica-sync",
            priority: runtime.config.priority,
            source: "fragdb-csv",
            reason: previous ? "External record changed" : "First FragDB synchronization",
            confidence: snapshot.confidence,
            status: "completed" as ConnectorJobStatus,
            result: "enriched" as ConnectorJob["result"],
            createdAt: nowIso(),
            startedAt: nowIso(),
            finishedAt: nowIso(),
            durationMs: 0,
            errorMessage: null,
            synchronizedFields: fieldSync,
          },
          ...state.jobs,
        ].slice(0, 12000);

        if (matchedRow.launchYear.trim().length > 0 && snapshot.launchYear.length > 0 && matchedRow.launchYear.trim() !== snapshot.launchYear.trim()) {
          pushConflict(state, {
            perfumeId: matchedRow.id,
            conflictingField: "launchYear",
            conflictingValues: [matchedRow.launchYear.trim(), snapshot.launchYear.trim()],
            sources: ["Master Database", "FragDB"],
            connector: "fragrantica",
            confidence: snapshot.confidence,
            timestamp: nowIso(),
            affectedCanonicalObject: matchedRow.id,
            status: "open",
            resolutionHistory: [
              {
                at: nowIso(),
                action: "detected",
                note: "Launch year mismatch detected during FragDB synchronization.",
              },
            ],
          });
        }
      }

      state.connectorMemory.fragrantica.syncIndex[matchedRow.id] = {
        url: snapshot.externalUrl,
        digest,
        status: "active",
        lastSynchronizedAt: nowIso(),
      };

      confidenceAccumulator += snapshot.confidence;
      synced += 1;
    } catch (error) {
      failed += 1;
      state.jobs = [
        {
          id: `connector-job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          connector: "fragrantica" as ConnectorType,
          workflow: "enrichment" as ConnectorWorkflow,
          perfumeId: matchedRow.id,
          taskId: null,
          groupKey: matchedRow.id,
          field: "fragrantica-sync",
          priority: runtime.config.priority,
          source: "fragdb-csv",
          reason: "FragDB synchronization error",
          confidence: 0,
          status: "failed" as ConnectorJobStatus,
          result: "skipped" as ConnectorJob["result"],
          createdAt: nowIso(),
          startedAt: nowIso(),
          finishedAt: nowIso(),
          durationMs: 0,
          errorMessage: error instanceof Error ? error.message : "Unknown synchronization error",
        },
        ...state.jobs,
      ].slice(0, 12000);
    }
  }

  state.connectorMemory.fragrantica.syncCursor = syncBatch.nextCursor;
  state.scheduler.lastEnrichmentSyncAt = nowIso();

  const queueSize = state.jobs.filter(
    (job) =>
      job.connector === "fragrantica" &&
      (job.status === "pending" || job.status === "running"),
  ).length;

  return {
    importedRecords: synced,
    updatedRecords: changed,
    failedRecords: failed,
    missingFields: Math.max(0, syncBatch.items.length - synced),
    queueSize,
    confidence: synced > 0 ? Number((confidenceAccumulator / synced).toFixed(2)) : 0,
    executionTimeMs: Date.now() - started,
    status: failed > 0 ? "failed" : "success",
    note: `FragDB synchronized ${synced} fragrances, changed ${changed}, failed ${failed}. Cleaned stale jobs: ${staleCleanup.cleared}.`,
  };
};

const executeParfumoSynchronization = async (
  state: ConnectorState,
  runType: "run" | "dry-run",
): Promise<{
  importedRecords: number;
  updatedRecords: number;
  failedRecords: number;
  missingFields: number;
  queueSize: number;
  confidence: number;
  executionTimeMs: number;
  status: "success" | "failed";
  note: string;
}> => {
  const started = Date.now();
  const master = await loadMasterDatabaseWorkspaceData();
  const rows = master.rows.slice().sort((left, right) => left.rowIndex - right.rowIndex);
  const brands = Array.from(new Set(master.rows.map((row) => row.brand))).sort((a, b) =>
    a.localeCompare(b),
  );
  const runtime = state.connectors.parfumo;
  const batch = Math.max(1, Math.min(runtime.config.batchSize, 10));
  const window = brandWindow(rows, state.connectorMemory.parfumo.syncCursor, batch);
  const brandSweep = brandWindow(
    brands,
    state.connectorMemory.parfumo.discoveryCursor,
    Math.max(1, Math.min(6, brands.length)),
  );

  const masterByKey = new Map(
    master.rows.map((row) => [canonicalKey(row.perfume, row.brand), { id: row.id }]),
  );
  const existingCandidateKeys = new Set(
    state.discoveredCandidates.map((candidate) =>
      `${candidate.connector}:${candidate.canonicalKey}:${candidate.externalUrl ?? ""}`,
    ),
  );

  if (runType === "dry-run") {
    return {
      importedRecords: window.slice.length,
      updatedRecords: 0,
      failedRecords: 0,
      missingFields: Math.max(0, rows.length - window.slice.length),
      queueSize: window.slice.length,
      confidence: 0,
      executionTimeMs: Date.now() - started,
      status: "success",
      note: `Dry run prepared ${window.slice.length} Parfumo synchronization probes.`,
    };
  }

  for (const brand of brandSweep.slice) {
    try {
      const discovered = await searchParfumoFragrances(brand, 4, runtime.config.timeoutMs);
      for (const snapshot of discovered) {
        const candidateKey = `${"parfumo"}:${canonicalKey(snapshot.perfumeName, snapshot.brand)}:${snapshot.externalUrl}`;
        if (existingCandidateKeys.has(candidateKey)) {
          continue;
        }

        existingCandidateKeys.add(candidateKey);
        const match = masterByKey.get(canonicalKey(snapshot.perfumeName, snapshot.brand)) ?? null;
        const candidate = createDiscoveryCandidateFromSnapshot(
          snapshot,
          "parfumo",
          "parfumo-live",
          match,
        );
        state.discoveredCandidates = [candidate, ...state.discoveredCandidates].slice(0, 6000);
      }
    } catch {
      continue;
    }
  }

  state.connectorMemory.parfumo.discoveryCursor = brandSweep.nextCursor;
  if (brandSweep.nextCursor === 0 && brands.length > 0) {
    state.connectorMemory.parfumo.lastFullDiscoveryAt = nowIso();
  }
  generateDiscoveryJobs(state, batch);

  let synced = 0;
  let changed = 0;
  let failed = 0;
  let confidenceAccumulator = 0;

  for (const row of window.slice) {
    const decisionReference = `decision:parfumo:${row.id}:${Date.now()}`;
    const query = `${row.perfume} ${row.brand}`;

    try {
      const searchResults = await searchParfumoFragrances(query, 2, runtime.config.timeoutMs);
      const snapshot = searchResults[0] ?? null;
      if (!snapshot) {
        continue;
      }

      const truthAligned = await reconcileParfumoSnapshotWithTruth(state, row, snapshot);

      if (truthAligned.overriddenFields.length > 0) {
        for (const field of truthAligned.overriddenFields) {
          pushConflict(state, {
            perfumeId: row.id,
            conflictingField: field,
            conflictingValues: [
              stringifyParfumoFieldValue(snapshot, field),
              stringifyParfumoFieldValue(truthAligned.snapshot, field),
            ],
            sources: truthAligned.usedManufacturer
              ? ["Parfumo", "Manufacturer", "Fragrantica"]
              : ["Parfumo", "Fragrantica"],
            connector: "parfumo",
            confidence: truthAligned.snapshot.confidence,
            timestamp: nowIso(),
            affectedCanonicalObject: row.id,
            status: "open",
            resolutionHistory: [
              {
                at: nowIso(),
                action: "truth-policy",
                note:
                  "Parfumo value overridden by manufacturer truth when available, otherwise Fragrantica fallback.",
              },
            ],
          });
        }
      }

      const fieldSync = createFieldMappings(
        truthAligned.snapshot,
        "parfumo",
        truthAligned.usedManufacturer
          ? "Parfumo (manufacturer-validated)"
          : truthAligned.overriddenFields.length > 0
            ? "Parfumo (Fragrantica-fallback)"
            : "Parfumo",
        decisionReference,
      );
      state.jobs = [
        {
          id: `connector-job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          connector: "parfumo",
          workflow: "enrichment",
          perfumeId: row.id,
          taskId: null,
          groupKey: row.id,
          field: "parfumo-sync",
          priority: runtime.config.priority,
          source: "parfumo-live",
          reason:
            truthAligned.overriddenFields.length > 0
              ? "Parfumo synchronization reconciled with truth-source policy"
              : "Parfumo synchronization",
          confidence: truthAligned.snapshot.confidence,
          status: "completed",
          result: "enriched",
          createdAt: nowIso(),
          startedAt: nowIso(),
          finishedAt: nowIso(),
          durationMs: 0,
          errorMessage: null,
          synchronizedFields: fieldSync,
        } satisfies ConnectorJob,
        ...state.jobs,
      ].slice(0, 12000);

      changed += 1;
      confidenceAccumulator += snapshot.confidence;
      synced += 1;
    } catch (error) {
      failed += 1;
      state.jobs = [
        {
          id: `connector-job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          connector: "parfumo",
          workflow: "enrichment",
          perfumeId: row.id,
          taskId: null,
          groupKey: row.id,
          field: "parfumo-sync",
          priority: runtime.config.priority,
          source: "parfumo-live",
          reason: "Parfumo synchronization error",
          confidence: 0,
          status: "failed",
          result: "skipped",
          createdAt: nowIso(),
          startedAt: nowIso(),
          finishedAt: nowIso(),
          durationMs: 0,
          errorMessage: error instanceof Error ? error.message : "Unknown synchronization error",
        } satisfies ConnectorJob,
        ...state.jobs,
      ].slice(0, 12000);
    }
  }

  state.connectorMemory.parfumo.syncCursor = window.nextCursor;
  state.scheduler.lastEnrichmentSyncAt = nowIso();

  const queueSize = state.jobs.filter(
    (job) => job.connector === "parfumo" && (job.status === "pending" || job.status === "running"),
  ).length;

  return {
    importedRecords: synced,
    updatedRecords: changed,
    failedRecords: failed,
    missingFields: Math.max(0, window.slice.length - synced),
    queueSize,
    confidence: synced > 0 ? Number((confidenceAccumulator / synced).toFixed(2)) : 0,
    executionTimeMs: Date.now() - started,
    status: failed > 0 ? "failed" : "success",
    note: `Parfumo synchronized ${synced} fragrances, changed ${changed}, failed ${failed}.`,
  };
};

const executeManufacturerSynchronization = async (
  state: ConnectorState,
  runType: "run" | "dry-run",
): Promise<{
  importedRecords: number;
  updatedRecords: number;
  failedRecords: number;
  missingFields: number;
  queueSize: number;
  confidence: number;
  executionTimeMs: number;
  status: "success" | "failed";
  note: string;
}> => {
  const started = Date.now();
  const runtime = state.connectors.custom;
  const sites = loadManufacturerSites();
  const sweep = brandWindow(
    sites,
    state.connectorMemory.manufacturer.discoveryCursor,
    Math.max(1, Math.min(runtime.config.batchSize, Math.max(1, sites.length))),
  );

  if (runType === "dry-run") {
    return {
      importedRecords: sweep.slice.length,
      updatedRecords: 0,
      failedRecords: 0,
      missingFields: Math.max(0, sites.length - sweep.slice.length),
      queueSize: sweep.slice.length,
      confidence: 0,
      executionTimeMs: Date.now() - started,
      status: "success",
      note: `Dry run prepared ${sweep.slice.length} manufacturer sitemap probes.`,
    };
  }

  const master = await loadMasterDatabaseWorkspaceData();
  const masterByKey = new Map(
    master.rows.map((row) => [canonicalKey(row.perfume, row.brand), { id: row.id }]),
  );
  const existingCandidateKeys = new Set(
    state.discoveredCandidates.map((candidate) =>
      `${candidate.connector}:${candidate.canonicalKey}:${candidate.externalUrl ?? ""}`,
    ),
  );

  let discovered = 0;
  let failed = 0;
  let confidenceAccumulator = 0;

  for (const site of sweep.slice) {
    try {
      const snapshots = await searchManufacturerFragrances(site, 10, runtime.config.timeoutMs);
      for (const snapshot of snapshots) {
        const key = `${"custom"}:${canonicalKey(snapshot.perfumeName, snapshot.brand)}:${snapshot.externalUrl}`;
        if (existingCandidateKeys.has(key)) {
          continue;
        }

        existingCandidateKeys.add(key);
        const match = masterByKey.get(canonicalKey(snapshot.perfumeName, snapshot.brand)) ?? null;
        const candidate = createDiscoveryCandidateFromSnapshot(
          {
            ...snapshot,
            launchYear: "",
            perfumer: "",
            gender: "unknown",
            mainAccords: [],
            notes: [],
            imageUrl: "",
            rating: "",
            voteCount: "",
            releaseStatus: "active",
            availability: "available",
          },
          "custom",
          snapshot.source,
          match,
        );

        state.discoveredCandidates = [candidate, ...state.discoveredCandidates].slice(0, 6000);
        discovered += 1;
        confidenceAccumulator += snapshot.confidence;
      }
    } catch {
      failed += 1;
    }
  }

  state.connectorMemory.manufacturer.discoveryCursor = sweep.nextCursor;
  if (sweep.nextCursor === 0 && sites.length > 0) {
    state.connectorMemory.manufacturer.lastFullDiscoveryAt = nowIso();
  }

  generateDiscoveryJobs(state, Math.max(20, discovered));

  const queueSize = state.jobs.filter(
    (job) => job.connector === "custom" && (job.status === "pending" || job.status === "running"),
  ).length;

  return {
    importedRecords: discovered,
    updatedRecords: discovered,
    failedRecords: failed,
    missingFields: Math.max(0, sweep.slice.length - discovered),
    queueSize,
    confidence: discovered > 0 ? Number((confidenceAccumulator / discovered).toFixed(2)) : 0,
    executionTimeMs: Date.now() - started,
    status: failed > 0 ? "failed" : "success",
    note: `Manufacturer discovery found ${discovered} candidates across ${sweep.slice.length} brand sites.`,
  };
};

const executeConnectorJobs = async (
  state: ConnectorState,
  connector: ConnectorType,
  runType: "run" | "dry-run",
): Promise<{
  importedRecords: number;
  updatedRecords: number;
  failedRecords: number;
  missingFields: number;
  queueSize: number;
  confidence: number;
  executionTimeMs: number;
  status: "success" | "failed";
  note: string;
}> => {
  if (connector === "fragrantica") {
    return executeFragranticaSynchronization(state, runType);
  }

  if (connector === "parfumo") {
    return executeParfumoSynchronization(state, runType);
  }

  if (connector === "custom") {
    return executeManufacturerSynchronization(state, runType);
  }

  const started = Date.now();
  const runtime = state.connectors[connector];
  const batch = Math.max(1, runtime.config.batchSize);

  const pending = state.jobs
    .filter((job) => job.connector === connector && job.status === "pending")
    .sort((left, right) => left.priority - right.priority)
    .slice(0, batch);

  if (runType === "dry-run") {
    const avgConfidence =
      pending.length > 0
        ? pending.reduce((sum, item) => sum + item.confidence, 0) / pending.length
        : 1;

    return {
      importedRecords: 0,
      updatedRecords: 0,
      failedRecords: 0,
      missingFields: pending.length,
      queueSize: pending.length,
      confidence: Number(avgConfidence.toFixed(2)),
      executionTimeMs: Date.now() - started,
      status: "success",
      note: `Dry run previewed ${pending.length} queued jobs.`,
    };
  }

  const master = await loadMasterDatabaseWorkspaceData();
  const byKey = new Map<string, { id: string; perfume: string; brand: string }>();
  for (const row of master.rows) {
    byKey.set(canonicalKey(row.perfume, row.brand), {
      id: row.id,
      perfume: row.perfume,
      brand: row.brand,
    });
  }

  for (const job of pending) {
    const startedAt = nowIso();
    job.status = "running";
    job.startedAt = startedAt;

    if (job.workflow === "discovery") {
      const match = byKey.get(job.groupKey);

      if (match) {
        job.status = "completed";
        job.result = "matched-existing";
        job.perfumeId = match.id;
      } else if (job.confidence < 0.55) {
        job.status = "failed";
        job.result = "ambiguous";
        job.errorMessage = "Discovery candidate requires manual review due to low confidence.";
      } else {
        job.status = "completed";
        job.result = "new-perfume";
      }

      const candidate: ConnectorDiscoveredCandidate = {
        id: `candidate-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        connector: job.connector,
        source: job.source,
        perfume: job.groupKey.split("::")[1] ?? "unknown",
        brand: job.groupKey.split("::")[0] ?? "unknown",
        canonicalKey: job.groupKey,
        confidence: job.confidence,
        status:
          job.result === "new-perfume"
            ? "new"
            : job.result === "matched-existing"
              ? "matched"
              : "review",
        reviewAction: null,
        matchedPerfumeId: job.perfumeId,
        duplicateOfCandidateId: null,
        mergedIntoPerfumeId: null,
        discoveredAt: startedAt,
        resolvedAt: nowIso(),
        externalId: null,
        externalUrl: null,
      };
      state.discoveredCandidates = [candidate, ...state.discoveredCandidates].slice(0, 6000);
    } else {
      job.status = "completed";
      job.result = "enriched";
      job.errorMessage = null;
    }

    job.finishedAt = nowIso();
    job.durationMs = Math.max(1, Date.now() - started);
  }

  const updatedRecords = pending.filter((job) => job.status === "completed").length;
  const failedRecords = pending.filter((job) => job.status === "failed").length;
  const queueSize = state.jobs.filter(
    (job) => job.connector === connector && (job.status === "pending" || job.status === "running"),
  ).length;
  const confidence =
    pending.length > 0
      ? Number((pending.reduce((sum, item) => sum + item.confidence, 0) / pending.length).toFixed(2))
      : 1;

  return {
    importedRecords: pending.length,
    updatedRecords,
    failedRecords,
    missingFields: queueSize,
    queueSize,
    confidence,
    executionTimeMs: Date.now() - started,
    status: failedRecords > 0 ? "failed" : "success",
    note: `Executed ${pending.length} queued jobs for ${connectorLabel(connector)}.`,
  };
};

const runSingleConnector = async (
  state: ConnectorState,
  connector: ConnectorType,
  runType: "run" | "dry-run",
): Promise<void> => {
  const runtime = state.connectors[connector];
  const startedAt = nowIso();

  const result = await executeConnectorJobs(state, connector, runType);

  runtime.execution.executionTimeMs = result.executionTimeMs;
  runtime.execution.lastRun = startedAt;
  runtime.execution.importedRecords += result.importedRecords;
  runtime.execution.updatedRecords += result.updatedRecords;
  runtime.execution.failedRecords += result.failedRecords;
  runtime.execution.missingFields = result.missingFields;
  runtime.execution.pendingJobs = result.queueSize;
  runtime.execution.queueSize = result.queueSize;
  runtime.execution.confidence = result.confidence;

  if (result.status === "success") {
    runtime.execution.lastSuccessfulRun = startedAt;
  }

  appendHistory(state, {
    connector,
    runType,
    startedAt,
    finishedAt: nowIso(),
    status: result.status,
    executionTimeMs: result.executionTimeMs,
    importedRecords: result.importedRecords,
    updatedRecords: result.updatedRecords,
    failedRecords: result.failedRecords,
    missingFields: result.missingFields,
    queueSize: result.queueSize,
    confidence: result.confidence,
    note: result.note,
  });
};

export const synchronizeConnectorQueues = async (
  options?: { discoveryLimit?: number; enrichmentLimit?: number },
): Promise<{ generatedDiscovery: number; generatedEnrichment: number; pending: number }> => {
  const state = readConnectorState();

  const generatedDiscovery = generateDiscoveryJobs(state, options?.discoveryLimit ?? 800);
  const generatedEnrichment = await generateEnrichmentJobs(state, options?.enrichmentLimit ?? 1200);

  prioritizePendingJobs(state);
  writeConnectorState(state);

  return {
    generatedDiscovery,
    generatedEnrichment,
    pending: state.jobs.filter((job) => job.status === "pending" || job.status === "running").length,
  };
};

export const runConnector = async (
  connector: ConnectorType,
  runType: "run" | "dry-run" = "run",
): Promise<SourcesWorkspaceData> => {
  const state = readConnectorState();
  generateDiscoveryJobs(state, 300);
  await generateEnrichmentJobs(state, 600);
  prioritizePendingJobs(state);

  await runSingleConnector(state, connector, runType);

  const hydrated = await buildDashboard(state);
  writeConnectorState(state);
  return hydrated;
};

export const runAllConnectors = async (
  runType: "run" | "dry-run" = "run",
): Promise<SourcesWorkspaceData> => {
  const state = readConnectorState();
  clearStaleQueuedJobs(state);
  generateDiscoveryJobs(state, 800);
  await generateEnrichmentJobs(state, 1600);
  prioritizePendingJobs(state);

  const connectors = (Object.keys(state.connectors) as ConnectorType[])
    .filter((connector) => state.connectors[connector].config.enabled)
    .sort((left, right) => state.connectors[left].config.priority - state.connectors[right].config.priority);

  for (const connector of connectors) {
    await runSingleConnector(state, connector, runType);
  }

  appendHistory(state, {
    connector: "all",
    runType,
    startedAt: nowIso(),
    finishedAt: nowIso(),
    status: "success",
    executionTimeMs: 0,
    importedRecords: 0,
    updatedRecords: 0,
    failedRecords: 0,
    missingFields: 0,
    queueSize: state.jobs.filter((job) => job.status === "pending" || job.status === "running").length,
    confidence: 1,
    note: "Executed all enabled connectors with prioritized discovery and enrichment queues.",
  });

  const hydrated = await buildDashboard(state);
  writeConnectorState(state);
  return hydrated;
};

export const previewConnectorChanges = async (): Promise<SourcesWorkspaceData> => {
  const state = readConnectorState();
  generateDiscoveryJobs(state, 600);
  await generateEnrichmentJobs(state, 1200);
  prioritizePendingJobs(state);

  appendHistory(state, {
    connector: "all",
    runType: "preview",
    startedAt: nowIso(),
    finishedAt: nowIso(),
    status: "success",
    executionTimeMs: 0,
    importedRecords: 0,
    updatedRecords: 0,
    failedRecords: 0,
    missingFields: 0,
    queueSize: state.jobs.filter((job) => job.status === "pending" || job.status === "running").length,
    confidence: 1,
    note: "Previewed discovery and enrichment queue deltas.",
  });

  const hydrated = await buildDashboard(state);
  writeConnectorState(state);
  return hydrated;
};

export const cancelConnectorExecution = async (): Promise<SourcesWorkspaceData> => {
  const state = readConnectorState();
  const now = nowIso();
  let cancelledCount = 0;

  state.jobs = state.jobs.map((job) => {
    if (job.status === "pending" || job.status === "running") {
      cancelledCount += 1;
      return {
        ...job,
        status: "cancelled" as ConnectorJobStatus,
        finishedAt: now,
        durationMs: job.durationMs ?? 0,
      };
    }
    return job;
  });

  appendHistory(state, {
    connector: "all",
    runType: "run",
    startedAt: now,
    finishedAt: now,
    status: "cancelled",
    executionTimeMs: 0,
    importedRecords: 0,
    updatedRecords: 0,
    failedRecords: 0,
    missingFields: 0,
    queueSize: 0,
    confidence: 1,
    note: `Cancelled ${cancelledCount} connector jobs.`,
  });

  const hydrated = await buildDashboard(state);
  writeConnectorState(state);
  return hydrated;
};

export const retryFailedConnectorJobs = async (
  connector: ConnectorType | "all" = "all",
): Promise<SourcesWorkspaceData> => {
  const state = readConnectorState();
  const now = nowIso();

  let retried = 0;
  state.jobs = state.jobs.map((job) => {
    if (job.status !== "failed") {
      return job;
    }

    if (connector !== "all" && job.connector !== connector) {
      return job;
    }

    retried += 1;
    return {
      ...job,
      status: "pending",
      startedAt: null,
      finishedAt: null,
      durationMs: null,
      errorMessage: null,
      createdAt: now,
    };
  });

  prioritizePendingJobs(state);

  appendHistory(state, {
    connector,
    runType: "run",
    startedAt: now,
    finishedAt: now,
    status: "success",
    executionTimeMs: 0,
    importedRecords: 0,
    updatedRecords: retried,
    failedRecords: 0,
    missingFields: 0,
    queueSize: state.jobs.filter((job) => job.status === "pending" || job.status === "running").length,
    confidence: 1,
    note: `Retried ${retried} failed jobs.`,
  });

  const hydrated = await buildDashboard(state);
  writeConnectorState(state);
  return hydrated;
};

export const updateConnectorConfiguration = async (
  connector: ConnectorType,
  patch: Partial<ConnectorConfig>,
): Promise<SourcesWorkspaceData> => {
  const state = readConnectorState();
  const next = state.connectors[connector].config;
  state.connectors[connector].config = {
    ...next,
    ...patch,
  };

  prioritizePendingJobs(state);

  appendHistory(state, {
    connector,
    runType: "sync",
    startedAt: nowIso(),
    finishedAt: nowIso(),
    status: "success",
    executionTimeMs: 0,
    importedRecords: 0,
    updatedRecords: 0,
    failedRecords: 0,
    missingFields: 0,
    queueSize: state.jobs.filter((job) => job.status === "pending" || job.status === "running").length,
    confidence: state.connectors[connector].execution.confidence,
    note: "Connector configuration updated.",
  });

  const hydrated = await buildDashboard(state);
  writeConnectorState(state);
  return hydrated;
};

export const generateConnectorJobsFromEnrichmentTasks = async (
  limit: number = 800,
): Promise<{ generated: number; pending: number }> => {
  const state = readConnectorState();
  const generated = await generateEnrichmentJobs(state, limit);
  prioritizePendingJobs(state);

  if (generated > 0) {
    appendHistory(state, {
      connector: "all",
      runType: "sync",
      startedAt: nowIso(),
      finishedAt: nowIso(),
      status: "success",
      executionTimeMs: 0,
      importedRecords: generated,
      updatedRecords: 0,
      failedRecords: 0,
      missingFields: 0,
      queueSize: state.jobs.filter((job) => job.status === "pending" || job.status === "running").length,
      confidence: 1,
      note: `Builder generated ${generated} enrichment jobs from missing fields.`,
    });
  }

  const hydrated = await buildDashboard(state);
  writeConnectorState(state);

  return {
    generated,
    pending: hydrated.pendingConnectorJobs,
  };
};

export const generateDiscoveryJobsFromConnectors = async (
  limit: number = 500,
): Promise<{ generated: number; pending: number }> => {
  const state = readConnectorState();
  const master = await loadMasterDatabaseWorkspaceData();
  const brands = Array.from(new Set(master.rows.map((row) => row.brand))).sort((a, b) =>
    a.localeCompare(b),
  );
  const masterByKey = new Map(master.rows.map((row) => [canonicalKey(row.perfume, row.brand), { id: row.id }]));
  const existingCandidateKeys = new Set(
    state.discoveredCandidates.map((candidate) =>
      `${candidate.connector}:${candidate.canonicalKey}:${candidate.externalUrl ?? ""}`,
    ),
  );
  let discovered = 0;

  const fragranticaSweep = brandWindow(
    brands,
    state.connectorMemory.fragrantica.discoveryCursor,
    Math.max(1, Math.min(limit, 8)),
  );
  for (const brand of fragranticaSweep.slice) {
    try {
      const snapshots = await searchFragranticaFragrances(
        brand,
        4,
        state.connectors.fragrantica.config.timeoutMs,
      );
      for (const snapshot of snapshots) {
        const key = `${"fragrantica"}:${canonicalKey(snapshot.perfumeName, snapshot.brand)}:${snapshot.externalUrl}`;
        if (existingCandidateKeys.has(key)) {
          continue;
        }

        existingCandidateKeys.add(key);
        const match = masterByKey.get(canonicalKey(snapshot.perfumeName, snapshot.brand)) ?? null;
        const candidate = createDiscoveryCandidateFromSnapshot(
          snapshot,
          "fragrantica",
          "fragrantica-live",
          match,
        );
        state.discoveredCandidates = [candidate, ...state.discoveredCandidates].slice(0, 6000);
        discovered += 1;
      }
    } catch {
      continue;
    }
  }

  state.connectorMemory.fragrantica.discoveryCursor = fragranticaSweep.nextCursor;
  if (fragranticaSweep.nextCursor === 0 && brands.length > 0) {
    state.connectorMemory.fragrantica.lastFullDiscoveryAt = nowIso();
  }

  const parfumoSweep = brandWindow(
    brands,
    state.connectorMemory.parfumo.discoveryCursor,
    Math.max(1, Math.min(limit, 8)),
  );
  for (const brand of parfumoSweep.slice) {
    try {
      const snapshots = await searchParfumoFragrances(
        brand,
        4,
        state.connectors.parfumo.config.timeoutMs,
      );
      for (const snapshot of snapshots) {
        const key = `${"parfumo"}:${canonicalKey(snapshot.perfumeName, snapshot.brand)}:${snapshot.externalUrl}`;
        if (existingCandidateKeys.has(key)) {
          continue;
        }

        existingCandidateKeys.add(key);
        const match = masterByKey.get(canonicalKey(snapshot.perfumeName, snapshot.brand)) ?? null;
        const candidate = createDiscoveryCandidateFromSnapshot(
          snapshot,
          "parfumo",
          "parfumo-live",
          match,
        );
        state.discoveredCandidates = [candidate, ...state.discoveredCandidates].slice(0, 6000);
        discovered += 1;
      }
    } catch {
      continue;
    }
  }

  state.connectorMemory.parfumo.discoveryCursor = parfumoSweep.nextCursor;
  if (parfumoSweep.nextCursor === 0 && brands.length > 0) {
    state.connectorMemory.parfumo.lastFullDiscoveryAt = nowIso();
  }

  const manufacturerSites = loadManufacturerSites();
  const manufacturerSweep = brandWindow(
    manufacturerSites,
    state.connectorMemory.manufacturer.discoveryCursor,
    Math.max(1, Math.min(limit, Math.max(1, manufacturerSites.length))),
  );
  for (const site of manufacturerSweep.slice) {
    try {
      const snapshots = await searchManufacturerFragrances(site, 8, state.connectors.custom.config.timeoutMs);
      for (const snapshot of snapshots) {
        const key = `${"custom"}:${canonicalKey(snapshot.perfumeName, snapshot.brand)}:${snapshot.externalUrl}`;
        if (existingCandidateKeys.has(key)) {
          continue;
        }

        existingCandidateKeys.add(key);
        const match = masterByKey.get(canonicalKey(snapshot.perfumeName, snapshot.brand)) ?? null;
        const candidate = createDiscoveryCandidateFromSnapshot(
          {
            ...snapshot,
            launchYear: "",
            perfumer: "",
            gender: "unknown",
            mainAccords: [],
            notes: [],
            imageUrl: "",
            rating: "",
            voteCount: "",
            releaseStatus: "active",
            availability: "available",
          },
          "custom",
          snapshot.source,
          match,
        );
        state.discoveredCandidates = [candidate, ...state.discoveredCandidates].slice(0, 6000);
        discovered += 1;
      }
    } catch {
      continue;
    }
  }

  state.connectorMemory.manufacturer.discoveryCursor = manufacturerSweep.nextCursor;
  if (manufacturerSweep.nextCursor === 0 && manufacturerSites.length > 0) {
    state.connectorMemory.manufacturer.lastFullDiscoveryAt = nowIso();
  }

  const generated = generateDiscoveryJobs(state, limit + discovered);
  prioritizePendingJobs(state);

  if (generated > 0) {
    appendHistory(state, {
      connector: "all",
      runType: "sync",
      startedAt: nowIso(),
      finishedAt: nowIso(),
      status: "success",
      executionTimeMs: 0,
      importedRecords: generated,
      updatedRecords: 0,
      failedRecords: 0,
      missingFields: 0,
      queueSize: state.jobs.filter((job) => job.status === "pending" || job.status === "running").length,
      confidence: 1,
      note: `Builder generated ${generated} discovery jobs from connector feeds.`,
    });
  }

  const hydrated = await buildDashboard(state);
  writeConnectorState(state);

  return {
    generated,
    pending: hydrated.pendingConnectorJobs,
  };
};

const autoApproveDiscoveryCandidates = (
  state: ConnectorState,
  confidenceThreshold: number,
): { approved: number; merged: number } => {
  let approved = 0;
  let merged = 0;

  for (const candidate of state.discoveredCandidates) {
    if (!(candidate.status === "new" || candidate.status === "review" || candidate.status === "matched")) {
      continue;
    }

    if (candidate.confidence < confidenceThreshold) {
      continue;
    }

    candidate.resolvedAt = nowIso();
    if (candidate.matchedPerfumeId) {
      candidate.reviewAction = "merge";
      candidate.status = "merged";
      candidate.mergedIntoPerfumeId = candidate.matchedPerfumeId;
      state.jobs = [
        createDiscoveryJobFromCandidate(candidate, "matched-existing"),
        ...state.jobs,
      ].slice(0, 12000);
      merged += 1;
      continue;
    }

    candidate.reviewAction = "approve";
    candidate.status = "imported";
    state.jobs = [
      createDiscoveryJobFromCandidate(candidate, "new-perfume"),
      ...state.jobs,
    ].slice(0, 12000);
    approved += 1;
  }

  return { approved, merged };
};

const writeCompleteDatabaseExport = async (state: ConnectorState): Promise<void> => {
  const master = await loadMasterDatabaseWorkspaceData();
  const fragDb = await getAllFragranticaSnapshots(state.connectors.fragrantica.config.timeoutMs);

  type CombinedRecord = {
    source: string;
    perfume: string;
    brand: string;
    launchYear: string;
    confidence: number;
    canonicalKey: string;
    status: string;
    externalId?: string;
    externalUrl?: string;
    rating?: string;
    voteCount?: string;
    gender?: string;
    perfumer?: string;
    notes?: string[];
    mainAccords?: string[];
    imageUrl?: string;
  };

  const masterRows: CombinedRecord[] = master.rows.map((row) => ({
    source: "master-database",
    perfume: row.perfume,
    brand: row.brand,
    launchYear: row.launchYear,
    confidence: row.confidence,
    canonicalKey: canonicalKey(row.perfume, row.brand),
    status: "existing",
  }));

  const fragDbRows: CombinedRecord[] = fragDb.items.map((item) => ({
    source: fragDb.mode === "local" ? "fragdb-local" : "fragdb-sample",
    perfume: item.perfumeName,
    brand: item.brand,
    launchYear: item.launchYear,
    confidence: item.confidence,
    canonicalKey: canonicalKey(item.perfumeName, item.brand),
    status: "imported",
    externalId: item.externalId,
    externalUrl: item.externalUrl,
    rating: item.rating,
    voteCount: item.voteCount,
    gender: item.gender,
    perfumer: item.perfumer,
    notes: item.notes,
    mainAccords: item.mainAccords,
    imageUrl: item.imageUrl,
  }));

  const mergedByKey = new Map<string, CombinedRecord>();
  let duplicatesResolvedInFavorOfFragDb = 0;

  for (const row of masterRows) {
    mergedByKey.set(row.canonicalKey, row);
  }

  for (const row of fragDbRows) {
    if (mergedByKey.has(row.canonicalKey)) {
      duplicatesResolvedInFavorOfFragDb += 1;
    }
    // Requirement: for duplicates, keep FRAGDB source row.
    mergedByKey.set(row.canonicalKey, row);
  }

  const discoveryRows: CombinedRecord[] = state.discoveredCandidates
    .filter((candidate) =>
      candidate.status === "imported" || candidate.status === "merged" || candidate.status === "matched",
    )
    .map((candidate) => ({
      source: candidate.source,
      perfume: candidate.perfume,
      brand: candidate.brand,
      launchYear: "",
      confidence: candidate.confidence,
      canonicalKey: candidate.canonicalKey,
      status: candidate.status,
      externalUrl: candidate.externalUrl ?? undefined,
    }))
    .filter((row) => !mergedByKey.has(row.canonicalKey));

  const finalRecords = [...mergedByKey.values(), ...discoveryRows].sort((left, right) =>
    left.canonicalKey.localeCompare(right.canonicalKey),
  );

  const payload = {
    generatedAt: nowIso(),
    mergePolicy: "dedupe by canonicalKey (brand+perfume), prefer FRAGDB on duplicates",
    fragDbMode: fragDb.mode,
    totalMasterPerfumes: masterRows.length,
    totalFragDbPerfumes: fragDbRows.length,
    duplicatesResolvedInFavorOfFragDb,
    totalDiscoveryOnlyPerfumes: discoveryRows.length,
    totalCombinedPerfumes: finalRecords.length,
    sources: {
      fragdb: finalRecords.filter((item) => /^fragdb/i.test(item.source)).length,
      master: finalRecords.filter((item) => item.source === "master-database").length,
      parfumo: finalRecords.filter((item) => /parfumo/i.test(item.source)).length,
      manufacturer: finalRecords.filter((item) => /manufacturer/i.test(item.source)).length,
    },
    records: finalRecords,
  };

  fs.mkdirSync(path.dirname(COMPLETE_DB_OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(COMPLETE_DB_OUTPUT_PATH, JSON.stringify(payload, null, 2), "utf-8");
};

export const runCompleteDatabaseSynchronization = async (): Promise<SourcesWorkspaceData> => {
  const state = readConnectorState();
  clearStaleQueuedJobs(state, "fragrantica");

  const activeConnectors: ConnectorType[] = (["fragrantica", "parfumo", "custom", "images"] as ConnectorType[])
    .filter((connector) => state.connectors[connector].config.enabled);

  const maxCycles = 16;
  const stableTarget = 2;
  let stableCycles = 0;
  let lastPending = Number.POSITIVE_INFINITY;
  let totalAutoApproved = 0;
  let totalMerged = 0;

  for (let cycle = 0; cycle < maxCycles; cycle += 1) {
    const beforeCount = state.discoveredCandidates.length;

    for (const connector of activeConnectors) {
      await runSingleConnector(state, connector, "run");
    }

    generateDiscoveryJobs(state, 1200);
    await generateEnrichmentJobs(state, 1800);

    const auto = autoApproveDiscoveryCandidates(state, 0.62);
    totalAutoApproved += auto.approved;
    totalMerged += auto.merged;

    prioritizePendingJobs(state);

    const pending = state.jobs.filter(
      (job) => job.status === "pending" || job.status === "running",
    ).length;
    const growth = state.discoveredCandidates.length - beforeCount;

    if (pending === 0 && growth <= 0 && pending === lastPending) {
      stableCycles += 1;
    } else {
      stableCycles = 0;
    }

    lastPending = pending;
    if (stableCycles >= stableTarget) {
      break;
    }
  }

  appendHistory(state, {
    connector: "all",
    runType: "run",
    startedAt: nowIso(),
    finishedAt: nowIso(),
    status: "success",
    executionTimeMs: 0,
    importedRecords: totalAutoApproved + totalMerged,
    updatedRecords: totalMerged,
    failedRecords: 0,
    missingFields: 0,
    queueSize: state.jobs.filter((job) => job.status === "pending" || job.status === "running").length,
    confidence: 1,
    note: `One-click complete sync executed across ${activeConnectors.length} connectors. Auto-approved ${totalAutoApproved}, merged ${totalMerged}.`,
  });

  await writeCompleteDatabaseExport(state);

  const hydrated = await buildDashboard(state);
  writeConnectorState(state);
  return hydrated;
};

export const clearStaleFragranticaQueue = async (): Promise<{ cleared: number; pending: number }> => {
  const state = readConnectorState();
  const staleCleanup = clearStaleQueuedJobs(state, "fragrantica");
  const now = nowIso();
  let forcedCleared = 0;

  state.jobs = state.jobs.map((job) => {
    if (job.connector !== "fragrantica" || !isQueuedJob(job)) {
      return job;
    }

    forcedCleared += 1;
    return {
      ...job,
      status: "cancelled" as ConnectorJobStatus,
      result: job.result ?? "skipped",
      finishedAt: now,
      durationMs: job.durationMs ?? 0,
      errorMessage: "Manually cancelled from Studio cleanup action.",
    };
  });

  const totalCleared = staleCleanup.cleared + forcedCleared;
  prioritizePendingJobs(state);

  appendHistory(state, {
    connector: "fragrantica",
    runType: "sync",
    startedAt: nowIso(),
    finishedAt: nowIso(),
    status: "success",
    executionTimeMs: 0,
    importedRecords: 0,
    updatedRecords: totalCleared,
    failedRecords: 0,
    missingFields: 0,
    queueSize: state.jobs.filter((job) => job.connector === "fragrantica" && isQueuedJob(job)).length,
    confidence: 1,
    note:
      totalCleared > 0
        ? `Cleared ${totalCleared} FragDB queued jobs (${staleCleanup.cleared} stale, ${forcedCleared} active).`
        : "No FragDB queued jobs found.",
  });

  const hydrated = await buildDashboard(state);
  writeConnectorState(state);

  return {
    cleared: totalCleared,
    pending: hydrated.pendingConnectorJobs,
  };
};

export const runFragranticaSmokeTest = async (): Promise<SourcesWorkspaceData> => {
  const state = readConnectorState();
  const runtime = state.connectors.fragrantica;
  const previousBatch = runtime.config.batchSize;
  const previousTimeout = runtime.config.timeoutMs;

  clearStaleQueuedJobs(state, "fragrantica");

  runtime.config.batchSize = Math.max(1, Math.min(2, previousBatch));
  runtime.config.timeoutMs = Math.max(12000, Math.min(previousTimeout, 20000));

  try {
    generateDiscoveryJobs(state, 20);
    await generateEnrichmentJobs(state, 40);
    prioritizePendingJobs(state);

    await runSingleConnector(state, "fragrantica", "run");
  } finally {
    runtime.config.batchSize = previousBatch;
    runtime.config.timeoutMs = previousTimeout;
  }

  appendHistory(state, {
    connector: "fragrantica",
    runType: "run",
    startedAt: nowIso(),
    finishedAt: nowIso(),
    status: "success",
    executionTimeMs: 0,
    importedRecords: 0,
    updatedRecords: 0,
    failedRecords: 0,
    missingFields: 0,
    queueSize: state.jobs.filter((job) => job.connector === "fragrantica" && isQueuedJob(job)).length,
    confidence: state.connectors.fragrantica.execution.confidence,
    note: "Fragrantica smoke test executed with reduced batch and timeout.",
  });

  const hydrated = await buildDashboard(state);
  writeConnectorState(state);
  return hydrated;
};

export const reviewDiscoveryCandidate = async (
  candidateId: string,
  action: DiscoveryReviewAction,
): Promise<SourcesWorkspaceData> => {
  const state = readConnectorState();
  const candidate = state.discoveredCandidates.find((item) => item.id === candidateId);

  if (!candidate) {
    return await buildDashboard(state);
  }

  const resolvedAt = nowIso();
  candidate.reviewAction = action;
  candidate.resolvedAt = resolvedAt;

  if (action === "approve") {
    candidate.status = "imported";
    const job = createDiscoveryJobFromCandidate(
      candidate,
      candidate.matchedPerfumeId ? "matched-existing" : "new-perfume",
    );
    state.jobs = [job, ...state.jobs].slice(0, 12000);
    state.scheduler.lastDiscoverySyncAt = resolvedAt;
    appendHistory(state, {
      connector: candidate.connector,
      runType: "sync",
      startedAt: resolvedAt,
      finishedAt: resolvedAt,
      status: "success",
      executionTimeMs: 0,
      importedRecords: 1,
      updatedRecords: 0,
      failedRecords: 0,
      missingFields: 0,
      queueSize: state.jobs.filter((job) => job.status === "pending" || job.status === "running").length,
      confidence: candidate.confidence,
      note: `Approved discovery ${candidate.perfume} from ${candidate.source} into the master database pipeline.`,
    });
  } else if (action === "merge") {
    candidate.status = "merged";
    candidate.mergedIntoPerfumeId = candidate.matchedPerfumeId;
    const job = createDiscoveryJobFromCandidate(
      candidate,
      candidate.matchedPerfumeId ? "matched-existing" : "new-perfume",
    );
    state.jobs = [job, ...state.jobs].slice(0, 12000);
    state.scheduler.lastDiscoverySyncAt = resolvedAt;
    appendHistory(state, {
      connector: candidate.connector,
      runType: "sync",
      startedAt: resolvedAt,
      finishedAt: resolvedAt,
      status: "success",
      executionTimeMs: 0,
      importedRecords: 1,
      updatedRecords: 0,
      failedRecords: 0,
      missingFields: 0,
      queueSize: state.jobs.filter((job) => job.status === "pending" || job.status === "running").length,
      confidence: candidate.confidence,
      note: `Merged discovery ${candidate.perfume} into canonical master records.`,
    });
  } else if (action === "reject") {
    candidate.status = "rejected";
    appendHistory(state, {
      connector: candidate.connector,
      runType: "sync",
      startedAt: resolvedAt,
      finishedAt: resolvedAt,
      status: "success",
      executionTimeMs: 0,
      importedRecords: 0,
      updatedRecords: 0,
      failedRecords: 0,
      missingFields: 0,
      queueSize: state.jobs.filter((job) => job.status === "pending" || job.status === "running").length,
      confidence: candidate.confidence,
      note: `Rejected discovery ${candidate.perfume} from ${candidate.source}.`,
    });
  } else {
    candidate.status = "ignored";
    appendHistory(state, {
      connector: candidate.connector,
      runType: "sync",
      startedAt: resolvedAt,
      finishedAt: resolvedAt,
      status: "success",
      executionTimeMs: 0,
      importedRecords: 0,
      updatedRecords: 0,
      failedRecords: 0,
      missingFields: 0,
      queueSize: state.jobs.filter((job) => job.status === "pending" || job.status === "running").length,
      confidence: candidate.confidence,
      note: `Ignored discovery ${candidate.perfume} from ${candidate.source}.`,
    });
  }

  prioritizePendingJobs(state);

  const hydrated = await buildDashboard(state);
  writeConnectorState(state);
  return hydrated;
};

export const loadSourcesWorkspaceData = async (): Promise<SourcesWorkspaceData> => {
  const state = readConnectorState();
  const hydrated = await buildDashboard(state);
  writeConnectorState(state);
  return hydrated;
};
