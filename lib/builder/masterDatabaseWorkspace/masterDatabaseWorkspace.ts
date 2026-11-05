import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createBuilderConfig } from "@/lib/builder/config";
import { readConnectorState, type ConnectorType } from "@/lib/builder/connectors/connectorState";
import { runCanonicalBuilderIntelligence } from "@/lib/builder/intelligence/canonicalBuilderIntelligence";
import { parseVoteDistribution } from "@/lib/builder/validationEngine/rules/ValidationPackTypes";
import {
  countMasterFragrances,
  deleteMasterFragrancesByRecordId,
  getMasterFragranceDatabasePath,
  insertMasterFragrance,
  readAllMasterFragrances,
  updateMasterFragrancesByRecordId,
  type MasterFragranceRecord,
  type UserDnaProfileRecord,
} from "@/lib/database/masterFragranceDatabase";
import {
  loadBuilderDecisionWorkspaceData,
  type BuilderDecisionType,
} from "@/lib/builder/decisionEngine/decisionEngine";

export type BuilderStatus = "complete" | "partial" | "missing-core";
export type ValidationStatus = "passed" | "warning" | "failed";
export type ReviewStatus = "approved" | "pending-review";
export type KnowledgeStatus = "mapped" | "partial" | "unmapped";
export type PerformanceStatus = "available" | "missing";
export type BrandType = "N/A" | "Designer" | "Niche" | "Dupe/Middle Eastern";
export type UsabilityStatus = "usable" | "not-usable";
export type SuggestedConnector =
  | "Image Connector"
  | "Parfumo Connector"
  | "Fragrantica Connector"
  | "FragDB Connector"
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
  brandType: BrandType;
  launchYear: string;
  imageUrl: string;
  localImagePath: string;
  usableStatus: UsabilityStatus;
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
  userDnaTestEnabled: boolean;
  userDnaProfileCount: number;
  published: boolean;
  searchText: string;
}

export interface MasterDatabaseWorkspaceResult {
  generatedAt: string;
  totalPerfumes: number;
  userDnaProfileCount: number;
  workspacePerfumes: number;
  combinedPerfumes: number;
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

export interface MasterDatabaseDetailPanel {
  id: string;
  perfume: string;
  brand: string;
  launchYear: string;
  source: string;
  status: string;
  externalId: string;
  externalUrl: string;
  rating: string;
  voteCount: string;
  sourceFingerprint: string;
  perfumer: string;
  gender: string;
  description: string;
  imageUrl: string | null;
  blobImageUrl?: string;
  localImagePath: string | null;
  notes: string[];
  matchedNotes: string[];
  unresolvedNotes: string[];
  mainAccords: string[];
  userDnaTestEnabled: boolean;
  userDnaProfiles: UserDnaProfileRecord[];
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
    mergeTrust: {
      automaticMergeCount: number;
      manualMergeCount: number;
      conflictCount: number;
      averageDecisionConfidence: number;
      topConflictingFields: Array<{ field: string; count: number }>;
      topConflictingSources: Array<{ source: string; count: number }>;
      outcomes: Array<{ outcome: string; count: number }>;
      unresolvedConflicts: Array<{
        field: string;
        competingValues: string[];
        sources: string[];
        sourceTrust: Array<{ source: string; trust: number }>;
        confidence: number;
        status: "open" | "resolved";
        recommendedResolution: string;
        decisionExplanation: string;
      }>;
      provenance: Array<{
        field: string;
        canonicalValue: string;
        rawValue: string;
        source: string;
        connector: string;
        trustScore: number;
        decisionConfidence: number;
        synchronizationTimestamp: string;
        decisionTimestamp: string;
        decisionRule: string;
        decisionExplanation: string;
        conflictStatus: "none" | "open" | "resolved";
      }>;
    };
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
  workspacePerfumes: number;
  combinedPerfumes: number;
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

const normalizeBrandType = (value: unknown): BrandType => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  if (normalized === "designer") return "Designer";
  if (normalized === "niche") return "Niche";
  if (["doupe", "dupe", "dupe middle eastern", "middle eastern", "arabesc"].includes(normalized)) {
    return "Dupe/Middle Eastern";
  }
  return "N/A";
};

const toCanonicalKey = (brand: string, perfume: string): string =>
  `${normalizeText(brand)}::${normalizeText(perfume)}`;

const MASTER_FRAGRANCE_DATABASE_PATH = getMasterFragranceDatabasePath();
const MASTER_DB_LOCAL_IMAGES_DIR = path.join(process.cwd(), "public", "images", "perfumes");
const MASTER_DB_LOCAL_IMAGES_WEB_BASE = "/images/perfumes";

const MASTER_CACHE_TTL_MS = Math.max(
  1000,
  Number.parseInt(process.env.BUILDER_MASTER_CACHE_TTL_MS ?? "45000", 10) || 45000,
);

const slugify = (value: string): string =>
  normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

const imageExtFromUrl = (value: string): string => {
  const match = value.trim().toLowerCase().match(/\.(jpg|jpeg|png|webp|gif|avif)(?:\?|$)/i);
  if (!match) {
    return "jpg";
  }

  return match[1] === "jpeg" ? "jpg" : match[1].toLowerCase();
};

const imageExtFromContentType = (value: string | null): string | null => {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized.includes("image/jpeg")) return "jpg";
  if (normalized.includes("image/png")) return "png";
  if (normalized.includes("image/webp")) return "webp";
  if (normalized.includes("image/gif")) return "gif";
  if (normalized.includes("image/avif")) return "avif";
  return null;
};

const extractImageUrlFromHtml = (html: string, pageUrl: string): string => {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    /<meta[^>]+itemprop=["']image["'][^>]+content=["']([^"']+)["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    const candidate = String(match?.[1] ?? "").trim();
    if (!candidate) {
      continue;
    }

    try {
      return new URL(candidate, pageUrl).toString();
    } catch {
      continue;
    }
  }

  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  const imgCandidate = String(imgMatch?.[1] ?? "").trim();
  if (!imgCandidate) {
    return "";
  }

  try {
    return new URL(imgCandidate, pageUrl).toString();
  } catch {
    return "";
  }
};

const saveRemoteImageLocally = async (input: {
  recordId: string;
  brand: string;
  perfume: string;
  imageUrl: string;
}): Promise<{ imageUrl: string; localImagePath: string }> => {
  fs.mkdirSync(MASTER_DB_LOCAL_IMAGES_DIR, { recursive: true });

  const imageResponse = await fetch(input.imageUrl, {
    headers: {
      "user-agent": "FragranceDNA-MasterDB-ImageFetcher/1.0",
      accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    },
  });

  if (!imageResponse.ok) {
    throw new Error(`Image download failed with status ${imageResponse.status}.`);
  }

  const buffer = Buffer.from(await imageResponse.arrayBuffer());
  const ext = imageExtFromContentType(imageResponse.headers.get("content-type")) ?? imageExtFromUrl(input.imageUrl);
  const left = slugify(input.recordId) || "record";
  const right = slugify(`${input.brand}-${input.perfume}`) || "fragrance";
  const fileName = `master-db--${left}-${right}.${ext}`;
  const localFsPath = path.join(MASTER_DB_LOCAL_IMAGES_DIR, fileName);
  const localWebPath = `${MASTER_DB_LOCAL_IMAGES_WEB_BASE}/${fileName}`;

  fs.writeFileSync(localFsPath, buffer);
  return {
    imageUrl: input.imageUrl,
    localImagePath: localWebPath,
  };
};

let masterWorkspaceCache:
  | {
      expiresAt: number;
      value: MasterDatabaseWorkspaceResult;
    }
  | null = null;
let masterWorkspaceInFlight: Promise<MasterDatabaseWorkspaceResult> | null = null;
let combinedRecordsCache: CombinedDatabaseRecord[] | null = null;

const loadCombinedDatabaseTotal = (): number => countMasterFragrances();

type CombinedDatabaseRecord = MasterFragranceRecord;

type CombinedDatabaseRecordPatch = {
  perfume: string;
  brand: string;
  launchYear: string;
  source: string;
  status: string;
  externalId: string;
  externalUrl: string;
  rating: string;
  voteCount: string;
  sourceFingerprint: string;
  perfumer: string;
  gender: string;
  description: string;
  imageUrl: string;
  localImagePath: string;
  notes: string[];
  mainAccords: string[];
  userDnaTestEnabled?: boolean;
  userDnaProfile?: UserDnaProfileRecord;
};

const buildUniqueCombinedRecordId = (
  patch: CombinedDatabaseRecordPatch,
  existingIds: Set<string>,
): string => {
  const brandSlug = slugify(patch.brand) || "brand";
  const perfumeSlug = slugify(patch.perfume) || "perfume";
  const yearSegment = patch.launchYear.trim().length > 0 ? `-${patch.launchYear.trim()}` : "";
  const base = `manual::${brandSlug}-${perfumeSlug}${yearSegment}`;

  if (!existingIds.has(base)) {
    return base;
  }

  let index = 2;
  while (existingIds.has(`${base}-${index}`)) {
    index += 1;
  }

  return `${base}-${index}`;
};

const loadCombinedDatabaseRecords = (): CombinedDatabaseRecord[] => {
  try {
    if (combinedRecordsCache) return combinedRecordsCache;
    combinedRecordsCache = readAllMasterFragrances();
    return combinedRecordsCache;
  } catch {
    combinedRecordsCache = [];
    return [];
  }
};

export const loadMasterDatabaseDetailById = (
  recordId: string,
): MasterDatabaseDetailPanel | null => {
  const normalizedId = recordId.trim().toLowerCase();
  if (normalizedId.length === 0) {
    return null;
  }

  const records = loadCombinedDatabaseRecords();
  const selectedRecord = records.find((record) => {
    const id = String(record.id ?? record.canonicalKey ?? "").trim().toLowerCase();
    return id === normalizedId;
  });

  if (!selectedRecord) {
    return null;
  }

  const perfume = String(selectedRecord.perfume ?? selectedRecord.name ?? "").trim();
  const brand = String(selectedRecord.brand ?? "").trim();
  const source = String(selectedRecord.source ?? "combined-db");
  const canonicalKey = String(
    selectedRecord.canonicalKey ?? toCanonicalKey(brand, perfume) ?? normalizedId,
  );
  const id = String(selectedRecord.id ?? canonicalKey);
  const notes = Array.isArray(selectedRecord.notes)
    ? selectedRecord.notes.map((value) => String(value))
    : [];
  const accords = Array.isArray(selectedRecord.mainAccords)
    ? selectedRecord.mainAccords.map((value) => String(value))
    : [];
  return {
    ...buildDetailFallback({
      ...selectedRecord,
      canonicalKey,
      id,
      perfume,
      brand,
      source,
      notes,
      mainAccords: accords,
      imageUrl: String(selectedRecord.imageUrl ?? "").trim() || undefined,
      localImagePath: String(selectedRecord.localImagePath ?? "").trim() || undefined,
    }),
    id,
  };
};

const toSourceStatus = (record: CombinedDatabaseRecord): "passed" | "warning" | "failed" => {
  const perfume = String(record.perfume ?? record.name ?? "").trim();
  const brand = String(record.brand ?? "").trim();
  const launchYear = String(record.launchYear ?? "").trim();
  const notesCount = Array.isArray(record.notes) ? record.notes.length : 0;

  if (perfume.length > 0 && brand.length > 0 && launchYear.length > 0 && notesCount > 0) {
    return "passed";
  }

  if (perfume.length > 0 && brand.length > 0) {
    return "warning";
  }

  return "failed";
};

const toBuilderStatus = (record: CombinedDatabaseRecord): BuilderStatus => {
  const notesCount = Array.isArray(record.notes) ? record.notes.length : 0;
  const accordsCount = Array.isArray(record.mainAccords) ? record.mainAccords.length : 0;
  const hasIdentity = String(record.perfume ?? record.name ?? "").trim().length > 0 && String(record.brand ?? "").trim().length > 0;
  const hasLaunchYear = String(record.launchYear ?? "").trim().length > 0;

  if (hasIdentity && hasLaunchYear && (notesCount > 0 || accordsCount > 0)) {
    return "complete";
  }

  if (hasIdentity) {
    return "partial";
  }

  return "missing-core";
};

const toUsabilityStatus = (record: CombinedDatabaseRecord): UsabilityStatus =>
  toBuilderStatus(record) === "complete" ? "usable" : "not-usable";

const buildDetailFallback = (record: CombinedDatabaseRecord): MasterDatabaseDetailPanel => {
  const perfume = String(record.perfume ?? record.name ?? "");
  const brand = String(record.brand ?? "");
  const source = String(record.source ?? "combined-db");
  const status = String(record.status ?? source);
  const externalId = String(record.externalId ?? "");
  const externalUrl = String(record.externalUrl ?? "");
  const rating = String(record.rating ?? "");
  const voteCount = String(record.voteCount ?? "");
  const sourceFingerprint = String(record.sourceFingerprint ?? "");
  const perfumer = String(record.perfumer ?? "");
  const gender = String(record.gender ?? "");
  const description = String(record.description ?? "");
  const notes = Array.isArray(record.notes) ? record.notes.map((value) => String(value)) : [];
  const accords = Array.isArray(record.mainAccords) ? record.mainAccords.map((value) => String(value)) : [];
  const builderStatus = toBuilderStatus(record);
  const validationStatus = toSourceStatus(record);
  const reviewStatus: ReviewStatus = builderStatus === "complete" ? "approved" : "pending-review";
  const confidence = Number((Number(record.confidence ?? 0) || 0).toFixed(2));

  return {
    id: String(record.id ?? record.canonicalKey ?? `${brand}::${perfume}`),
    perfume,
    brand,
    launchYear: String(record.launchYear ?? ""),
    source,
    status,
    externalId,
    externalUrl,
    rating,
    voteCount,
    sourceFingerprint,
    perfumer,
    gender,
    description,
    imageUrl: String(record.imageUrl ?? "").trim() || null,
    blobImageUrl: String(record.blobImageUrl ?? "").trim() || undefined,
    localImagePath: String(record.localImagePath ?? "").trim() || null,
    notes,
    matchedNotes: notes,
    unresolvedNotes: [],
    mainAccords: accords,
    userDnaTestEnabled: record.userDnaTestEnabled === true,
    userDnaProfiles: Array.isArray(record.userDnaProfiles) ? record.userDnaProfiles : [],
    longevityVotes: {},
    sillageVotes: {},
    validation: {
      status: validationStatus,
      issues: validationStatus === "passed" ? [] : ["Derived from combined DB source record"],
    },
    review: {
      status: reviewStatus,
      reasons: reviewStatus === "approved" ? ["Record is sufficiently populated"] : ["Record needs review"],
    },
    builder: {
      status: builderStatus,
      coveragePercent: builderStatus === "complete" ? 100 : builderStatus === "partial" ? 66 : 25,
      confidence,
    },
    decision: {
      current: builderStatus === "complete" ? "UPDATE_EXISTING" : "REVIEW_REQUIRED",
      confidence,
      explanation: "Combined DB source record.",
      triggeredRules: [],
      sourceConnector: String(record.source ?? "combined-db"),
      timestamp: new Date().toISOString(),
      suggestedNextAction: builderStatus === "complete" ? "Update canonical entity" : "Send to Review",
      history: [],
      provenance: [],
      alternativeCandidates: [],
      mergeTrust: {
        automaticMergeCount: 0,
        manualMergeCount: 0,
        conflictCount: 0,
        averageDecisionConfidence: confidence,
        topConflictingFields: [],
        topConflictingSources: [],
        outcomes: [],
        unresolvedConflicts: [],
        provenance: [],
      },
    },
    knowledge: {
      status: notes.length > 0 ? "mapped" : "unmapped",
      mappedCount: notes.length,
      unresolvedCount: 0,
    },
    relationships: {
      sameBrandPerfumes: [],
      commonNotes: [],
    },
    translation: {
      status: notes.length > 0 ? "ready" : "needs-review",
      unresolvedTokens: [],
    },
    canonical: {
      brand,
      family: null,
      gender: String(record.gender ?? "").trim() || null,
      accords,
      recommendationTags: [],
      availabilityStatus: null,
      longevity: null,
      sillage: null,
    },
    intelligence: {
      completionPercentage: builderStatus === "complete" ? 100 : builderStatus === "partial" ? 66 : 25,
      missingFields: builderStatus === "complete" ? [] : ["derived-from-combined-db"],
      dataQualityScore: confidence * 100,
      builderConfidence: confidence,
      reviewRequired: reviewStatus === "pending-review",
      automaticResolutionPossible: builderStatus === "complete",
      suggestedConnector: builderStatus === "complete" ? "Review" : "Review",
      provenanceCompleteness: 0,
      validationCompleteness: validationStatus === "passed" ? 100 : validationStatus === "warning" ? 70 : 35,
      knowledgeCompleteness: notes.length > 0 ? 100 : 0,
      enrichmentTasks: [],
    },
    connectors: {
      discoverySource: String(record.source ?? "combined-db"),
      requiredConnectors: [],
      missingFields: [],
      pendingEnrichment: 0,
      pendingJobs: 0,
      completedJobs: 0,
      confidence,
      connectorStatus: [],
      connectorHistory: [],
      synchronizationHistory: [],
      importedSources: [String(record.source ?? "combined-db")],
      lastSynchronized: new Date().toISOString(),
      conflictStatus: "none",
      pendingSynchronizations: 0,
      completedSynchronizations: 0,
      enrichmentHistory: [],
    },
  };
};

export const updateCombinedDatabaseRecord = (
  recordId: string,
  patch: CombinedDatabaseRecordPatch,
): CombinedDatabaseRecord | null => {
  const trimmedId = recordId.trim();
  if (trimmedId.length === 0) {
    return null;
  }

  const raw = loadCombinedDatabaseRecords();
  const nextRecords: CombinedDatabaseRecord[] = [];
  const updatedRecords: CombinedDatabaseRecord[] = [];
  let updatedRecord: CombinedDatabaseRecord | null = null;

  for (const record of raw) {
    const currentId = String(record.id ?? record.canonicalKey ?? "").trim();
    const matches = currentId === trimmedId;
    if (!matches) {
      nextRecords.push(record);
      continue;
    }

    const perfume = patch.perfume.trim();
    const brand = patch.brand.trim();
    const canonicalKey = toCanonicalKey(brand, perfume);
    const userDnaProfiles = Array.isArray(record.userDnaProfiles) ? [...record.userDnaProfiles] : [];
    if (
      patch.userDnaProfile &&
      (patch.userDnaTestEnabled === true || String(patch.userDnaProfile.testProfileId ?? "").trim() !== "new")
    ) {
      const profileName = String(patch.userDnaProfile.name ?? "").trim() || perfume;
      const requestedProfileId = String(patch.userDnaProfile.testProfileId ?? "").trim();
      const baseProfileId = slugify(profileName) || "fragrance";
      let profileId = requestedProfileId && requestedProfileId !== "new" ? requestedProfileId : baseProfileId;
      let suffix = 2;
      while (
        profileId !== requestedProfileId &&
        userDnaProfiles.some((profile) => String(profile.testProfileId ?? "") === profileId)
      ) {
        profileId = `${baseProfileId}-${suffix}`;
        suffix += 1;
      }
      const nextProfile = { ...patch.userDnaProfile, name: profileName, testProfileId: profileId };
      const existingProfileIndex = userDnaProfiles.findIndex((profile) => profile.testProfileId === profileId);
      if (existingProfileIndex >= 0) userDnaProfiles[existingProfileIndex] = nextProfile;
      else userDnaProfiles.push(nextProfile);
    }
    updatedRecord = {
      ...record,
      id: String(record.id ?? trimmedId),
      canonicalKey,
      perfume,
      name: perfume,
      brand,
      launchYear: patch.launchYear.trim(),
      source: patch.source.trim() || String(record.source ?? "combined-db"),
      status: patch.status.trim() || String(record.status ?? patch.source ?? "combined-db"),
      externalId: patch.externalId.trim(),
      externalUrl: patch.externalUrl.trim(),
      rating: patch.rating.trim(),
      voteCount: patch.voteCount.trim(),
      sourceFingerprint: patch.sourceFingerprint.trim(),
      perfumer: patch.perfumer.trim(),
      gender: patch.gender.trim(),
      description: patch.description.trim(),
      imageUrl: patch.imageUrl.trim(),
      localImagePath: patch.localImagePath.trim(),
      notes: patch.notes,
      mainAccords: patch.mainAccords,
      userDnaTestEnabled: patch.userDnaTestEnabled ?? record.userDnaTestEnabled === true,
      userDnaProfiles,
    };

    nextRecords.push(updatedRecord);
    updatedRecords.push(updatedRecord);
  }

  if (!updatedRecord || !updateMasterFragrancesByRecordId(trimmedId, updatedRecords)) {
    return null;
  }
  combinedRecordsCache = nextRecords;
  masterWorkspaceCache = null;
  return updatedRecord;
};

export const createCombinedDatabaseRecord = (
  patch: CombinedDatabaseRecordPatch,
): CombinedDatabaseRecord | null => {
  const perfume = patch.perfume.trim();
  const brand = patch.brand.trim();
  if (perfume.length === 0 || brand.length === 0) {
    return null;
  }

  const raw = loadCombinedDatabaseRecords();
  const existingIds = new Set(raw.map((record) => String(record.id ?? record.canonicalKey ?? "").trim()));
  const id = buildUniqueCombinedRecordId(patch, existingIds);
  const canonicalKey = toCanonicalKey(brand, perfume);
  const source = patch.source.trim() || "studio-manual";

  const createdRecord: CombinedDatabaseRecord = {
    id,
    canonicalKey,
    perfume,
    name: perfume,
    brand,
    launchYear: patch.launchYear.trim(),
    source,
    status: patch.status.trim() || source,
    externalId: patch.externalId.trim(),
    externalUrl: patch.externalUrl.trim(),
    rating: patch.rating.trim(),
    voteCount: patch.voteCount.trim(),
    sourceFingerprint: patch.sourceFingerprint.trim(),
    perfumer: patch.perfumer.trim(),
    gender: patch.gender.trim(),
    description: patch.description.trim(),
    imageUrl: patch.imageUrl.trim(),
    localImagePath: patch.localImagePath.trim(),
    notes: patch.notes,
    mainAccords: patch.mainAccords,
    brandType: "N/A",
    confidence: patch.notes.length > 0 || patch.mainAccords.length > 0 ? 0.9 : 0.6,
  };

  insertMasterFragrance(createdRecord);
  masterWorkspaceCache = null;
  combinedRecordsCache = [createdRecord, ...raw];

  return createdRecord;
};

export const deleteCombinedDatabaseRecord = (recordId: string): boolean => {
  const trimmedId = recordId.trim();
  if (trimmedId.length === 0) {
    return false;
  }

  const raw = loadCombinedDatabaseRecords();
  const nextRecords = raw.filter((record) => {
    const currentId = String(record.id ?? record.canonicalKey ?? "").trim();
    return currentId !== trimmedId;
  });

  if (nextRecords.length === raw.length) {
    return false;
  }
  const deletedCount = deleteMasterFragrancesByRecordId(trimmedId);
  if (deletedCount === 0) return false;
  masterWorkspaceCache = null;
  combinedRecordsCache = nextRecords;
  return true;
};

export const downloadCombinedDatabaseRecordImage = async (
  recordId: string,
): Promise<MasterDatabaseDetailPanel | null> => {
  const trimmedId = recordId.trim();
  if (trimmedId.length === 0) {
    return null;
  }

  const records = loadCombinedDatabaseRecords();
  const record = records.find((entry) => String(entry.id ?? entry.canonicalKey ?? "").trim() === trimmedId);
  if (!record) {
    return null;
  }

  const imageUrl = String(record.imageUrl ?? "").trim();
  if (!imageUrl) {
    throw new Error("Selected record does not have an Image URL.");
  }

  const perfume = String(record.perfume ?? record.name ?? "").trim();
  const brand = String(record.brand ?? "").trim();
  const saved = await saveRemoteImageLocally({
    recordId: trimmedId,
    brand,
    perfume,
    imageUrl,
  });

  const updatedRecord = updateCombinedDatabaseRecord(trimmedId, {
    perfume,
    brand,
    launchYear: String(record.launchYear ?? "").trim(),
    source: String(record.source ?? "combined-db").trim(),
    status: String(record.status ?? record.source ?? "combined-db").trim(),
    externalId: String(record.externalId ?? "").trim(),
    externalUrl: String(record.externalUrl ?? "").trim(),
    rating: String(record.rating ?? "").trim(),
    voteCount: String(record.voteCount ?? "").trim(),
    sourceFingerprint: String(record.sourceFingerprint ?? "").trim(),
    perfumer: String(record.perfumer ?? "").trim(),
    gender: String(record.gender ?? "").trim(),
    description: String(record.description ?? "").trim(),
    imageUrl: saved.imageUrl,
    localImagePath: saved.localImagePath,
    notes: Array.isArray(record.notes) ? record.notes.map((value) => String(value)) : [],
    mainAccords: Array.isArray(record.mainAccords) ? record.mainAccords.map((value) => String(value)) : [],
  });

  if (!updatedRecord) {
    return null;
  }

  return loadMasterDatabaseDetailById(trimmedId);
};

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

/*
const buildMasterDatabaseWorkspaceData = async (): Promise<MasterDatabaseWorkspaceResult> => {
  const config = createBuilderConfig();
  const intelligence = await runCanonicalBuilderIntelligence();
  const decisionWorkspace = await loadBuilderDecisionWorkspaceData();
  const mergedImageMap = loadMergedImageMap();
  const combinedPerfumes = loadCombinedDatabaseTotal();
  const detailCap = Math.max(
    200,
    Number.parseInt(process.env.BUILDER_MASTER_DETAIL_CAP ?? "1200", 10) || 1200,
  );

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

    const shouldMaterializeDetail = Object.keys(detailsById).length < detailCap;
    const resolvedBrand = object.canonicalBrand.value ?? object.rawBrand;
    const imageMapEntry = mergedImageMap.get(toCanonicalKey(resolvedBrand, object.perfume));
    const resolvedImageUrl = object.imageUrl ?? imageMapEntry?.imageUrl ?? null;
    const resolvedLocalImagePath = imageMapEntry?.localImagePath ?? null;

    if (shouldMaterializeDetail) {
      detailsById[object.id] = {
      id: object.id,
      perfume: object.perfume,
      brand: resolvedBrand,
      launchYear: object.launchYear,
      imageUrl: resolvedImageUrl,
      localImagePath: resolvedLocalImagePath,
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
        mergeTrust: {
          // Keep per-row payload compact in serverless runtime; detailed trust provenance is materialized for unresolved conflicts.

          automaticMergeCount: decisionReport?.mergeTrust.automaticMergeCount ?? 0,
          manualMergeCount: decisionReport?.mergeTrust.manualMergeCount ?? 0,
          conflictCount: decisionReport?.mergeTrust.conflictCount ?? 0,
          averageDecisionConfidence: decisionReport?.mergeTrust.averageDecisionConfidence ?? 0,
          topConflictingFields: decisionReport?.mergeTrust.topConflictingFields ?? [],
          topConflictingSources: decisionReport?.mergeTrust.topConflictingSources ?? [],
          outcomes: decisionReport?.mergeTrust.outcomes ?? [],
          unresolvedConflicts: decisionReport?.mergeTrust.unresolvedConflicts ?? [],
          provenance: (
            decisionReport?.mergeTrust.provenance
              .slice(0, (decisionReport?.mergeTrust.unresolvedConflicts.length ?? 0) > 0 ? 6 : 3)
              .map((entry) => ({
                field: entry.field,
                canonicalValue: entry.canonicalValue,
                rawValue: entry.rawValue,
                source: entry.source,
                connector: entry.connector,
                trustScore: entry.trustScore,
                decisionConfidence: entry.decisionConfidence,
                synchronizationTimestamp: entry.synchronizationTimestamp,
                decisionTimestamp: entry.decisionTimestamp,
                decisionRule: entry.decisionRule,
                decisionExplanation: entry.decisionExplanation,
                conflictStatus: entry.conflictStatus,
              }))
          ) ?? [],
        },
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
        brand: object.canonicalBrand.value,
      */

const buildCombinedDatabaseWorkspaceData = async (
  prioritizedRecordId?: string,
): Promise<MasterDatabaseWorkspaceResult> => {
  const detailCap = Math.max(200, Number.parseInt(process.env.BUILDER_MASTER_DETAIL_CAP ?? "1200", 10) || 1200);
  const combinedRecords = loadCombinedDatabaseRecords();
  const normalizedPrioritizedRecordId = String(prioritizedRecordId ?? "").trim().toLowerCase();

  const rows: MasterDatabaseListRow[] = [];
  const detailsById: Record<string, MasterDatabaseDetailPanel> = {};
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

        combinedRecords.forEach((record, index) => {
          const perfume = String(record.perfume ?? record.name ?? "").trim();
          const brand = String(record.brand ?? "").trim();
          const launchYear = String(record.launchYear ?? "").trim();
          const notes = Array.isArray(record.notes) ? record.notes.map((value) => String(value)) : [];
          const accords = Array.isArray(record.mainAccords) ? record.mainAccords.map((value) => String(value)) : [];
          const source = String(record.source ?? "combined-db");
          const canonicalKey = String(record.canonicalKey ?? toCanonicalKey(brand, perfume) ?? `combined-${index}`);
          const id = String(record.id ?? canonicalKey);
          const imageUrl = String(record.imageUrl ?? "").trim();
          const localImagePath = String(record.localImagePath ?? "").trim();
          const userDnaProfiles = Array.isArray(record.userDnaProfiles) ? record.userDnaProfiles : [];
          const userDnaTestEnabled = record.userDnaTestEnabled === true;
          const userDnaSearchText = userDnaProfiles.flatMap((profile) => [
            profile.name ?? "",
            profile.type ?? "",
            ...Object.keys(profile.dna_axes ?? {}),
            ...Object.keys(profile.semantic_v1 ?? {}),
            ...(profile.user_attributes_v3?.abstract ?? []),
            ...(profile.user_attributes_v3?.concrete ?? []),
          ]).join(" ");
          const notesCount = notes.length;
          const accordsCount = accords.length;
          const imageMissing = imageUrl.length === 0 && localImagePath.length === 0;
          const perfumerMissing = String(record.perfumer ?? "").trim().length === 0;
          const launchYearMissing = launchYear.length === 0;
          const builderStatus = toBuilderStatus(record);
          const usableStatus = toUsabilityStatus(record);
          const validationStatus = toSourceStatus(record);
          const reviewRequired = builderStatus !== "complete";
          const completionPercentage = builderStatus === "complete" ? 100 : builderStatus === "partial" ? 66 : 25;
          const coveragePercent = completionPercentage;
          const confidence = Number((Number(record.confidence ?? 0) || 0).toFixed(2));
          const missingFields = getMissingFields({
            imageMissing,
            perfumerMissing,
            launchYearMissing,
            brandMissing: brand.length === 0,
            familyMissing: false,
            genderMissing: String(record.gender ?? "").trim().length === 0,
            notesMissing: notesCount === 0,
            accordsMissing: accordsCount === 0,
            performanceMissing: false,
            availabilityMissing: false,
          });
          const validationCompleteness = toValidationCompleteness(validationStatus);

          rows.push({
            id,
            worksheet: source,
            rowIndex: index,
            perfume,
            brand,
            brandType: normalizeBrandType(record.brandType),
            launchYear,
            imageUrl,
            localImagePath,
            usableStatus,
            notesCount,
            accordsCount,
            coveragePercent,
            completionPercent: completionPercentage,
            confidence,
            missingFieldsCount: missingFields.length,
            reviewRequired,
            builderStatus,
            validationStatus,
            reviewStatus: reviewRequired ? "pending-review" : "approved",
            knowledgeStatus: notesCount > 0 ? "mapped" : "unmapped",
            performanceStatus: imageMissing ? "missing" : "available",
            userDnaTestEnabled,
            userDnaProfileCount: userDnaProfiles.length,
            published: !reviewRequired,
            searchText: normalizeText(`${perfume} ${brand} ${launchYear} ${notes.join(" ")} ${accords.join(" ")} ${source} ${userDnaSearchText}`),
          });

          uniqueBrands.add(brand);
          notes.forEach((note) => uniqueNotes.add(note));
          accords.forEach((accord) => uniqueAccords.add(accord));
          builderCompleteCount += builderStatus === "complete" ? 1 : 0;
          validationPassedCount += validationStatus === "passed" ? 1 : 0;
          pendingReviewCount += reviewRequired ? 1 : 0;
          publishedCount += !reviewRequired ? 1 : 0;
          validationIssueCount += missingFields.length;
          coverageAccumulator += coveragePercent;
          completionAccumulator += completionPercentage;
          missingImages += imageMissing ? 1 : 0;
          missingPerfumers += perfumerMissing ? 1 : 0;
          missingLaunchYears += launchYearMissing ? 1 : 0;
          pendingEnrichmentJobs += missingFields.length;

          if (Object.keys(detailsById).length < detailCap || userDnaTestEnabled) {
            detailsById[id] = {
              ...buildDetailFallback({
                ...record,
                canonicalKey,
                id,
                perfume,
                brand,
                launchYear,
                confidence,
                source,
                externalId: String(record.externalId ?? "").trim() || undefined,
                imageUrl: imageUrl || undefined,
                localImagePath: localImagePath || undefined,
                externalUrl: String(record.externalUrl ?? "").trim() || undefined,
                rating: String(record.rating ?? "").trim() || undefined,
                voteCount: String(record.voteCount ?? "").trim() || undefined,
                sourceFingerprint: String(record.sourceFingerprint ?? "").trim() || undefined,
                gender: String(record.gender ?? "").trim() || undefined,
                perfumer: String(record.perfumer ?? "").trim() || undefined,
                notes,
                mainAccords: accords,
                description: String(record.description ?? "").trim() || undefined,
                status: String(record.status ?? source).trim() || source,
              }),
              id,
            };
          }
        });

        rows.sort((left, right) => left.perfume.localeCompare(right.perfume));

        if (normalizedPrioritizedRecordId.length > 0 && !detailsById[normalizedPrioritizedRecordId]) {
          const selectedRecord = combinedRecords.find((record) => {
            const recordId = String(record.id ?? record.canonicalKey ?? "").trim().toLowerCase();
            return recordId === normalizedPrioritizedRecordId;
          });

          if (selectedRecord) {
            const perfume = String(selectedRecord.perfume ?? selectedRecord.name ?? "").trim();
            const brand = String(selectedRecord.brand ?? "").trim();
            const source = String(selectedRecord.source ?? "combined-db");
            const canonicalKey = String(
              selectedRecord.canonicalKey ?? toCanonicalKey(brand, perfume) ?? normalizedPrioritizedRecordId,
            );
            const id = String(selectedRecord.id ?? canonicalKey);
            const notes = Array.isArray(selectedRecord.notes)
              ? selectedRecord.notes.map((value) => String(value))
              : [];
            const accords = Array.isArray(selectedRecord.mainAccords)
              ? selectedRecord.mainAccords.map((value) => String(value))
              : [];

            detailsById[id] = {
              ...buildDetailFallback({
                ...selectedRecord,
                canonicalKey,
                id,
                perfume,
                brand,
                source,
                notes,
                mainAccords: accords,
                imageUrl: String(selectedRecord.imageUrl ?? "").trim() || undefined,
                localImagePath: String(selectedRecord.localImagePath ?? "").trim() || undefined,
              }),
              id,
            };
          }
        }

        const totalPerfumes = rows.length;
        const safeTotal = totalPerfumes > 0 ? totalPerfumes : 1;
        const totalCombinedPerfumes = combinedRecords.length;

        return {
          generatedAt: new Date().toISOString(),
          totalPerfumes,
          userDnaProfileCount: combinedRecords
            .filter((record) => record.userDnaTestEnabled === true)
            .reduce((count, record) => count + (record.userDnaProfiles?.length ?? 0), 0),
          workspacePerfumes: totalPerfumes,
          combinedPerfumes: totalCombinedPerfumes,
          totalBrands: uniqueBrands.size,
          totalNotes: uniqueNotes.size,
          totalAccords: uniqueAccords.size,
          coveragePercent: Number((coverageAccumulator / safeTotal).toFixed(2)),
          overallCompletionPercent: Number((completionAccumulator / safeTotal).toFixed(2)),
          builderCompletionPercent: Number(((builderCompleteCount / safeTotal) * 100).toFixed(2)),
          validationCompletionPercent: Number(((validationPassedCount / safeTotal) * 100).toFixed(2)),
          pendingReview: pendingReviewCount,
          validationIssueCount,
          decisionMetrics: {
            totalDecisions: totalPerfumes,
            automaticDecisions: builderCompleteCount,
            manualDecisions: pendingReviewCount,
            reviewRequired: pendingReviewCount,
            decisionAccuracy: Number(((builderCompleteCount / safeTotal) * 100).toFixed(2)),
            reviewReduction: Number(((builderCompleteCount / safeTotal) * 100).toFixed(2)),
            automationPercent: Number(((builderCompleteCount / safeTotal) * 100).toFixed(2)),
            decisionDistribution: [
              { decision: "NEW_OBJECT", count: totalPerfumes - builderCompleteCount },
              { decision: "UPDATE_EXISTING", count: builderCompleteCount },
              { decision: "REVIEW_REQUIRED", count: pendingReviewCount },
            ],
          },
          published: publishedCount,
          automationPercentage: Number(((builderCompleteCount / safeTotal) * 100).toFixed(2)),
          automaticResolutions: builderCompleteCount,
          canonicalObjectsGenerated: totalPerfumes,
          averageBuilderConfidence: Number(
            (
              combinedRecords.reduce((sum, record) => sum + (Number(record.confidence ?? 0) || 0), 0) /
              Math.max(1, combinedRecords.length)
            ).toFixed(2),
          ),
          missingImages,
          missingPerfumers,
          missingLaunchYears,
          pendingEnrichmentJobs,
          rows,
          detailsById,
          builderMetadata: {
            workbookPath: MASTER_FRAGRANCE_DATABASE_PATH,
            importVersion: "combined-db-v1",
            builderVersion: "combined-db-v1",
          },
        };
};

const buildMasterDatabaseWorkspaceData = async (): Promise<MasterDatabaseWorkspaceResult> =>
  buildCombinedDatabaseWorkspaceData();

const withSelectedRecordDetail = (
  workspace: MasterDatabaseWorkspaceResult,
  selectedRecordId?: string,
): MasterDatabaseWorkspaceResult => {
  const normalizedSelectedId = String(selectedRecordId ?? "").trim().toLowerCase();
  if (!normalizedSelectedId) {
    return workspace;
  }

  const hasSelected = Object.keys(workspace.detailsById).some(
    (id) => id.trim().toLowerCase() === normalizedSelectedId,
  );

  if (hasSelected) {
    return workspace;
  }

  const combinedRecords = loadCombinedDatabaseRecords();
  const selectedRecord = combinedRecords.find((record) => {
    const recordId = String(record.id ?? record.canonicalKey ?? "").trim().toLowerCase();
    return recordId === normalizedSelectedId;
  });

  if (!selectedRecord) {
    return workspace;
  }

  const perfume = String(selectedRecord.perfume ?? selectedRecord.name ?? "").trim();
  const brand = String(selectedRecord.brand ?? "").trim();
  const source = String(selectedRecord.source ?? "combined-db");
  const canonicalKey = String(selectedRecord.canonicalKey ?? toCanonicalKey(brand, perfume) ?? normalizedSelectedId);
  const id = String(selectedRecord.id ?? canonicalKey);
  const notes = Array.isArray(selectedRecord.notes)
    ? selectedRecord.notes.map((value) => String(value))
    : [];
  const accords = Array.isArray(selectedRecord.mainAccords)
    ? selectedRecord.mainAccords.map((value) => String(value))
    : [];

  return {
    ...workspace,
    detailsById: {
      ...workspace.detailsById,
      [id]: {
        ...buildDetailFallback({
          ...selectedRecord,
          canonicalKey,
          id,
          perfume,
          brand,
          source,
          notes,
          mainAccords: accords,
          imageUrl: String(selectedRecord.imageUrl ?? "").trim() || undefined,
          localImagePath: String(selectedRecord.localImagePath ?? "").trim() || undefined,
        }),
        id,
      },
    },
  };
};

export const loadMasterDatabaseWorkspaceData = async (
  selectedRecordId?: string,
): Promise<MasterDatabaseWorkspaceResult> => {
  const now = Date.now();

  if (masterWorkspaceCache && masterWorkspaceCache.expiresAt > now) {
    return withSelectedRecordDetail(masterWorkspaceCache.value, selectedRecordId);
  }

  if (masterWorkspaceInFlight) {
    const inFlightResult = await masterWorkspaceInFlight;
    return withSelectedRecordDetail(inFlightResult, selectedRecordId);
  }

  masterWorkspaceInFlight = buildMasterDatabaseWorkspaceData();

  try {
    const result = await masterWorkspaceInFlight;
    masterWorkspaceCache = {
      value: result,
      expiresAt: Date.now() + MASTER_CACHE_TTL_MS,
    };
    return withSelectedRecordDetail(result, selectedRecordId);
  } finally {
    masterWorkspaceInFlight = null;
  }
};
