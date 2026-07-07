"use server";

import { revalidatePath } from "next/cache";
import {
  cancelConnectorExecution,
  previewConnectorChanges,
  reviewDiscoveryCandidate,
  retryFailedConnectorJobs,
  runAllConnectors,
  runConnector,
  generateDiscoveryJobsFromConnectors,
  updateConnectorConfiguration,
} from "@/lib/builder/connectors/sourcesWorkspace";
import type { ConnectorType } from "@/lib/builder/connectors/connectorState";

const revalidateSources = (): void => {
  revalidatePath("/studio");
  revalidatePath("/studio/dashboard");
  revalidatePath("/studio/sources");
  revalidatePath("/studio/master-database");
};

const parseConnector = (value: FormDataEntryValue | null): ConnectorType | null => {
  if (typeof value !== "string") {
    return null;
  }

  const allowed: ConnectorType[] = [
    "local-excel",
    "fragrantica",
    "parfumo",
    "notino",
    "parfimo",
    "miraj",
    "images",
    "custom",
  ];

  return allowed.includes(value as ConnectorType) ? (value as ConnectorType) : null;
};

const parseDiscoveryAction = (value: FormDataEntryValue | null): "approve" | "reject" | "ignore" | "merge" | null => {
  if (value === "approve" || value === "reject" || value === "ignore" || value === "merge") {
    return value;
  }

  return null;
};

export const runConnectorAction = async (formData: FormData): Promise<void> => {
  const connector = parseConnector(formData.get("connector"));
  const mode = formData.get("mode") === "dry-run" ? "dry-run" : "run";
  if (!connector) {
    return;
  }

  await runConnector(connector, mode);
  revalidateSources();
};

export const runAllConnectorsAction = async (): Promise<void> => {
  await runAllConnectors("run");
  revalidateSources();
};

export const dryRunAllConnectorsAction = async (): Promise<void> => {
  await runAllConnectors("dry-run");
  revalidateSources();
};

export const previewConnectorsAction = async (): Promise<void> => {
  await previewConnectorChanges();
  revalidateSources();
};

export const refreshDiscoveryQueueAction = async (): Promise<void> => {
  await generateDiscoveryJobsFromConnectors();
  revalidateSources();
};

export const cancelConnectorsAction = async (): Promise<void> => {
  await cancelConnectorExecution();
  revalidateSources();
};

export const retryFailedConnectorJobsAction = async (formData: FormData): Promise<void> => {
  const connector = parseConnector(formData.get("connector"));
  await retryFailedConnectorJobs(connector ?? "all");
  revalidateSources();
};

export const updateConnectorConfigAction = async (formData: FormData): Promise<void> => {
  const connector = parseConnector(formData.get("connector"));
  if (!connector) {
    return;
  }

  const enabled = formData.get("enabled") === "on";
  const batchSize = Number(formData.get("batchSize"));
  const timeoutMs = Number(formData.get("timeoutMs"));
  const priority = Number(formData.get("priority"));
  const dryRunDefault = formData.get("dryRunDefault") === "on";

  await updateConnectorConfiguration(connector, {
    enabled,
    batchSize: Number.isFinite(batchSize) ? Math.max(1, Math.floor(batchSize)) : undefined,
    timeoutMs: Number.isFinite(timeoutMs) ? Math.max(1000, Math.floor(timeoutMs)) : undefined,
    priority: Number.isFinite(priority) ? Math.max(1, Math.floor(priority)) : undefined,
    dryRunDefault,
  });

  revalidateSources();
};

export const reviewDiscoveryCandidateAction = async (formData: FormData): Promise<void> => {
  const candidateId = formData.get("candidateId");
  const action = parseDiscoveryAction(formData.get("action"));

  if (typeof candidateId !== "string" || action === null) {
    return;
  }

  await reviewDiscoveryCandidate(candidateId, action);
  revalidateSources();
};
