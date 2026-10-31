import "server-only";
import type { CanonicalMasterPerfumeObject } from "@/lib/builder/intelligence/canonicalBuilderIntelligence";
import type {
  ConnectorConflictRecord,
  ConnectorSynchronizedField,
  ConnectorType,
} from "@/lib/builder/connectors/connectorState";

export type MergeOutcome =
  | "KEEP_EXISTING"
  | "REPLACE_EXISTING"
  | "MERGE_VALUES"
  | "CREATE_ALIAS"
  | "IGNORE"
  | "CONFLICT"
  | "REVIEW_REQUIRED";

export type CanonicalField =
  | "brand"
  | "perfumeName"
  | "launchYear"
  | "perfumer"
  | "gender"
  | "mainAccords"
  | "notes"
  | "imageUrl"
  | "fragranticaUrl"
  | "rating"
  | "releaseStatus"
  | "availability";

export interface FieldTrustConfig {
  source: string;
  connector: ConnectorType | "builder-core";
  sourceTrust: number;
  fieldTrust: number;
}

export interface MergeFieldProvenanceEntry {
  field: CanonicalField;
  canonicalValue: string;
  rawValue: string;
  source: string;
  connector: ConnectorType | "builder-core";
  trustScore: number;
  decisionConfidence: number;
  synchronizationTimestamp: string;
  decisionTimestamp: string;
  decisionRule: string;
  decisionExplanation: string;
  conflictStatus: "none" | "open" | "resolved";
}

export interface MergeConflictCandidate {
  field: CanonicalField;
  competingValues: string[];
  sources: string[];
  sourceTrust: Array<{ source: string; trust: number }>;
  confidence: number;
  status: "open" | "resolved";
  recommendedResolution: string;
  decisionExplanation: string;
}

export interface MergeFieldDecision {
  field: CanonicalField;
  outcome: MergeOutcome;
  canonicalValue: string;
  decisionConfidence: number;
  decisionExplanation: string;
  decisionRule: string;
  trustScore: number;
  conflictStatus: "none" | "open" | "resolved";
  competingValues: string[];
  competingSources: string[];
  recommendedResolution: string;
}

export interface MergeTrustEvaluationResult {
  fieldDecisions: MergeFieldDecision[];
  provenance: MergeFieldProvenanceEntry[];
  conflicts: MergeConflictCandidate[];
  automaticMergeCount: number;
  manualMergeCount: number;
  conflictCount: number;
  averageDecisionConfidence: number;
}

interface CandidateValue {
  field: CanonicalField;
  canonicalValue: string;
  rawValue: string;
  source: string;
  connector: ConnectorType | "builder-core";
  confidence: number;
  synchronizedAt: string;
}

interface MergeTrustModel {
  sourceTrust: Record<string, number>;
  fieldTrust: Partial<Record<CanonicalField, Record<string, number>>>;
  conflictGapThreshold: number;
  replacementGapThreshold: number;
  minimumDecisionConfidence: number;
}

const canonicalFields: CanonicalField[] = [
  "brand",
  "perfumeName",
  "launchYear",
  "perfumer",
  "gender",
  "mainAccords",
  "notes",
  "imageUrl",
  "fragranticaUrl",
  "rating",
  "releaseStatus",
  "availability",
];

const listFields = new Set<CanonicalField>(["notes", "mainAccords"]);

const defaultModel: MergeTrustModel = {
  sourceTrust: {
    "official brand": 100,
    "manual review": 98,
    parfumo: 92,
    fragrantica: 90,
    notino: 84,
    parfimo: 80,
    miraj: 78,
    images: 72,
    "local excel": 68,
    "builder core": 75,
    unknown: 60,
  },
  fieldTrust: {
    launchYear: {
      "official brand": 100,
      parfumo: 95,
      fragrantica: 88,
      "local excel": 70,
    },
    notes: {
      fragrantica: 92,
      parfumo: 90,
      "official brand": 75,
      "local excel": 65,
    },
    perfumer: {
      parfumo: 95,
      fragrantica: 86,
      "official brand": 82,
      "local excel": 64,
    },
    mainAccords: {
      fragrantica: 90,
      parfumo: 87,
      "local excel": 62,
    },
    availability: {
      notino: 91,
      parfimo: 88,
      fragrantica: 82,
      "local excel": 66,
    },
    brand: {
      "official brand": 100,
      manual: 98,
      fragrantica: 86,
      parfumo: 84,
      "local excel": 70,
    },
  },
  conflictGapThreshold: 3,
  replacementGapThreshold: 7,
  minimumDecisionConfidence: 45,
};

const normalize = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, " ");

const normalizeIdentity = (value: string): string => normalize(value).replace(/[^a-z0-9]+/g, "");

const clamp = (value: number, min: number = 0, max: number = 100): number =>
  Math.max(min, Math.min(max, value));

const safeAverage = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
};

const parseList = (value: string): string[] =>
  value
    .split(",")
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

const listToCanonical = (values: string[]): string => {
  const unique = Array.from(new Set(values.map((value) => normalize(value))));
  return unique.sort((left, right) => left.localeCompare(right)).join(", ");
};

const resolveTrustModel = (): MergeTrustModel => {
  const raw = process.env.BUILDER_MERGE_TRUST_MODEL_JSON;
  if (!raw) {
    return defaultModel;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MergeTrustModel>;
    return {
      sourceTrust: {
        ...defaultModel.sourceTrust,
        ...(parsed.sourceTrust ?? {}),
      },
      fieldTrust: {
        ...defaultModel.fieldTrust,
        ...(parsed.fieldTrust ?? {}),
      },
      conflictGapThreshold: parsed.conflictGapThreshold ?? defaultModel.conflictGapThreshold,
      replacementGapThreshold: parsed.replacementGapThreshold ?? defaultModel.replacementGapThreshold,
      minimumDecisionConfidence: parsed.minimumDecisionConfidence ?? defaultModel.minimumDecisionConfidence,
    };
  } catch {
    return defaultModel;
  }
};

const sourceKey = (source: string, connector: ConnectorType | "builder-core"): string => {
  const normalizedSource = normalize(source);
  if (normalizedSource.length > 0) {
    return normalizedSource;
  }
  if (connector === "builder-core") {
    return "builder core";
  }
  return normalize(connector);
};

const resolveFieldTrust = (
  model: MergeTrustModel,
  field: CanonicalField,
  source: string,
  connector: ConnectorType | "builder-core",
): FieldTrustConfig => {
  const key = sourceKey(source, connector);
  const sourceTrust = model.sourceTrust[key] ?? model.sourceTrust.unknown;
  const fieldTrustBySource = model.fieldTrust[field] ?? {};
  const fieldTrust = fieldTrustBySource[key] ?? sourceTrust;

  return {
    source,
    connector,
    sourceTrust,
    fieldTrust,
  };
};

const scoreCandidate = (
  model: MergeTrustModel,
  field: CanonicalField,
  candidate: CandidateValue,
): { score: number; trust: number } => {
  const trust = resolveFieldTrust(model, field, candidate.source, candidate.connector);
  const score = clamp(trust.sourceTrust * 0.45 + trust.fieldTrust * 0.35 + candidate.confidence * 0.2);
  return { score: Number(score.toFixed(2)), trust: trust.fieldTrust };
};

const extractCanonicalValue = (object: CanonicalMasterPerfumeObject, field: CanonicalField): string => {
  if (field === "brand") return object.canonicalBrand.value ?? object.rawBrand;
  if (field === "perfumeName") return object.perfume;
  if (field === "launchYear") return object.launchYear;
  if (field === "perfumer") return object.rawPerfumers.join(", ");
  if (field === "gender") return object.canonicalGender.value ?? "";
  if (field === "mainAccords") return (object.canonicalMainAccords.value ?? []).join(", ");
  if (field === "notes") return (object.canonicalNotes.value ?? []).join(", ");
  if (field === "imageUrl") return object.imageUrl ?? "";
  if (field === "availability") return object.availability.value?.status ?? "";
  return "";
};

const toExistingCandidate = (
  object: CanonicalMasterPerfumeObject,
  field: CanonicalField,
): CandidateValue => ({
  field,
  canonicalValue: extractCanonicalValue(object, field),
  rawValue: extractCanonicalValue(object, field),
  source: "Master Database",
  connector: "builder-core",
  confidence: clamp(object.builderConfidence * 100),
  synchronizedAt: new Date().toISOString(),
});

const toIncomingCandidates = (
  field: CanonicalField,
  synchronizedFields: ConnectorSynchronizedField[],
): CandidateValue[] =>
  synchronizedFields
    .filter((entry) => entry.field === field)
    .map((entry) => ({
      field,
      canonicalValue: entry.canonicalValue,
      rawValue: entry.rawValue,
      source: entry.source,
      connector: entry.connector,
      confidence: clamp(entry.confidence * 100),
      synchronizedAt: entry.synchronizedAt,
    }));

const selectBestCandidate = (
  model: MergeTrustModel,
  field: CanonicalField,
  candidates: CandidateValue[],
): Array<CandidateValue & { score: number; trust: number }> =>
  candidates
    .map((candidate) => {
      const evaluation = scoreCandidate(model, field, candidate);
      return {
        ...candidate,
        score: evaluation.score,
        trust: evaluation.trust,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return new Date(right.synchronizedAt).getTime() - new Date(left.synchronizedAt).getTime();
    });

const evaluateFieldDecision = (input: {
  model: MergeTrustModel;
  field: CanonicalField;
  existing: CandidateValue;
  incoming: CandidateValue[];
  conflictRecords: ConnectorConflictRecord[];
}): {
  decision: MergeFieldDecision;
  provenance: MergeFieldProvenanceEntry;
  conflict: MergeConflictCandidate | null;
  automatic: boolean;
} => {
  const { model, field, existing, incoming, conflictRecords } = input;
  const now = new Date().toISOString();
  const allCandidates = [existing, ...incoming];
  const scored = selectBestCandidate(model, field, allCandidates);
  const best = scored[0];
  const second = scored[1] ?? null;

  const existingValueNormalized = normalize(existing.canonicalValue);
  const bestValueNormalized = normalize(best.canonicalValue);
  const scoreGap = second ? Number((best.score - second.score).toFixed(2)) : best.score;
  const hasOpenConflict = conflictRecords.some((record) => record.status === "open");

  let outcome: MergeOutcome = "KEEP_EXISTING";
  let decisionRule = "historical-provenance";
  let decisionExplanation = "Canonical value remains unchanged because existing evidence is strongest.";
  let canonicalValue = existing.canonicalValue;
  let conflictStatus: "none" | "open" | "resolved" = "none";
  let recommendedResolution = "Keep existing canonical value.";

  if (listFields.has(field)) {
    const existingList = parseList(existing.canonicalValue);
    const incomingList = incoming.flatMap((candidate) => parseList(candidate.canonicalValue));
    const merged = listToCanonical([...existingList, ...incomingList]);
    const existingCanonical = listToCanonical(existingList);

    if (merged.length > 0 && merged !== existingCanonical) {
      outcome = "MERGE_VALUES";
      canonicalValue = merged;
      decisionRule = "normalized-match + field-trust";
      decisionExplanation = "List field contains complementary evidence from trusted sources and was merged deterministically.";
      recommendedResolution = "Merged canonical list from existing and incoming values.";
    }
  } else if (hasOpenConflict || scoreGap < model.conflictGapThreshold) {
    outcome = "CONFLICT";
    canonicalValue = existing.canonicalValue;
    conflictStatus = hasOpenConflict ? "open" : "resolved";
    decisionRule = "source-trust + field-trust + confidence-gap";
    decisionExplanation = "Competing values are too close in trust/confidence; deterministic winner cannot be proven.";
    recommendedResolution = `Review required: competing values for ${field}.`;
  } else if (bestValueNormalized.length === 0 && existingValueNormalized.length > 0) {
    outcome = "IGNORE";
    canonicalValue = existing.canonicalValue;
    decisionRule = "existing-canonical-guard";
    decisionExplanation = "Incoming value is empty while canonical value exists; incoming value ignored.";
    recommendedResolution = "Ignore empty incoming value.";
  } else if (existingValueNormalized.length === 0 && bestValueNormalized.length > 0) {
    outcome = "REPLACE_EXISTING";
    canonicalValue = best.canonicalValue;
    decisionRule = "missing-canonical + trust-priority";
    decisionExplanation = "Canonical field was empty and replaced with highest-trust incoming value.";
    recommendedResolution = "Accept incoming value as canonical.";
  } else if (existingValueNormalized === bestValueNormalized) {
    outcome = "KEEP_EXISTING";
    canonicalValue = existing.canonicalValue;
    decisionRule = "exact-match";
    decisionExplanation = "Incoming value matches canonical value exactly after normalization.";
    recommendedResolution = "Keep canonical value and append provenance.";
  } else if (
    (field === "brand" || field === "perfumeName") &&
    normalizeIdentity(existing.canonicalValue) === normalizeIdentity(best.canonicalValue)
  ) {
    outcome = "CREATE_ALIAS";
    canonicalValue = existing.canonicalValue;
    decisionRule = "alias-resolution";
    decisionExplanation = "Identity-normalized values match, so incoming value was treated as canonical alias.";
    recommendedResolution = "Create alias and keep canonical identity.";
  } else if (best.score >= model.minimumDecisionConfidence && scoreGap >= model.replacementGapThreshold) {
    outcome = "REPLACE_EXISTING";
    canonicalValue = best.canonicalValue;
    decisionRule = "source-trust + field-trust + historical-provenance";
    decisionExplanation = "Incoming value has significantly higher trust-adjusted score than existing canonical value.";
    recommendedResolution = "Replace canonical value with trusted incoming value.";
  } else {
    outcome = "REVIEW_REQUIRED";
    canonicalValue = existing.canonicalValue;
    decisionRule = "confidence-threshold";
    decisionExplanation = "Trust-adjusted evidence is insufficient for automatic replacement.";
    recommendedResolution = `Review required for ${field}.`;
  }

  if (outcome === "CONFLICT" || outcome === "REVIEW_REQUIRED") {
    conflictStatus = "open";
  }

  const competingValues = Array.from(
    new Set(scored.map((candidate) => candidate.canonicalValue).filter((value) => value.trim().length > 0)),
  );
  const competingSources = Array.from(new Set(scored.map((candidate) => `${candidate.source}:${candidate.connector}`)));

  const conflict: MergeConflictCandidate | null =
    outcome === "CONFLICT" || outcome === "REVIEW_REQUIRED"
      ? {
          field,
          competingValues,
          sources: competingSources,
          sourceTrust: scored.map((candidate) => ({
            source: `${candidate.source}:${candidate.connector}`,
            trust: candidate.trust,
          })),
          confidence: best.score,
          status: "open",
          recommendedResolution,
          decisionExplanation,
        }
      : null;

  const decisionConfidence = Number(best.score.toFixed(2));
  const decision: MergeFieldDecision = {
    field,
    outcome,
    canonicalValue,
    decisionConfidence,
    decisionExplanation,
    decisionRule,
    trustScore: best.trust,
    conflictStatus,
    competingValues,
    competingSources,
    recommendedResolution,
  };

  const provenance: MergeFieldProvenanceEntry = {
    field,
    canonicalValue,
    rawValue: best.rawValue,
    source: best.source,
    connector: best.connector,
    trustScore: best.trust,
    decisionConfidence,
    synchronizationTimestamp: best.synchronizedAt,
    decisionTimestamp: now,
    decisionRule,
    decisionExplanation,
    conflictStatus,
  };

  const automatic = outcome !== "CONFLICT" && outcome !== "REVIEW_REQUIRED";

  return {
    decision,
    provenance,
    conflict,
    automatic,
  };
};

export const evaluateMergeTrustForPerfume = (input: {
  object: CanonicalMasterPerfumeObject;
  synchronizedFields: ConnectorSynchronizedField[];
  conflicts: ConnectorConflictRecord[];
}): MergeTrustEvaluationResult => {
  const model = resolveTrustModel();

  const fieldDecisions: MergeFieldDecision[] = [];
  const provenance: MergeFieldProvenanceEntry[] = [];
  const conflicts: MergeConflictCandidate[] = [];

  let automaticMergeCount = 0;
  let manualMergeCount = 0;

  for (const field of canonicalFields) {
    const existing = toExistingCandidate(input.object, field);
    const incoming = toIncomingCandidates(field, input.synchronizedFields);
    const conflictRecords = input.conflicts.filter(
      (record) => normalize(record.conflictingField) === normalize(field),
    );

    const evaluated = evaluateFieldDecision({
      model,
      field,
      existing,
      incoming,
      conflictRecords,
    });

    fieldDecisions.push(evaluated.decision);
    provenance.push(evaluated.provenance);

    if (evaluated.conflict) {
      conflicts.push(evaluated.conflict);
    }

    if (evaluated.automatic) {
      automaticMergeCount += 1;
    } else {
      manualMergeCount += 1;
    }
  }

  const averageDecisionConfidence = safeAverage(fieldDecisions.map((entry) => entry.decisionConfidence));

  return {
    fieldDecisions,
    provenance,
    conflicts,
    automaticMergeCount,
    manualMergeCount,
    conflictCount: conflicts.length,
    averageDecisionConfidence,
  };
};
