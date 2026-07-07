import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createBuilderConfig } from "@/lib/builder/config";

export type ConnectorType =
  | "local-excel"
  | "fragrantica"
  | "parfumo"
  | "notino"
  | "parfimo"
  | "miraj"
  | "images"
  | "custom";

export type ConnectorJobStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export type ConnectorWorkflow = "discovery" | "enrichment";
export type ConnectorExecutionStatus = "idle" | "running" | "error";
export type ConflictStatus = "open" | "resolved" | "ignored";

export interface ConnectorConfig {
  enabled: boolean;
  batchSize: number;
  timeoutMs: number;
  priority: number;
  dryRunDefault: boolean;
}

export interface ConnectorExecutionMeta {
  status: ConnectorExecutionStatus;
  health: number;
  coverage: number;
  lastRun: string | null;
  lastSuccessfulRun: string | null;
  executionTimeMs: number;
  importedRecords: number;
  updatedRecords: number;
  failedRecords: number;
  missingFields: number;
  pendingJobs: number;
  queueSize: number;
  confidence: number;
}

export interface ConnectorRuntime {
  config: ConnectorConfig;
  execution: ConnectorExecutionMeta;
}

export interface ConnectorRegistryItem {
  connector: ConnectorType;
  label: string;
  supportsDiscovery: boolean;
  supportsEnrichment: boolean;
  skeleton: boolean;
  description: string;
}

export interface ConnectorJob {
  id: string;
  connector: ConnectorType;
  workflow: ConnectorWorkflow;
  perfumeId: string | null;
  taskId: string | null;
  groupKey: string;
  field: string;
  priority: number;
  source: string;
  reason: string;
  confidence: number;
  status: ConnectorJobStatus;
  result: "new-perfume" | "matched-existing" | "ambiguous" | "enriched" | "skipped" | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
  errorMessage: string | null;
  synchronizedFields?: ConnectorSynchronizedField[];
}

export interface ConnectorSynchronizedField {
  field: string;
  source: string;
  connector: ConnectorType;
  synchronizedAt: string;
  confidence: number;
  rawValue: string;
  canonicalValue: string;
  connectorVersion: string;
  decisionReference: string;
}

export interface ConnectorDiscoveredCandidate {
  id: string;
  connector: ConnectorType;
  source: string;
  perfume: string;
  brand: string;
  canonicalKey: string;
  confidence: number;
  status: "new" | "pending" | "matched" | "duplicate" | "imported" | "rejected" | "ignored" | "merged" | "review";
  reviewAction: "discover" | "approve" | "reject" | "ignore" | "merge" | null;
  matchedPerfumeId: string | null;
  duplicateOfCandidateId: string | null;
  mergedIntoPerfumeId: string | null;
  discoveredAt: string;
  resolvedAt: string | null;
  externalId: string | null;
  externalUrl: string | null;
}

export interface ConnectorConflictRecord {
  id: string;
  perfumeId: string;
  conflictingField: string;
  conflictingValues: string[];
  sources: string[];
  connector: ConnectorType;
  confidence: number;
  timestamp: string;
  affectedCanonicalObject: string;
  status: ConflictStatus;
  resolutionHistory: Array<{
    at: string;
    action: string;
    note: string;
  }>;
}

export interface ConnectorHistoryItem {
  id: string;
  connector: ConnectorType | "all";
  runType: "run" | "dry-run" | "preview" | "sync";
  startedAt: string;
  finishedAt: string;
  status: "success" | "failed" | "cancelled";
  executionTimeMs: number;
  importedRecords: number;
  updatedRecords: number;
  failedRecords: number;
  missingFields: number;
  queueSize: number;
  confidence: number;
  note: string;
}

export interface ConnectorState {
  registry: Record<ConnectorType, ConnectorRegistryItem>;
  connectors: Record<ConnectorType, ConnectorRuntime>;
  jobs: ConnectorJob[];
  discoveredCandidates: ConnectorDiscoveredCandidate[];
  conflicts: ConnectorConflictRecord[];
  scheduler: {
    lastDiscoverySyncAt: string | null;
    lastEnrichmentSyncAt: string | null;
    lastPrioritizationAt: string | null;
  };
  connectorMemory: {
    fragrantica: {
      discoveryCursor: number;
      syncCursor: number;
      lastFullDiscoveryAt: string | null;
      syncIndex: Record<
        string,
        {
          url: string;
          digest: string;
          status: "active" | "removed";
          lastSynchronizedAt: string;
        }
      >;
    };
  };
  history: ConnectorHistoryItem[];
  lastUpdatedAt: string;
}

const connectorTypes: ConnectorType[] = [
  "local-excel",
  "fragrantica",
  "parfumo",
  "notino",
  "parfimo",
  "miraj",
  "images",
  "custom",
];

const defaultConfigByConnector: Record<ConnectorType, ConnectorConfig> = {
  "local-excel": { enabled: true, batchSize: 1200, timeoutMs: 45000, priority: 1, dryRunDefault: false },
  fragrantica: { enabled: true, batchSize: 400, timeoutMs: 30000, priority: 2, dryRunDefault: true },
  parfumo: { enabled: true, batchSize: 400, timeoutMs: 30000, priority: 3, dryRunDefault: true },
  notino: { enabled: true, batchSize: 300, timeoutMs: 30000, priority: 4, dryRunDefault: true },
  parfimo: { enabled: true, batchSize: 300, timeoutMs: 30000, priority: 5, dryRunDefault: true },
  miraj: { enabled: true, batchSize: 300, timeoutMs: 30000, priority: 6, dryRunDefault: true },
  images: { enabled: true, batchSize: 800, timeoutMs: 30000, priority: 2, dryRunDefault: false },
  custom: { enabled: true, batchSize: 200, timeoutMs: 30000, priority: 8, dryRunDefault: true },
};

const defaultExecutionMeta = (): ConnectorExecutionMeta => ({
  status: "idle",
  health: 100,
  coverage: 0,
  lastRun: null,
  lastSuccessfulRun: null,
  executionTimeMs: 0,
  importedRecords: 0,
  updatedRecords: 0,
  failedRecords: 0,
  missingFields: 0,
  pendingJobs: 0,
  queueSize: 0,
  confidence: 1,
});

const defaultRegistryByConnector: Record<ConnectorType, ConnectorRegistryItem> = {
  "local-excel": {
    connector: "local-excel",
    label: "Local Excel",
    supportsDiscovery: true,
    supportsEnrichment: true,
    skeleton: false,
    description: "Seed connector for local workbook discovery and field enrichment updates.",
  },
  fragrantica: {
    connector: "fragrantica",
    label: "Fragrantica",
    supportsDiscovery: true,
    supportsEnrichment: true,
    skeleton: true,
    description: "Discovery-first operational skeleton with lifecycle and queue integration.",
  },
  parfumo: {
    connector: "parfumo",
    label: "Parfumo",
    supportsDiscovery: false,
    supportsEnrichment: true,
    skeleton: true,
    description: "Enrichment operational skeleton for missing perfumer and metadata fields.",
  },
  notino: {
    connector: "notino",
    label: "Notino",
    supportsDiscovery: false,
    supportsEnrichment: true,
    skeleton: true,
    description: "Connector reserved for enrichment synchronization.",
  },
  parfimo: {
    connector: "parfimo",
    label: "Parfimo",
    supportsDiscovery: false,
    supportsEnrichment: true,
    skeleton: true,
    description: "Connector reserved for enrichment synchronization.",
  },
  miraj: {
    connector: "miraj",
    label: "Miraj",
    supportsDiscovery: false,
    supportsEnrichment: true,
    skeleton: true,
    description: "Connector reserved for enrichment synchronization.",
  },
  images: {
    connector: "images",
    label: "Images",
    supportsDiscovery: false,
    supportsEnrichment: true,
    skeleton: false,
    description: "Image enrichment connector for missing artwork coverage.",
  },
  custom: {
    connector: "custom",
    label: "Custom Connectors",
    supportsDiscovery: true,
    supportsEnrichment: true,
    skeleton: true,
    description: "Custom integration connector slot for external providers.",
  },
};

const defaultState = (): ConnectorState => ({
  registry: {
    "local-excel": { ...defaultRegistryByConnector["local-excel"] },
    fragrantica: { ...defaultRegistryByConnector.fragrantica },
    parfumo: { ...defaultRegistryByConnector.parfumo },
    notino: { ...defaultRegistryByConnector.notino },
    parfimo: { ...defaultRegistryByConnector.parfimo },
    miraj: { ...defaultRegistryByConnector.miraj },
    images: { ...defaultRegistryByConnector.images },
    custom: { ...defaultRegistryByConnector.custom },
  },
  connectors: {
    "local-excel": { config: { ...defaultConfigByConnector["local-excel"] }, execution: defaultExecutionMeta() },
    fragrantica: { config: { ...defaultConfigByConnector.fragrantica }, execution: defaultExecutionMeta() },
    parfumo: { config: { ...defaultConfigByConnector.parfumo }, execution: defaultExecutionMeta() },
    notino: { config: { ...defaultConfigByConnector.notino }, execution: defaultExecutionMeta() },
    parfimo: { config: { ...defaultConfigByConnector.parfimo }, execution: defaultExecutionMeta() },
    miraj: { config: { ...defaultConfigByConnector.miraj }, execution: defaultExecutionMeta() },
    images: { config: { ...defaultConfigByConnector.images }, execution: defaultExecutionMeta() },
    custom: { config: { ...defaultConfigByConnector.custom }, execution: defaultExecutionMeta() },
  },
  jobs: [],
  discoveredCandidates: [],
  conflicts: [],
  scheduler: {
    lastDiscoverySyncAt: null,
    lastEnrichmentSyncAt: null,
    lastPrioritizationAt: null,
  },
  connectorMemory: {
    fragrantica: {
      discoveryCursor: 0,
      syncCursor: 0,
      lastFullDiscoveryAt: null,
      syncIndex: {},
    },
  },
  history: [],
  lastUpdatedAt: new Date().toISOString(),
});

const getStateFilePath = (): string => {
  const config = createBuilderConfig();
  return path.join(config.paths.logsRoot, "builder-connectors-state.json");
};

const ensureStateDir = (): void => {
  const statePath = getStateFilePath();
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
};

export const readConnectorState = (): ConnectorState => {
  const statePath = getStateFilePath();
  if (!fs.existsSync(statePath)) {
    return defaultState();
  }

  try {
    const raw = fs.readFileSync(statePath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<ConnectorState>;
    const fallback = defaultState();

    const mergedRegistry = connectorTypes.reduce<Record<ConnectorType, ConnectorRegistryItem>>(
      (acc, connector) => {
        const maybe = parsed.registry?.[connector];
        acc[connector] = {
          ...defaultRegistryByConnector[connector],
          ...(maybe ?? {}),
        };
        return acc;
      },
      { ...fallback.registry },
    );

    const mergedConnectors = connectorTypes.reduce<Record<ConnectorType, ConnectorRuntime>>(
      (acc, connector) => {
        const maybe = parsed.connectors?.[connector];
        acc[connector] = {
          config: {
            ...defaultConfigByConnector[connector],
            ...(maybe?.config ?? {}),
          },
          execution: {
            ...defaultExecutionMeta(),
            ...(maybe?.execution ?? {}),
          },
        };
        return acc;
      },
      { ...fallback.connectors },
    );

    return {
      registry: mergedRegistry,
      connectors: mergedConnectors,
      jobs: Array.isArray(parsed.jobs) ? parsed.jobs : [],
      discoveredCandidates: Array.isArray(parsed.discoveredCandidates)
        ? parsed.discoveredCandidates
        : [],
      conflicts: Array.isArray(parsed.conflicts) ? parsed.conflicts : [],
      scheduler: {
        ...fallback.scheduler,
        ...(parsed.scheduler ?? {}),
      },
      connectorMemory: {
        fragrantica: {
          ...fallback.connectorMemory.fragrantica,
          ...(parsed.connectorMemory?.fragrantica ?? {}),
          syncIndex: {
            ...fallback.connectorMemory.fragrantica.syncIndex,
            ...(parsed.connectorMemory?.fragrantica?.syncIndex ?? {}),
          },
        },
      },
      history: Array.isArray(parsed.history) ? parsed.history : [],
      lastUpdatedAt: parsed.lastUpdatedAt ?? fallback.lastUpdatedAt,
    };
  } catch {
    return defaultState();
  }
};

export const writeConnectorState = (state: ConnectorState): void => {
  ensureStateDir();
  const next: ConnectorState = {
    ...state,
    history: state.history.slice(0, 400),
    jobs: state.jobs.slice(0, 12000),
    discoveredCandidates: state.discoveredCandidates.slice(0, 6000),
    conflicts: state.conflicts.slice(0, 6000),
    lastUpdatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(getStateFilePath(), JSON.stringify(next, null, 2), "utf-8");
};

export const connectorLabel = (connector: ConnectorType): string => {
  const map: Record<ConnectorType, string> = {
    "local-excel": "Local Excel",
    fragrantica: "Fragrantica",
    parfumo: "Parfumo",
    notino: "Notino",
    parfimo: "Parfimo",
    miraj: "Miraj",
    images: "Images",
    custom: "Custom Connectors",
  };

  return map[connector];
};
