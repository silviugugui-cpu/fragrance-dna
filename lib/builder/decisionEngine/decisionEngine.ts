import "server-only";
import { runCanonicalBuilderIntelligence, type CanonicalMasterPerfumeObject } from "@/lib/builder/intelligence/canonicalBuilderIntelligence";

export type BuilderDecisionType =
  | "NEW_OBJECT"
  | "UPDATE_EXISTING"
  | "DUPLICATE"
  | "ALIAS"
  | "MERGE"
  | "IGNORE"
  | "REVIEW_REQUIRED"
  | "INVALID";

export interface BuilderDecisionHistoryEntry {
  at: string;
  ruleId: string;
  decision: BuilderDecisionType;
  reason: string;
}

export interface BuilderDecisionProvenanceEntry {
  key: string;
  source: string;
  method: string;
  confidence: number;
}

export interface BuilderDecisionAlternativeCandidate {
  id: string;
  perfume: string;
  brand: string;
  launchYear: string;
  decision: BuilderDecisionType;
  confidence: number;
  reason: string;
}

export interface BuilderDecisionReport {
  id: string;
  perfume: string;
  brand: string;
  launchYear: string;
  currentDecision: BuilderDecisionType;
  confidence: number;
  triggeredRules: string[];
  affectedObject: string;
  suggestedNextAction: string;
  sourceConnector: string;
  timestamp: string;
  explanation: string;
  decisionHistory: BuilderDecisionHistoryEntry[];
  provenance: BuilderDecisionProvenanceEntry[];
  alternativeCandidates: BuilderDecisionAlternativeCandidate[];
}

export interface BuilderDecisionWorkspaceResult {
  generatedAt: string;
  totalDecisions: number;
  automaticDecisions: number;
  manualDecisions: number;
  reviewRequired: number;
  decisionAccuracy: number;
  reviewReduction: number;
  automationPercent: number;
  decisionDistribution: Array<{ decision: BuilderDecisionType; count: number }>;
  reports: BuilderDecisionReport[];
  reviewQueue: BuilderDecisionReport[];
}

interface DecisionContext {
  object: CanonicalMasterPerfumeObject;
  provenanceScore: number;
  exactGroup: CanonicalMasterPerfumeObject[];
  normalizedGroup: CanonicalMasterPerfumeObject[];
  perfumeGroup: CanonicalMasterPerfumeObject[];
}

const normalizeText = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const normalizeIdentity = (value: string): string => normalizeText(value).replace(/[^a-z0-9]+/g, "");

const isValidLaunchYear = (value: string): boolean => {
  if (!/^\d{4}$/.test(value)) {
    return false;
  }

  const year = Number.parseInt(value, 10);
  const currentYear = new Date().getFullYear();
  return year >= 1800 && year <= currentYear + 1;
};

const safeAverage = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }

  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
};

const toSourceConnector = (object: CanonicalMasterPerfumeObject): string => {
  const sources = Object.values(object.provenance).map((entry) => entry.source.toLowerCase());
  if (sources.some((source) => source.includes("fragrantica"))) {
    return "Fragrantica Connector";
  }
  if (sources.some((source) => source.includes("parfumo"))) {
    return "Parfumo Connector";
  }
  if (sources.some((source) => source.includes("image"))) {
    return "Image Connector";
  }
  return "Builder Core";
};

const toSuggestedAction = (decision: BuilderDecisionType): string => {
  if (decision === "NEW_OBJECT") return "Create canonical entity";
  if (decision === "UPDATE_EXISTING") return "Update canonical entity";
  if (decision === "DUPLICATE") return "Skip duplicate import";
  if (decision === "ALIAS") return "Map alias to canonical entity";
  if (decision === "MERGE") return "Merge overlapping canonical entities";
  if (decision === "IGNORE") return "Ignore source row";
  if (decision === "REVIEW_REQUIRED") return "Send to Review";
  return "Reject invalid record";
};

const buildProvenance = (object: CanonicalMasterPerfumeObject): BuilderDecisionProvenanceEntry[] =>
  Object.entries(object.provenance)
    .map(([key, entry]) => ({ key, source: entry.source, method: entry.method, confidence: entry.confidence }))
    .sort((left, right) => right.confidence - left.confidence);

const buildIdentity = (object: CanonicalMasterPerfumeObject): { exact: string; normalized: string } => {
  const brand = object.canonicalBrand.value ?? object.rawBrand;
  const exact = `${object.perfume.trim().toLowerCase()}|${brand.trim().toLowerCase()}|${object.launchYear.trim().toLowerCase()}`;
  const normalized = `${normalizeIdentity(object.perfume)}|${normalizeIdentity(brand)}|${normalizeIdentity(object.launchYear)}`;
  return { exact, normalized };
};

const buildDecisionHistory = (input: {
  decision: BuilderDecisionType;
  reason: string;
  triggeredRules: string[];
  sourceConnector: string;
}): BuilderDecisionHistoryEntry[] => {
  const now = new Date().toISOString();
  return [
    {
      at: now,
      ruleId: "identity-analysis",
      decision: input.decision,
      reason: `Identity analysis complete via ${input.sourceConnector}.`,
    },
    {
      at: now,
      ruleId: "rule-trace",
      decision: input.decision,
      reason: input.triggeredRules.join(", "),
    },
    {
      at: now,
      ruleId: "final-decision",
      decision: input.decision,
      reason: input.reason,
    },
  ];
};

const buildAlternativeCandidates = (
  context: DecisionContext,
): BuilderDecisionAlternativeCandidate[] => {
  const candidates: BuilderDecisionAlternativeCandidate[] = [];
  const sameExact = context.exactGroup.filter((item) => item.id !== context.object.id);
  const sameNormalized = context.normalizedGroup.filter((item) => item.id !== context.object.id);
  const samePerfume = context.perfumeGroup.filter((item) => item.id !== context.object.id);

  for (const candidate of [...sameExact, ...sameNormalized, ...samePerfume]) {
    candidates.push({
      id: candidate.id,
      perfume: candidate.perfume,
      brand: candidate.canonicalBrand.value ?? candidate.rawBrand,
      launchYear: candidate.launchYear,
      decision: "REVIEW_REQUIRED",
      confidence: candidate.builderConfidence,
      reason: candidate.unresolvedEntities > 0 ? "Unresolved entity overlap" : "Identity collision",
    });
  }

  return candidates
    .sort((left, right) => right.confidence - left.confidence || left.id.localeCompare(right.id))
    .slice(0, 5);
};

const evaluateDecision = (context: DecisionContext): BuilderDecisionReport => {
  const { object } = context;
  const brand = object.canonicalBrand.value ?? object.rawBrand;
  const sourceConnector = toSourceConnector(object);
  const confidence = Number(((object.builderConfidence * 0.7) + (context.provenanceScore * 0.3)).toFixed(2));
  const triggeredRules: string[] = [];

  const hasLaunchYearIssue = object.launchYear.trim().length === 0 || !isValidLaunchYear(object.launchYear.trim());
  const hasIdentityIssue = object.perfume.trim().length === 0 || brand.trim().length === 0;
  const exactCollision = context.exactGroup.length > 1;
  const normalizedCollision = context.normalizedGroup.length > 1;
  const perfumeCollision = context.perfumeGroup.length > 1;
  const aliasResolved =
    object.canonicalBrand.method === "known-mapping" ||
    object.canonicalBrand.method === "normalized-match" ||
    object.canonicalBrand.method === "alias-match";
  const strongEvidence = confidence >= 0.9 && object.unresolvedEntities === 0;
  const mediumEvidence = confidence >= 0.75 && object.unresolvedEntities <= 1;
  const weakEvidence = confidence < 0.45 || object.unresolvedEntities >= 3;

  let decision: BuilderDecisionType = "NEW_OBJECT";
  let reason = "Unique canonical entity identified.";

  if (hasLaunchYearIssue || hasIdentityIssue) {
    decision = "INVALID";
    reason = "Mandatory identity fields are missing or invalid.";
    triggeredRules.push(hasLaunchYearIssue ? "launch-year-invalid" : "launch-year-ok");
    triggeredRules.push(hasIdentityIssue ? "identity-missing" : "identity-present");
  } else if (weakEvidence) {
    decision = "IGNORE";
    reason = "Evidence is too sparse to produce a safe canonical decision.";
    triggeredRules.push("evidence-too-weak");
  } else if (exactCollision) {
    const bestMatch = context.exactGroup
      .slice()
      .sort((left, right) => {
        if (right.builderConfidence !== left.builderConfidence) {
          return right.builderConfidence - left.builderConfidence;
        }
        const leftProvenance = safeAverage(Object.values(left.provenance).map((entry) => entry.confidence));
        const rightProvenance = safeAverage(Object.values(right.provenance).map((entry) => entry.confidence));
        if (rightProvenance !== leftProvenance) {
          return rightProvenance - leftProvenance;
        }
        return left.rowIndex - right.rowIndex;
      })[0];

    triggeredRules.push("exact-identity-match");
    if (object.id === bestMatch.id) {
      decision = context.exactGroup.length > 1 ? "UPDATE_EXISTING" : "NEW_OBJECT";
      reason = "Exact identity matches an existing canonical record and this row is the strongest candidate.";
      triggeredRules.push("best-exact-match");
    } else {
      decision = "DUPLICATE";
      reason = "Exact identity already exists in the canonical set.";
      triggeredRules.push("duplicate-exact-match");
    }
  } else if (normalizedCollision) {
    const ordered = context.normalizedGroup
      .slice()
      .sort((left, right) => {
        if (right.builderConfidence !== left.builderConfidence) {
          return right.builderConfidence - left.builderConfidence;
        }
        return left.rowIndex - right.rowIndex;
      });
    const best = ordered[0];
    const second = ordered[1];
    const confidenceGap = second ? Number((best.builderConfidence - second.builderConfidence).toFixed(2)) : 1;
    const divergentProfiles = ordered.some(
      (candidate) =>
        normalizeText(candidate.canonicalBrand.value ?? candidate.rawBrand) !== normalizeText(brand) ||
        candidate.unresolvedEntities !== object.unresolvedEntities,
    );

    triggeredRules.push("normalized-identity-match");
    if (confidenceGap <= 0.03 || (divergentProfiles && confidenceGap <= 0.12)) {
      decision = "REVIEW_REQUIRED";
      reason = "Normalized identity collides with a competing candidate and no safe winner is available.";
      triggeredRules.push("ambiguous-collision");
    } else if (object.id === best.id) {
      decision = aliasResolved && normalizeIdentity(object.rawBrand) !== normalizeIdentity(brand)
        ? "ALIAS"
        : "UPDATE_EXISTING";
      reason = aliasResolved
        ? "Canonical brand resolved through alias or known mapping."
        : "Highest-confidence normalized identity should update the existing canonical record.";
      triggeredRules.push(aliasResolved ? "canonical-alias" : "update-best-candidate");
    } else if (object.unresolvedEntities > 0) {
      decision = "MERGE";
      reason = "Competing normalized identities provide complementary enrichment evidence.";
      triggeredRules.push("complementary-enrichment");
    } else if (mediumEvidence) {
      decision = "REVIEW_REQUIRED";
      reason = "Normalized identity is close to the confidence threshold and should be reviewed.";
      triggeredRules.push("confidence-threshold-review");
    } else {
      decision = "DUPLICATE";
      reason = "Normalized identity already exists and this row is not the strongest source.";
      triggeredRules.push("duplicate-normalized-match");
    }
  } else if (perfumeCollision && aliasResolved) {
    decision = "ALIAS";
    reason = "Canonical brand or identity was resolved through a known alias mapping.";
    triggeredRules.push("alias-resolution");
  } else if (strongEvidence) {
    decision = aliasResolved && normalizeIdentity(object.rawBrand) !== normalizeIdentity(brand) ? "ALIAS" : "NEW_OBJECT";
    reason = decision === "ALIAS"
      ? "Strong evidence confirms an alias-backed canonical brand resolution."
      : "Strong evidence supports creation of a new canonical entity.";
    triggeredRules.push("strong-evidence");
    if (decision === "ALIAS") {
      triggeredRules.push("canonical-alias");
    }
  } else if (mediumEvidence) {
    decision = "REVIEW_REQUIRED";
    reason = "Confidence is not high enough to commit automatically without ambiguity review.";
    triggeredRules.push("review-threshold");
  } else {
    decision = "IGNORE";
    reason = "Decision evidence does not justify a canonical change.";
    triggeredRules.push("ignore-fallback");
  }

  const provenance = buildProvenance(object);
  const alternativeCandidates = buildAlternativeCandidates(context);

  return {
    id: object.id,
    perfume: object.perfume,
    brand,
    launchYear: object.launchYear,
    currentDecision: decision,
    confidence,
    triggeredRules,
    affectedObject: object.id,
    suggestedNextAction: toSuggestedAction(decision),
    sourceConnector,
    timestamp: new Date().toISOString(),
    explanation: reason,
    decisionHistory: buildDecisionHistory({
      decision,
      reason,
      triggeredRules,
      sourceConnector,
    }),
    provenance,
    alternativeCandidates,
  };
};

export const loadBuilderDecisionWorkspaceData = (): BuilderDecisionWorkspaceResult => {
  const intelligence = runCanonicalBuilderIntelligence();
  const objects = intelligence.objects.slice().sort((left, right) => left.rowIndex - right.rowIndex);

  const exactGroups = new Map<string, CanonicalMasterPerfumeObject[]>();
  const normalizedGroups = new Map<string, CanonicalMasterPerfumeObject[]>();
  const perfumeGroups = new Map<string, CanonicalMasterPerfumeObject[]>();

  for (const object of objects) {
    const identity = buildIdentity(object);
    const exact = exactGroups.get(identity.exact) ?? [];
    exact.push(object);
    exactGroups.set(identity.exact, exact);

    const normalized = normalizedGroups.get(identity.normalized) ?? [];
    normalized.push(object);
    normalizedGroups.set(identity.normalized, normalized);

    const perfumeKey = normalizeIdentity(object.perfume);
    const perfume = perfumeGroups.get(perfumeKey) ?? [];
    perfume.push(object);
    perfumeGroups.set(perfumeKey, perfume);
  }

  const reports: BuilderDecisionReport[] = objects.map((object) => {
    const identity = buildIdentity(object);
    const provenanceScore = safeAverage(Object.values(object.provenance).map((entry) => entry.confidence));
    const context: DecisionContext = {
      object,
      provenanceScore,
      exactGroup: exactGroups.get(identity.exact) ?? [object],
      normalizedGroup: normalizedGroups.get(identity.normalized) ?? [object],
      perfumeGroup: perfumeGroups.get(normalizeIdentity(object.perfume)) ?? [object],
    };

    return evaluateDecision(context);
  });

  const counts: Record<BuilderDecisionType, number> = {
    NEW_OBJECT: 0,
    UPDATE_EXISTING: 0,
    DUPLICATE: 0,
    ALIAS: 0,
    MERGE: 0,
    IGNORE: 0,
    REVIEW_REQUIRED: 0,
    INVALID: 0,
  };

  for (const report of reports) {
    counts[report.currentDecision] += 1;
  }

  const totalDecisions = reports.length;
  const manualDecisions = counts.REVIEW_REQUIRED;
  const automaticDecisions = totalDecisions - manualDecisions;
  const reviewRequired = counts.REVIEW_REQUIRED;
  const reviewReduction = totalDecisions > 0 ? Number((((totalDecisions - reviewRequired) / totalDecisions) * 100).toFixed(2)) : 0;
  const automationPercent = totalDecisions > 0 ? Number(((automaticDecisions / totalDecisions) * 100).toFixed(2)) : 0;
  const automaticConfidences = reports
    .filter((report) => report.currentDecision !== "REVIEW_REQUIRED")
    .map((report) => report.confidence);
  const decisionAccuracy = automaticConfidences.length > 0 ? Number((safeAverage(automaticConfidences) * 100).toFixed(2)) : 0;

  const decisionDistribution = (Object.keys(counts) as BuilderDecisionType[]).map((decision) => ({
    decision,
    count: counts[decision],
  }));

  return {
    generatedAt: intelligence.generatedAt,
    totalDecisions,
    automaticDecisions,
    manualDecisions,
    reviewRequired,
    decisionAccuracy,
    reviewReduction,
    automationPercent,
    decisionDistribution,
    reports,
    reviewQueue: reports.filter((report) => report.currentDecision === "REVIEW_REQUIRED"),
  };
};