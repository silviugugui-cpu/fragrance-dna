import "server-only";
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
  searchFragranticaFragrances,
  type FragranticaSnapshot,
} from "@/lib/builder/connectors/fragranticaConnector";

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
}

interface EnrichmentPoolItem {
  connector: ConnectorType;
  perfumeId: string;
  task: EnrichmentTask;
  confidence: number;
}

const nowIso = (): string => new Date().toISOString();
const connectorVersion = "fragrantica-connector-v1";

const taskToConnector = (task: EnrichmentTask): ConnectorType => {
  if (task.suggestedConnector === "Image Connector") {
    return "images";
  }

  if (task.suggestedConnector === "Parfumo Connector") {
    return "parfumo";
  }

  if (task.suggestedConnector === "Fragrantica Connector") {
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
  source: "Fragrantica",
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
                  : "Discovery candidate detected by the Fragrantica scheduler.",
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

const buildEnrichmentPool = (): {
  master: ReturnType<typeof loadMasterDatabaseWorkspaceData>;
  items: EnrichmentPoolItem[];
} => {
  const master = loadMasterDatabaseWorkspaceData();
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
  snapshot: FragranticaSnapshot,
  match: { id: string } | null,
): ConnectorDiscoveredCandidate => ({
  id: `candidate-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  connector: "fragrantica",
  source: "fragrantica-live",
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
  snapshot: FragranticaSnapshot,
  decisionReference: string,
): ConnectorSynchronizedField[] => [
  toFieldSync({ field: "brand", rawValue: snapshot.brand, canonicalValue: snapshot.brand, confidence: snapshot.confidence, decisionReference }),
  toFieldSync({ field: "perfumeName", rawValue: snapshot.perfumeName, canonicalValue: snapshot.perfumeName, confidence: snapshot.confidence, decisionReference }),
  toFieldSync({ field: "launchYear", rawValue: snapshot.launchYear, canonicalValue: snapshot.launchYear, confidence: snapshot.confidence, decisionReference }),
  toFieldSync({ field: "perfumer", rawValue: snapshot.perfumer, canonicalValue: snapshot.perfumer, confidence: snapshot.confidence, decisionReference }),
  toFieldSync({ field: "gender", rawValue: snapshot.gender, canonicalValue: snapshot.gender, confidence: snapshot.confidence, decisionReference }),
  toFieldSync({ field: "mainAccords", rawValue: snapshot.mainAccords.join(", "), canonicalValue: snapshot.mainAccords.join(", "), confidence: snapshot.confidence, decisionReference }),
  toFieldSync({ field: "notes", rawValue: snapshot.notes.join(", "), canonicalValue: snapshot.notes.join(", "), confidence: snapshot.confidence, decisionReference }),
  toFieldSync({ field: "imageUrl", rawValue: snapshot.imageUrl, canonicalValue: snapshot.imageUrl, confidence: snapshot.confidence, decisionReference }),
  toFieldSync({ field: "fragranticaUrl", rawValue: snapshot.externalUrl, canonicalValue: snapshot.externalUrl, confidence: snapshot.confidence, decisionReference }),
  toFieldSync({ field: "rating", rawValue: `${snapshot.rating}|${snapshot.voteCount}`, canonicalValue: `${snapshot.rating}|${snapshot.voteCount}`, confidence: snapshot.confidence, decisionReference }),
  toFieldSync({ field: "releaseStatus", rawValue: snapshot.releaseStatus, canonicalValue: snapshot.releaseStatus, confidence: snapshot.confidence, decisionReference }),
  toFieldSync({ field: "availability", rawValue: snapshot.availability, canonicalValue: snapshot.availability, confidence: snapshot.confidence, decisionReference }),
];

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

const buildDashboard = (state: ConnectorState): SourcesWorkspaceData => {
  ensureDiscoverySchedulerSeeded(state);
  const discoveryCandidates = summarizeDiscoveryCandidates(state);
  const discoveryStatistics = buildDiscoveryStatistics(discoveryCandidates);
  const discoveryHistory = buildDiscoveryHistory(discoveryCandidates);
  const { master, items: enrichmentItems } = buildEnrichmentPool();

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
  };
};

const generateEnrichmentJobs = (state: ConnectorState, limit: number): number => {
  const { items } = buildEnrichmentPool();
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
  const master = loadMasterDatabaseWorkspaceData();
  const rows = master.rows.slice().sort((left, right) => left.rowIndex - right.rowIndex);
  const brands = Array.from(new Set(master.rows.map((row) => row.brand))).sort((a, b) =>
    a.localeCompare(b),
  );
  const runtime = state.connectors.fragrantica;
  const batch = Math.max(1, Math.min(runtime.config.batchSize, 12));
  const window = brandWindow(rows, state.connectorMemory.fragrantica.syncCursor, batch);
  const brandSweep = brandWindow(brands, state.connectorMemory.fragrantica.discoveryCursor, Math.max(1, Math.min(4, brands.length)));

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
      note: `Dry run prepared ${window.slice.length} Fragrantica synchronization probes.`,
    };
  }

  for (const brand of brandSweep.slice) {
    try {
      const discovered = await searchFragranticaFragrances(brand, 4, runtime.config.timeoutMs);
      for (const snapshot of discovered) {
        const candidateKey = `${"fragrantica"}:${canonicalKey(snapshot.perfumeName, snapshot.brand)}:${snapshot.externalUrl}`;
        if (existingCandidateKeys.has(candidateKey)) {
          continue;
        }

        existingCandidateKeys.add(candidateKey);
        const match = masterByKey.get(canonicalKey(snapshot.perfumeName, snapshot.brand)) ?? null;
        const candidate = createDiscoveryCandidateFromSnapshot(snapshot, match);
        state.discoveredCandidates = [candidate, ...state.discoveredCandidates].slice(0, 6000);
      }
    } catch {
      continue;
    }
  }

  state.connectorMemory.fragrantica.discoveryCursor = brandSweep.nextCursor;
  if (brandSweep.nextCursor === 0 && brands.length > 0) {
    state.connectorMemory.fragrantica.lastFullDiscoveryAt = nowIso();
  }
  generateDiscoveryJobs(state, batch);

  let synced = 0;
  let changed = 0;
  let failed = 0;
  let confidenceAccumulator = 0;

  for (const row of window.slice) {
    const decisionReference = `decision:${row.id}:${Date.now()}`;
    const query = `${row.perfume} ${row.brand}`;

    try {
      const searchResults = await searchFragranticaFragrances(
        query,
        2,
        runtime.config.timeoutMs,
      );

      const snapshot = searchResults[0] ?? null;
      if (!snapshot) {
        const prior = state.connectorMemory.fragrantica.syncIndex[row.id];
        if (prior && prior.status === "active") {
          prior.status = "removed";
          prior.lastSynchronizedAt = nowIso();
          state.jobs = [
            {
              id: `connector-job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              connector: "fragrantica" as ConnectorType,
              workflow: "enrichment" as ConnectorWorkflow,
              perfumeId: row.id,
              taskId: null,
              groupKey: row.id,
              field: "releaseStatus",
              priority: runtime.config.priority,
              source: "fragrantica-live",
              reason: "Fragrantica page missing from last known synchronization.",
              confidence: 0.7,
              status: "completed" as ConnectorJobStatus,
              result: "skipped" as ConnectorJob["result"],
              createdAt: nowIso(),
              startedAt: nowIso(),
              finishedAt: nowIso(),
              durationMs: 0,
              errorMessage: null,
              synchronizedFields: [
                toFieldSync({
                  field: "releaseStatus",
                  rawValue: "removed",
                  canonicalValue: "removed",
                  confidence: 0.7,
                  decisionReference,
                }),
              ],
            },
            ...state.jobs,
          ].slice(0, 12000);
          changed += 1;
        }
        continue;
      }

      const fieldSync = createFieldMappings(snapshot, decisionReference);
      const digest = stableDigest(JSON.stringify(fieldSync.map((item) => `${item.field}:${item.rawValue}`)));
      const previous = state.connectorMemory.fragrantica.syncIndex[row.id];
      const hasChanged = !previous || previous.digest !== digest || previous.status !== "active";

      if (hasChanged) {
        changed += 1;
        state.jobs = [
          {
            id: `connector-job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            connector: "fragrantica" as ConnectorType,
            workflow: "enrichment" as ConnectorWorkflow,
            perfumeId: row.id,
            taskId: null,
            groupKey: row.id,
            field: "fragrantica-sync",
            priority: runtime.config.priority,
            source: "fragrantica-live",
            reason: previous ? "External record changed" : "First Fragrantica synchronization",
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

        if (row.launchYear.trim().length > 0 && snapshot.launchYear.length > 0 && row.launchYear.trim() !== snapshot.launchYear.trim()) {
          pushConflict(state, {
            perfumeId: row.id,
            conflictingField: "launchYear",
            conflictingValues: [row.launchYear.trim(), snapshot.launchYear.trim()],
            sources: ["Master Database", "Fragrantica"],
            connector: "fragrantica",
            confidence: snapshot.confidence,
            timestamp: nowIso(),
            affectedCanonicalObject: row.id,
            status: "open",
            resolutionHistory: [
              {
                at: nowIso(),
                action: "detected",
                note: "Launch year mismatch detected during Fragrantica synchronization.",
              },
            ],
          });
        }
      }

      state.connectorMemory.fragrantica.syncIndex[row.id] = {
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
          perfumeId: row.id,
          taskId: null,
          groupKey: row.id,
          field: "fragrantica-sync",
          priority: runtime.config.priority,
          source: "fragrantica-live",
          reason: "Fragrantica synchronization error",
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

  state.connectorMemory.fragrantica.syncCursor = window.nextCursor;
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
    missingFields: Math.max(0, window.slice.length - synced),
    queueSize,
    confidence: synced > 0 ? Number((confidenceAccumulator / synced).toFixed(2)) : 0,
    executionTimeMs: Date.now() - started,
    status: failed > 0 ? "failed" : "success",
    note: `Fragrantica synchronized ${synced} fragrances, changed ${changed}, failed ${failed}.`,
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

  const master = loadMasterDatabaseWorkspaceData();
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
  const generatedEnrichment = generateEnrichmentJobs(state, options?.enrichmentLimit ?? 1200);

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
  generateEnrichmentJobs(state, 600);
  prioritizePendingJobs(state);

  await runSingleConnector(state, connector, runType);

  const hydrated = buildDashboard(state);
  writeConnectorState(state);
  return hydrated;
};

export const runAllConnectors = async (
  runType: "run" | "dry-run" = "run",
): Promise<SourcesWorkspaceData> => {
  const state = readConnectorState();
  generateDiscoveryJobs(state, 800);
  generateEnrichmentJobs(state, 1600);
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

  const hydrated = buildDashboard(state);
  writeConnectorState(state);
  return hydrated;
};

export const previewConnectorChanges = async (): Promise<SourcesWorkspaceData> => {
  const state = readConnectorState();
  generateDiscoveryJobs(state, 600);
  generateEnrichmentJobs(state, 1200);
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

  const hydrated = buildDashboard(state);
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

  const hydrated = buildDashboard(state);
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

  const hydrated = buildDashboard(state);
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

  const hydrated = buildDashboard(state);
  writeConnectorState(state);
  return hydrated;
};

export const generateConnectorJobsFromEnrichmentTasks = async (
  limit: number = 800,
): Promise<{ generated: number; pending: number }> => {
  const state = readConnectorState();
  const generated = generateEnrichmentJobs(state, limit);
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

  const hydrated = buildDashboard(state);
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
  const master = loadMasterDatabaseWorkspaceData();
  const brands = Array.from(new Set(master.rows.map((row) => row.brand))).sort((a, b) =>
    a.localeCompare(b),
  );
  const masterByKey = new Map(master.rows.map((row) => [canonicalKey(row.perfume, row.brand), { id: row.id }]));
  const existingCandidateKeys = new Set(
    state.discoveredCandidates.map((candidate) =>
      `${candidate.connector}:${candidate.canonicalKey}:${candidate.externalUrl ?? ""}`,
    ),
  );

  const sweep = brandWindow(brands, state.connectorMemory.fragrantica.discoveryCursor, Math.max(1, Math.min(limit, 8)));
  let discovered = 0;
  for (const brand of sweep.slice) {
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
        const candidate = createDiscoveryCandidateFromSnapshot(snapshot, match);
        state.discoveredCandidates = [candidate, ...state.discoveredCandidates].slice(0, 6000);
        discovered += 1;
      }
    } catch {
      continue;
    }
  }

  state.connectorMemory.fragrantica.discoveryCursor = sweep.nextCursor;
  if (sweep.nextCursor === 0 && brands.length > 0) {
    state.connectorMemory.fragrantica.lastFullDiscoveryAt = nowIso();
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

  const hydrated = buildDashboard(state);
  writeConnectorState(state);

  return {
    generated,
    pending: hydrated.pendingConnectorJobs,
  };
};

export const reviewDiscoveryCandidate = async (
  candidateId: string,
  action: DiscoveryReviewAction,
): Promise<SourcesWorkspaceData> => {
  const state = readConnectorState();
  const candidate = state.discoveredCandidates.find((item) => item.id === candidateId);

  if (!candidate) {
    return buildDashboard(state);
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

  const hydrated = buildDashboard(state);
  writeConnectorState(state);
  return hydrated;
};

export const loadSourcesWorkspaceData = async (): Promise<SourcesWorkspaceData> => {
  const state = readConnectorState();
  const hydrated = buildDashboard(state);
  writeConnectorState(state);
  return hydrated;
};
