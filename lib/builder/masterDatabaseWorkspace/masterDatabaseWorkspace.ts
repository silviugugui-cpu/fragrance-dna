import "server-only";
import { createBuilderConfig } from "@/lib/builder/config";
import { readConnectorState, type ConnectorType } from "@/lib/builder/connectors/connectorState";
import { runCanonicalBuilderIntelligence } from "@/lib/builder/intelligence/canonicalBuilderIntelligence";
import { parseVoteDistribution } from "@/lib/builder/validationEngine/rules/ValidationPackTypes";
import {
  loadBuilderDecisionWorkspaceData,
  type BuilderDecisionType,
} from "@/lib/builder/decisionEngine/decisionEngine";

export type BuilderStatus = "complete" | "partial" | "missing-core";
export type ValidationStatus = "passed" | "warning" | "failed";
export type ReviewStatus = "approved" | "pending-review";
export type KnowledgeStatus = "mapped" | "partial" | "unmapped";
export type PerformanceStatus = "available" | "missing";
export type SuggestedConnector =
  | "Image Connector"
  | "Parfumo Connector"
  | "Fragrantica Connector"
  | "Review";

export interface EnrichmentTask {
  id: string;
  field: string;
  reason: string;
  suggestedConnector: SuggestedConnector;
  resolutionType: "automatic" | "review";
}

export interface MasterDatabaseListRow {
  id: string;
  worksheet: string;
  rowIndex: number;
  perfume: string;
  brand: string;
  launchYear: string;
  notesCount: number;
  accordsCount: number;
  coveragePercent: number;
  completionPercent: number;
  confidence: number;
  missingFieldsCount: number;
  reviewRequired: boolean;
  builderStatus: BuilderStatus;
  validationStatus: ValidationStatus;
  reviewStatus: ReviewStatus;
  knowledgeStatus: KnowledgeStatus;
  performanceStatus: PerformanceStatus;
  published: boolean;
  searchText: string;
}

export interface MasterDatabaseDetailPanel {
  id: string;
  perfume: string;
  brand: string;
  launchYear: string;
  notes: string[];
  matchedNotes: string[];
  unresolvedNotes: string[];
  mainAccords: string[];
  longevityVotes: Record<string, number>;
  sillageVotes: Record<string, number>;
  validation: {
    status: ValidationStatus;
    issues: string[];
  };
  review: {
    status: ReviewStatus;
    reasons: string[];
  };
  builder: {
    status: BuilderStatus;
    coveragePercent: number;
    confidence: number;
  };
  decision: {
    current: BuilderDecisionType;
    confidence: number;
    explanation: string;
    triggeredRules: string[];
    sourceConnector: string;
    timestamp: string;
    suggestedNextAction: string;
    history: Array<{
      at: string;
      ruleId: string;
      decision: BuilderDecisionType;
      reason: string;
    }>;
    provenance: Array<{
      key: string;
      source: string;
      method: string;
      confidence: number;
    }>;
    alternativeCandidates: Array<{
      id: string;
      perfume: string;
      brand: string;
      launchYear: string;
      decision: BuilderDecisionType;
      confidence: number;
      reason: string;
    }>;
  };
  knowledge: {
    status: KnowledgeStatus;
    mappedCount: number;
    unresolvedCount: number;
  };
  relationships: {
    sameBrandPerfumes: string[];
    commonNotes: Array<{ note: string; count: number }>;
  };
  translation: {
    status: "ready" | "needs-review";
    unresolvedTokens: string[];
  };
  canonical: {
    brand: string | null;
    family: string | null;
    gender: string | null;
    accords: string[];
    recommendationTags: string[];
    availabilityStatus: string | null;
    longevity: string | null;
    sillage: string | null;
  };
  intelligence: {
    completionPercentage: number;
    missingFields: string[];
    dataQualityScore: number;
    builderConfidence: number;
    reviewRequired: boolean;
    automaticResolutionPossible: boolean;
    suggestedConnector: SuggestedConnector;
    provenanceCompleteness: number;
    validationCompleteness: number;
    knowledgeCompleteness: number;
    enrichmentTasks: EnrichmentTask[];
  };
  connectors: {
    discoverySource: string;
    requiredConnectors: ConnectorType[];
    missingFields: string[];
    pendingEnrichment: number;
    pendingJobs: number;
    completedJobs: number;
    confidence: number;
    connectorStatus: Array<{
      connector: ConnectorType;
      status: "idle" | "running" | "error";
      pendingJobs: number;
      failedJobs: number;
      lastRun: string;
      lastSuccessfulRun: string;
    }>;
    connectorHistory: Array<{
      at: string;
      connector: ConnectorType;
      workflow: "discovery" | "enrichment";
      status: "pending" | "running" | "completed" | "failed" | "cancelled";
      result: "new-perfume" | "matched-existing" | "ambiguous" | "enriched" | "skipped" | null;
      confidence: number;
    }>;
    synchronizationHistory: Array<{
      at: string;
      connector: ConnectorType;
      source: string;
      confidence: number;
      fields: Array<{
        field: string;
        rawValue: string;
        canonicalValue: string;
        decisionReference: string;
      }>;
    }>;
    importedSources: string[];
    lastSynchronized: string;
    conflictStatus: "none" | "open" | "resolved";
    pendingSynchronizations: number;
    completedSynchronizations: number;
    enrichmentHistory: Array<{
      at: string;
      connector: ConnectorType;
      jobId: string;
      field: string;
      status: "pending" | "running" | "completed" | "failed" | "cancelled";
    }>;
  };
}

export interface MasterDatabaseWorkspaceResult {
  generatedAt: string;
  totalPerfumes: number;
  totalBrands: number;
  totalNotes: number;
  totalAccords: number;
  coveragePercent: number;
  builderCompletionPercent: number;
  validationCompletionPercent: number;
  pendingReview: number;
  validationIssueCount: number;
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
  published: number;
  automationPercentage: number;
  automaticResolutions: number;
  canonicalObjectsGenerated: number;
  averageBuilderConfidence: number;
  overallCompletionPercent: number;
  missingImages: number;
  missingPerfumers: number;
  missingLaunchYears: number;
  pendingEnrichmentJobs: number;
  rows: MasterDatabaseListRow[];
  detailsById: Record<string, MasterDatabaseDetailPanel>;
  builderMetadata: {
    workbookPath: string;
    importVersion: string;
    builderVersion: string;
  };
}

const normalizeText = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const suggestedToConnector = (value: SuggestedConnector): ConnectorType => {
  if (value === "Image Connector") {
    return "images";
  }

  if (value === "Parfumo Connector") {
    return "parfumo";
  }

  if (value === "Fragrantica Connector") {
    return "fragrantica";
  }

  return "custom";
};

const scoreToStatus = (
  confidence: number,
  unresolvedCount: number,
): {
  builder: BuilderStatus;
  validation: ValidationStatus;
  review: ReviewStatus;
} => {
  if (unresolvedCount === 0 && confidence >= 0.9) {
    return {
      builder: "complete",
      validation: "passed",
      review: "approved",
    };
  }

  if (confidence >= 0.7) {
    return {
      builder: "partial",
      validation: "warning",
      review: "pending-review",
    };
  }

  return {
    builder: "missing-core",
    validation: "failed",
    review: "pending-review",
  };
};

const toValidationCompleteness = (status: ValidationStatus): number => {
  if (status === "passed") {
    return 100;
  }

  if (status === "warning") {
    return 70;
  }

  return 35;
};

const toProvenanceCompleteness = (
  provenance: Record<string, { confidence: number }>,
): number => {
  const entries = Object.values(provenance);
  if (entries.length === 0) {
    return 0;
  }

  const complete = entries.filter((entry) => entry.confidence > 0).length;
  return Number(((complete / entries.length) * 100).toFixed(2));
};

const toKnowledgeCompleteness = (
  mappedNotes: number,
  totalNotes: number,
  resolvedAccords: number,
  totalAccords: number,
): number => {
  const notes = totalNotes > 0 ? mappedNotes / totalNotes : 0;
  const accords = totalAccords > 0 ? resolvedAccords / totalAccords : 0;

  if (totalNotes === 0 && totalAccords === 0) {
    return 0;
  }

  if (totalNotes === 0) {
    return Number((accords * 100).toFixed(2));
  }

  if (totalAccords === 0) {
    return Number((notes * 100).toFixed(2));
  }

  return Number((((notes + accords) / 2) * 100).toFixed(2));
};

const buildEnrichmentTasks = (input: {
  id: string;
  imageMissing: boolean;
  perfumerMissing: boolean;
  launchYearMissing: boolean;
  brandAmbiguous: boolean;
  familyMissing: boolean;
  genderMissing: boolean;
}): EnrichmentTask[] => {
  const tasks: EnrichmentTask[] = [];

  if (input.imageMissing) {
    tasks.push({
      id: `${input.id}:image`,
      field: "image",
      reason: "Image missing",
      suggestedConnector: "Image Connector",
      resolutionType: "automatic",
    });
  }

  if (input.perfumerMissing) {
    tasks.push({
      id: `${input.id}:perfumer`,
      field: "perfumer",
      reason: "Perfumer missing",
      suggestedConnector: "Parfumo Connector",
      resolutionType: "automatic",
    });
  }

  if (input.launchYearMissing) {
    tasks.push({
      id: `${input.id}:launch-year`,
      field: "launchYear",
      reason: "Launch year missing",
      suggestedConnector: "Fragrantica Connector",
      resolutionType: "automatic",
    });
  }

  if (input.familyMissing) {
    tasks.push({
      id: `${input.id}:family`,
      field: "family",
      reason: "Family missing",
      suggestedConnector: "Fragrantica Connector",
      resolutionType: "automatic",
    });
  }

  if (input.genderMissing) {
    tasks.push({
      id: `${input.id}:gender`,
      field: "gender",
      reason: "Gender missing",
      suggestedConnector: "Fragrantica Connector",
      resolutionType: "automatic",
    });
  }

  if (input.brandAmbiguous) {
    tasks.push({
      id: `${input.id}:brand-review`,
      field: "brand",
      reason: "Brand ambiguous",
      suggestedConnector: "Review",
      resolutionType: "review",
    });
  }

  return tasks;
};

const getMissingFields = (input: {
  imageMissing: boolean;
  perfumerMissing: boolean;
  launchYearMissing: boolean;
  brandMissing: boolean;
  familyMissing: boolean;
  genderMissing: boolean;
  notesMissing: boolean;
  accordsMissing: boolean;
  performanceMissing: boolean;
  availabilityMissing: boolean;
}): string[] => {
  const missing: string[] = [];
  if (input.imageMissing) missing.push("image");
  if (input.perfumerMissing) missing.push("perfumer");
  if (input.launchYearMissing) missing.push("launchYear");
  if (input.brandMissing) missing.push("brand");
  if (input.familyMissing) missing.push("family");
  if (input.genderMissing) missing.push("gender");
  if (input.notesMissing) missing.push("notes");
  if (input.accordsMissing) missing.push("mainAccords");
  if (input.performanceMissing) missing.push("performance");
  if (input.availabilityMissing) missing.push("availability");
  return missing;
};

export const loadMasterDatabaseWorkspaceData = (): MasterDatabaseWorkspaceResult => {
  const config = createBuilderConfig();
  const intelligence = runCanonicalBuilderIntelligence();
  const decisionWorkspace = loadBuilderDecisionWorkspaceData();

  const rows: MasterDatabaseListRow[] = [];
  const detailsById: Record<string, MasterDatabaseDetailPanel> = {};
  const decisionById = new Map(decisionWorkspace.reports.map((report) => [report.id, report]));

  const brandToPerfumes = new Map<string, string[]>();
  const notePresenceCount = new Map<string, number>();
  const noteSetById = new Map<string, Set<string>>();

  const uniqueBrands = new Set<string>();
  const uniqueNotes = new Set<string>();
  const uniqueAccords = new Set<string>();

  let builderCompleteCount = 0;
  let validationPassedCount = 0;
  let pendingReviewCount = 0;
  let publishedCount = 0;
  let validationIssueCount = 0;
  let coverageAccumulator = 0;
  let completionAccumulator = 0;
  let missingImages = 0;
  let missingPerfumers = 0;
  let missingLaunchYears = 0;
  let pendingEnrichmentJobs = 0;

  for (const object of intelligence.objects) {
    const decisionReport = decisionById.get(object.id) ?? null;
    const mappedNotes = object.canonicalNotes.value ?? [];
    const unresolvedNotes = object.unresolvedNotes;
    const accords = object.canonicalMainAccords.value ?? [];

    const statuses = scoreToStatus(object.builderConfidence, object.unresolvedEntities);

    const imageMissing = !object.imageUrl;
    const perfumerMissing = object.rawPerfumers.length === 0;
    const launchYearMissing = object.launchYear.trim().length === 0;
    const brandMissing = !object.canonicalBrand.resolved;
    const familyMissing = !object.canonicalFamily.resolved;
    const genderMissing = !object.canonicalGender.resolved;
    const notesMissing = mappedNotes.length + unresolvedNotes.length === 0;
    const accordsMissing = accords.length + object.unresolvedMainAccords.length === 0;
    const performanceMissing = !object.performance.resolved;
    const availabilityMissing = !object.availability.resolved;
    const brandAmbiguous =
      !object.canonicalBrand.resolved ||
      object.canonicalBrand.confidence < 0.97 ||
      object.canonicalBrand.method === "normalized-match";

    const missingFields = getMissingFields({
      imageMissing,
      perfumerMissing,
      launchYearMissing,
      brandMissing,
      familyMissing,
      genderMissing,
      notesMissing,
      accordsMissing,
      performanceMissing,
      availabilityMissing,
    });

    const checksPassed = 10 - missingFields.length;
    const completionPercentage = Number(((checksPassed / 10) * 100).toFixed(2));
    const coveragePercent = completionPercentage;

    const knowledgeCompleteness = toKnowledgeCompleteness(
      mappedNotes.length,
      mappedNotes.length + unresolvedNotes.length,
      accords.length,
      accords.length + object.unresolvedMainAccords.length,
    );

    const issues: string[] = [];
    if (brandAmbiguous) {
      issues.push("Brand requires disambiguation");
    }
    if (unresolvedNotes.length > 0) {
      issues.push(`Unresolved notes: ${unresolvedNotes.length}`);
    }
    if (object.unresolvedMainAccords.length > 0) {
      issues.push(`Unresolved accords: ${object.unresolvedMainAccords.length}`);
    }
    if (familyMissing) {
      issues.push("Canonical family unresolved");
    }
    if (genderMissing) {
      issues.push("Canonical gender unresolved");
    }
    if (performanceMissing) {
      issues.push("Performance metadata unresolved");
    }
    if (imageMissing) {
      issues.push("Image missing");
    }
    if (perfumerMissing) {
      issues.push("Perfumer missing");
    }
    if (launchYearMissing) {
      issues.push("Launch year missing");
    }

    validationIssueCount += issues.length;

    const enrichmentTasks = buildEnrichmentTasks({
      id: object.id,
      imageMissing,
      perfumerMissing,
      launchYearMissing,
      brandAmbiguous,
      familyMissing,
      genderMissing,
    });

    const automaticTasks = enrichmentTasks.filter((task) => task.resolutionType === "automatic");
    const reviewTasks = enrichmentTasks.filter((task) => task.resolutionType === "review");

    const reviewRequired = decisionReport?.currentDecision === "REVIEW_REQUIRED";
    const automaticResolutionPossible = automaticTasks.length > 0 && reviewTasks.length === 0;
    const suggestedConnector: SuggestedConnector =
      automaticTasks[0]?.suggestedConnector ?? reviewTasks[0]?.suggestedConnector ?? "Review";

    const validationCompleteness = toValidationCompleteness(statuses.validation);
    const provenanceCompleteness = toProvenanceCompleteness(object.provenance);

    const dataQualityScore = Number(
      (
        completionPercentage * 0.35 +
        object.builderConfidence * 100 * 0.25 +
        validationCompleteness * 0.15 +
        provenanceCompleteness * 0.15 +
        knowledgeCompleteness * 0.1
      ).toFixed(2),
    );

    const performanceStatus: PerformanceStatus = object.performance.resolved
      ? "available"
      : "missing";
    const knowledgeStatus: KnowledgeStatus =
      unresolvedNotes.length === 0
        ? "mapped"
        : mappedNotes.length > 0
          ? "partial"
          : "unmapped";

    const published =
      statuses.builder === "complete" &&
      statuses.validation === "passed" &&
      !reviewRequired;

    if (statuses.builder === "complete") {
      builderCompleteCount += 1;
    }
    if (statuses.validation === "passed") {
      validationPassedCount += 1;
    }
    if (reviewRequired) {
      pendingReviewCount += 1;
    }
    if (published) {
      publishedCount += 1;
    }

    if (imageMissing) {
      missingImages += 1;
    }
    if (perfumerMissing) {
      missingPerfumers += 1;
    }
    if (launchYearMissing) {
      missingLaunchYears += 1;
    }
    pendingEnrichmentJobs += automaticTasks.length + reviewTasks.length;

    coverageAccumulator += coveragePercent;
    completionAccumulator += completionPercentage;

    const row: MasterDatabaseListRow = {
      id: object.id,
      worksheet: object.worksheet,
      rowIndex: object.rowIndex,
      perfume: object.perfume,
      brand: object.canonicalBrand.value ?? object.rawBrand,
      launchYear: object.launchYear,
      notesCount: mappedNotes.length + unresolvedNotes.length,
      accordsCount: accords.length + object.unresolvedMainAccords.length,
      coveragePercent,
      completionPercent: completionPercentage,
      confidence: object.builderConfidence,
      missingFieldsCount: missingFields.length,
      reviewRequired,
      builderStatus: statuses.builder,
      validationStatus: statuses.validation,
      reviewStatus: reviewRequired ? "pending-review" : "approved",
      knowledgeStatus,
      performanceStatus,
      published,
      searchText: normalizeText(
        `${object.perfume} ${object.canonicalBrand.value ?? object.rawBrand} ${mappedNotes.join(" ")} ${accords.join(" ")} ${missingFields.join(" ")}`,
      ),
    };

    rows.push(row);

    const longevityVotes = parseVoteDistribution(object.performance.value?.longevity);
    const sillageVotes = parseVoteDistribution(object.performance.value?.sillage);

    detailsById[object.id] = {
      id: object.id,
      perfume: object.perfume,
      brand: object.canonicalBrand.value ?? object.rawBrand,
      launchYear: object.launchYear,
      notes: [...mappedNotes, ...unresolvedNotes],
      matchedNotes: mappedNotes,
      unresolvedNotes,
      mainAccords: [...accords, ...object.unresolvedMainAccords],
      longevityVotes,
      sillageVotes,
      validation: {
        status: statuses.validation,
        issues,
      },
      review: {
        status: reviewRequired ? "pending-review" : "approved",
        reasons:
          issues.length > 0 ? issues : ["Master perfume entity is complete and requires no review."],
      },
      builder: {
        status: statuses.builder,
        coveragePercent,
        confidence: object.builderConfidence,
      },
      decision: {
        current: decisionReport?.currentDecision ?? "REVIEW_REQUIRED",
        confidence: decisionReport?.confidence ?? object.builderConfidence,
        explanation:
          decisionReport?.explanation ??
          "Decision engine data is unavailable for this record.",
        triggeredRules: decisionReport?.triggeredRules ?? [],
        sourceConnector: decisionReport?.sourceConnector ?? "Builder Core",
        timestamp: decisionReport?.timestamp ?? intelligence.generatedAt,
        suggestedNextAction: decisionReport?.suggestedNextAction ?? "Send to Review",
        history: decisionReport?.decisionHistory ?? [],
        provenance: decisionReport?.provenance ?? [],
        alternativeCandidates: decisionReport?.alternativeCandidates ?? [],
      },
      knowledge: {
        status: knowledgeStatus,
        mappedCount: mappedNotes.length,
        unresolvedCount: unresolvedNotes.length,
      },
      relationships: {
        sameBrandPerfumes: [],
        commonNotes: [],
      },
      translation: {
        status: unresolvedNotes.length > 0 ? "needs-review" : "ready",
        unresolvedTokens: unresolvedNotes,
      },
      canonical: {
        brand: object.canonicalBrand.value,
        family: object.canonicalFamily.value,
        gender: object.canonicalGender.value,
        accords,
        recommendationTags: object.recommendation.value?.tags ?? [],
        availabilityStatus: object.availability.value?.status ?? null,
        longevity: object.performance.value?.longevity ?? null,
        sillage: object.performance.value?.sillage ?? null,
      },
      intelligence: {
        completionPercentage,
        missingFields,
        dataQualityScore,
        builderConfidence: object.builderConfidence,
        reviewRequired,
        automaticResolutionPossible,
        suggestedConnector,
        provenanceCompleteness,
        validationCompleteness,
        knowledgeCompleteness,
        enrichmentTasks,
      },
      connectors: {
        discoverySource: "master-database",
        requiredConnectors: Array.from(new Set(enrichmentTasks.map((task) => suggestedToConnector(task.suggestedConnector)))),
        missingFields,
        pendingEnrichment: enrichmentTasks.length,
        pendingJobs: 0,
        completedJobs: 0,
        confidence: object.builderConfidence,
        connectorStatus: [],
        connectorHistory: [],
        synchronizationHistory: [],
        importedSources: [],
        lastSynchronized: "never",
        conflictStatus: "none",
        pendingSynchronizations: 0,
        completedSynchronizations: 0,
        enrichmentHistory: [],
      },
    };

    const brandKey = object.canonicalBrand.value ?? object.rawBrand;
    const brandRows = brandToPerfumes.get(brandKey) ?? [];
    brandRows.push(object.id);
    brandToPerfumes.set(brandKey, brandRows);

    for (const note of mappedNotes) {
      uniqueNotes.add(normalizeText(note));
    }
    for (const note of unresolvedNotes) {
      uniqueNotes.add(normalizeText(note));
    }

    const noteSet = new Set<string>(mappedNotes);
    noteSetById.set(object.id, noteSet);
    for (const note of noteSet) {
      notePresenceCount.set(note, (notePresenceCount.get(note) ?? 0) + 1);
    }

    for (const accord of accords) {
      uniqueAccords.add(normalizeText(accord));
    }
    for (const accord of object.unresolvedMainAccords) {
      uniqueAccords.add(normalizeText(accord));
    }

    uniqueBrands.add(normalizeText(brandKey));
  }

  for (const row of rows) {
    const detail = detailsById[row.id];
    const sameBrandIds = (brandToPerfumes.get(row.brand) ?? [])
      .filter((id) => id !== row.id)
      .slice(0, 12);

    detail.relationships.sameBrandPerfumes = sameBrandIds
      .map((id) => detailsById[id]?.perfume)
      .filter((value): value is string => Boolean(value));

    const currentNotes = noteSetById.get(row.id) ?? new Set<string>();
    detail.relationships.commonNotes = Array.from(currentNotes)
      .map((note) => ({
        note,
        count: Math.max(0, (notePresenceCount.get(note) ?? 0) - 1),
      }))
      .filter((item) => item.count > 0)
      .sort((left, right) => right.count - left.count)
      .slice(0, 10);
  }

  const connectorState = readConnectorState();
  for (const row of rows) {
    const detail = detailsById[row.id];
    const required = detail.connectors.requiredConnectors;
    const status = required.map((connector) => {
      const runtime = connectorState.connectors[connector];
      const connectorJobs = connectorState.jobs.filter(
        (job) => job.connector === connector && job.perfumeId === row.id,
      );

      return {
        connector,
        status: runtime.execution.status,
        pendingJobs: connectorJobs.filter((job) => job.status === "pending" || job.status === "running").length,
        failedJobs: connectorJobs.filter((job) => job.status === "failed").length,
        lastRun: runtime.execution.lastRun ?? "never",
        lastSuccessfulRun: runtime.execution.lastSuccessfulRun ?? "never",
      };
    });

    const history = connectorState.jobs
      .filter((job) => job.perfumeId === row.id)
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, 20)
      .map((job) => ({
        at: job.createdAt,
        connector: job.connector,
        jobId: job.id,
        field: job.field,
        status: job.status,
      }));

    const fullHistory = connectorState.jobs
      .filter((job) => job.perfumeId === row.id)
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, 30)
      .map((job) => ({
        at: job.createdAt,
        connector: job.connector,
        workflow: job.workflow,
        status: job.status,
        result: job.result,
        confidence: job.confidence,
      }));

    const synchronizationHistory = connectorState.jobs
      .filter((job) => job.perfumeId === row.id && Array.isArray(job.synchronizedFields) && job.synchronizedFields.length > 0)
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, 20)
      .map((job) => ({
        at: job.createdAt,
        connector: job.connector,
        source: job.source,
        confidence: job.confidence,
        fields: (job.synchronizedFields ?? []).map((field) => ({
          field: field.field,
          rawValue: field.rawValue,
          canonicalValue: field.canonicalValue,
          decisionReference: field.decisionReference,
        })),
      }));

    const completedJobs = connectorState.jobs.filter(
      (job) => job.perfumeId === row.id && job.status === "completed",
    ).length;

    const pendingJobs = connectorState.jobs.filter(
      (job) =>
        job.perfumeId === row.id && (job.status === "pending" || job.status === "running"),
    ).length;

    const latestDiscovery = connectorState.jobs
      .filter((job) => job.perfumeId === row.id && job.workflow === "discovery")
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0];

    const relatedConflicts = connectorState.conflicts.filter((conflict) => conflict.perfumeId === row.id);
    const conflictStatus = relatedConflicts.some((conflict) => conflict.status === "open")
      ? "open"
      : relatedConflicts.some((conflict) => conflict.status === "resolved")
        ? "resolved"
        : "none";

    detail.connectors.connectorStatus = status;
    detail.connectors.enrichmentHistory = history;
    detail.connectors.connectorHistory = fullHistory;
    detail.connectors.synchronizationHistory = synchronizationHistory;
    detail.connectors.importedSources = Array.from(new Set(synchronizationHistory.map((entry) => entry.source)));
    detail.connectors.lastSynchronized = synchronizationHistory[0]?.at ?? "never";
    detail.connectors.conflictStatus = conflictStatus;
    detail.connectors.pendingSynchronizations = fullHistory.filter((entry) => entry.workflow === "enrichment" && (entry.status === "pending" || entry.status === "running")).length;
    detail.connectors.completedSynchronizations = fullHistory.filter((entry) => entry.workflow === "enrichment" && entry.status === "completed").length;
    detail.connectors.pendingEnrichment = detail.intelligence.enrichmentTasks.length;
    detail.connectors.pendingJobs = pendingJobs;
    detail.connectors.completedJobs = completedJobs;
    detail.connectors.discoverySource = latestDiscovery?.source ?? "master-database";
    detail.connectors.confidence = Number(
      (
        fullHistory.reduce((sum, item) => sum + item.confidence, 0) /
        Math.max(1, fullHistory.length)
      ).toFixed(2),
    );
  }

  rows.sort((left, right) => left.perfume.localeCompare(right.perfume));

  const totalPerfumes = rows.length;
  const safeTotal = totalPerfumes > 0 ? totalPerfumes : 1;

  return {
    generatedAt: intelligence.generatedAt,
    totalPerfumes,
    totalBrands: uniqueBrands.size,
    totalNotes: uniqueNotes.size,
    totalAccords: uniqueAccords.size,
    coveragePercent: Number((coverageAccumulator / safeTotal).toFixed(2)),
    overallCompletionPercent: Number((completionAccumulator / safeTotal).toFixed(2)),
    builderCompletionPercent: Number(((builderCompleteCount / safeTotal) * 100).toFixed(2)),
    validationCompletionPercent: Number(((validationPassedCount / safeTotal) * 100).toFixed(2)),
    pendingReview: decisionWorkspace.reviewRequired,
    validationIssueCount,
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
    published: publishedCount,
    automationPercentage: decisionWorkspace.automationPercent,
    automaticResolutions: decisionWorkspace.automaticDecisions,
    canonicalObjectsGenerated: intelligence.canonicalObjectsGenerated,
    averageBuilderConfidence: intelligence.averageBuilderConfidence,
    missingImages,
    missingPerfumers,
    missingLaunchYears,
    pendingEnrichmentJobs,
    rows,
    detailsById,
    builderMetadata: {
      workbookPath: config.rawImport.workbookPath,
      importVersion: config.rawImport.importVersion,
      builderVersion: config.pipelineVersion,
    },
  };
};
