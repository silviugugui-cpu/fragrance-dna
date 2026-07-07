import { resolveCanonicalAttribute } from "@/lib/intelligence/attributes";
import type { FragranceIntelligenceService } from "@/lib/intelligence/fragranceIntelligence";
import { createBehaviorLearningApi } from "@/lib/intelligence/behavior";
import type { BehaviorProjectionState } from "@/lib/intelligence/projections/models/behaviorProjection";
import type { AnswerRecord, OlfactoryVector } from "@/lib/types";

export type AdaptiveSelectionMode = "adaptive" | "legacy-sequential" | "fallback";

export type AdaptiveSelectionContributionBreakdown = {
  expectedEnjoyment: number;
  informationGain: number;
  diversity: number;
  behavior: number;
};

export type AdaptiveSelectionCandidateReport = AdaptiveSelectionCandidate & {
  rank: number;
  behaviorAlignment: number;
  contributions: AdaptiveSelectionContributionBreakdown;
  dominantExplanation: string;
};

export type AdaptiveSelectionLeaderboardEntry = {
  rank: number;
  fragranceId: string;
  displayName: string;
  finalScore: number;
  informationGain: number;
  expectedEnjoyment: number;
  diversity: number;
  behavior: number;
  dominantExplanation: string;
};

export type AdaptiveSelectionDebugReport = {
  mode: AdaptiveSelectionMode;
  selectedFragranceId: string;
  selectedDisplayName: string;
  selectionExplanation: string;
  candidateScores: AdaptiveSelectionCandidateReport[];
  leaderboard: AdaptiveSelectionLeaderboardEntry[];
  reproducibilityKey: string;
};

export type AdaptiveSelectionEvaluation = AdaptiveSelectionResult & {
  leaderboard: AdaptiveSelectionLeaderboardEntry[];
  debugReport: AdaptiveSelectionDebugReport;
};

export type AdaptiveSelectionCalibrationContext = {
  currentConfidenceState?: {
    global: number;
    updates?: number;
  };
  behaviorVectorOverride?: Partial<OlfactoryVector>;
};

export type AdaptiveSelectionCandidate = {
  fragranceId: string;
  displayName: string;
  expectedEnjoyment: number;
  informationGain: number;
  diversity: number;
  score: number;
  explanation: string;
};

export type AdaptiveSelectionResult = {
  fragranceId: string;
  displayName: string;
  explanation: string;
  candidates: AdaptiveSelectionCandidate[];
  behaviorProjection: BehaviorProjectionState;
};

export type AdaptiveSelectionInput = {
  answers: Record<string, AnswerRecord>;
  groundingTokens: string[];
  fragranceService: FragranceIntelligenceService;
  legacySequentialEnabled?: boolean;
  previousEvaluations?: string[];
  leaderboardLimit?: number;
  calibrationContext?: AdaptiveSelectionCalibrationContext;
};

export function selectNextBestFragrance(input: AdaptiveSelectionInput): AdaptiveSelectionEvaluation {
  return evaluateAdaptiveSelection(input);
}

export function evaluateAdaptiveSelection(input: AdaptiveSelectionInput): AdaptiveSelectionEvaluation {
  const allFragrances = input.fragranceService.listEvaluationFragrances();
  const answeredIds = new Set(input.previousEvaluations ?? Object.keys(input.answers));
  const remaining = allFragrances.filter((fragrance) => !answeredIds.has(fragrance.fragranceId));

  if (remaining.length === 0) {
    const fallback = allFragrances[0];
    const behaviorProjection = buildBehaviorProjectionFromAnswers(input.answers, input.fragranceService, input.calibrationContext);
    return {
      fragranceId: fallback?.fragranceId ?? "",
      displayName: fallback?.displayName ?? "",
      explanation: "Fallback to the first fragrance because the evaluation set is exhausted.",
      candidates: [],
      behaviorProjection,
      leaderboard: [],
      debugReport: buildDebugReport({
        mode: "fallback",
        selectedFragranceId: fallback?.fragranceId ?? "",
        selectedDisplayName: fallback?.displayName ?? "",
        selectionExplanation: "Fallback to the first fragrance because the evaluation set is exhausted.",
        candidates: [],
        leaderboard: [],
        behaviorProjection,
      }),
    };
  }

  if (input.legacySequentialEnabled) {
    const sequential = remaining[0];
    const behaviorProjection = buildBehaviorProjectionFromAnswers(input.answers, input.fragranceService, input.calibrationContext);
      const candidates: AdaptiveSelectionCandidateReport[] = remaining.map((fragrance) => ({
      fragranceId: fragrance.fragranceId,
      displayName: fragrance.displayName,
      expectedEnjoyment: 0,
      informationGain: 0,
      diversity: 0,
      score: 0,
      explanation: "Legacy sequential mode",
      behaviorAlignment: 0,
      contributions: {
        expectedEnjoyment: 0,
        informationGain: 0,
        diversity: 0,
        behavior: 0,
      },
      dominantExplanation: "Dominant signal: legacy sequential order",
      rank: 0,
    } satisfies AdaptiveSelectionCandidateReport));
    const leaderboard = buildLeaderboard(candidates, input.leaderboardLimit);
    return {
      fragranceId: sequential.fragranceId,
      displayName: sequential.displayName,
      explanation: "Legacy sequential selection is enabled, so the next unanswered fragrance is used.",
      candidates,
      behaviorProjection,
      leaderboard,
      debugReport: buildDebugReport({
        mode: "legacy-sequential",
        selectedFragranceId: sequential.fragranceId,
        selectedDisplayName: sequential.displayName,
        selectionExplanation: "Legacy sequential selection is enabled, so the next unanswered fragrance is used.",
        candidates,
        leaderboard,
        behaviorProjection,
      }),
    };
  }

  const behaviorProjection = buildBehaviorProjectionFromAnswers(input.answers, input.fragranceService, input.calibrationContext);
  const learningApi = createBehaviorLearningApi(behaviorProjection, buildKnownAttributes(input.fragranceService), {
    fragranceService: input.fragranceService,
  });

  const groundingBias = buildGroundingBias(input.groundingTokens);
  const candidates: AdaptiveSelectionCandidateReport[] = remaining
    .map((fragrance) => {
      const canonical = input.fragranceService.getCanonicalFragrance(fragrance.fragranceId);
      if (!canonical) {
        return null;
      }

      const attributeIds = canonical.coreAttributes.map((attribute) => attribute.canonicalAttributeId);
      const expectedEnjoyment = calculateExpectedEnjoyment(attributeIds, behaviorProjection, groundingBias);
      const informationGain = calculateInformationGain(attributeIds, behaviorProjection);
      const diversity = calculateDiversity(attributeIds, behaviorProjection, answeredIds);
      const behaviorAlignment = calculateBehaviorAlignment(canonical.coreAttributes, behaviorProjection);
      const contributions: AdaptiveSelectionContributionBreakdown = {
        expectedEnjoyment: expectedEnjoyment * 0.4,
        informationGain: informationGain * 0.25,
        diversity: diversity * 0.1,
        behavior: behaviorAlignment * 0.25,
      };
      const score = contributions.expectedEnjoyment + contributions.informationGain + contributions.diversity + contributions.behavior;
      const dominantExplanation = buildDominantContributionExplanation(contributions);
      const explanation = buildExplanation(
        attributeIds,
        behaviorProjection,
        learningApi,
        score,
        expectedEnjoyment,
        informationGain,
        behaviorAlignment,
        dominantExplanation
      );

      return {
        fragranceId: fragrance.fragranceId,
        displayName: fragrance.displayName,
        expectedEnjoyment,
        informationGain,
        diversity,
        score,
        explanation,
        behaviorAlignment,
        contributions,
        dominantExplanation,
        rank: 0,
      } satisfies AdaptiveSelectionCandidateReport;
    })
    .filter((item): item is AdaptiveSelectionCandidateReport => item !== null)
    .sort(compareCandidatesDeterministically)
    .map((candidate, index) => ({
      ...candidate,
      rank: index + 1,
    }));

  const leaderboard = buildLeaderboard(candidates, input.leaderboardLimit);

  const selected = candidates[0] ?? {
      fragranceId: remaining[0].fragranceId,
      displayName: remaining[0].displayName,
      expectedEnjoyment: 0,
      informationGain: 0,
      diversity: 0,
      score: 0,
      explanation: "Selected as the best remaining candidate.",
      behaviorAlignment: 0,
      contributions: {
        expectedEnjoyment: 0,
        informationGain: 0,
        diversity: 0,
        behavior: 0,
      },
      dominantExplanation: "Dominant signal: balanced scoring",
      rank: 1,
  };

  return {
    fragranceId: selected.fragranceId,
    displayName: selected.displayName,
    explanation: selected.explanation,
    candidates,
    behaviorProjection,
    leaderboard,
    debugReport: buildDebugReport({
      mode: "adaptive",
      selectedFragranceId: selected.fragranceId,
      selectedDisplayName: selected.displayName,
      selectionExplanation: selected.explanation,
      candidates: candidates as AdaptiveSelectionCandidateReport[],
      leaderboard,
      behaviorProjection,
    }),
  };
}

function buildKnownAttributes(service: FragranceIntelligenceService): string[] {
  const known = new Set<string>();
  for (const fragrance of service.listEvaluationFragrances()) {
    const canonical = service.getCanonicalFragrance(fragrance.fragranceId);
    if (!canonical) {
      continue;
    }
    for (const attribute of canonical.coreAttributes) {
      known.add(attribute.canonicalAttributeId);
    }
  }

  return [...known];
}

function buildBehaviorProjectionFromAnswers(
  answers: Record<string, AnswerRecord>,
  service: FragranceIntelligenceService,
  calibrationContext?: AdaptiveSelectionCalibrationContext
): BehaviorProjectionState {
  const canonicalAttributes = buildKnownAttributes(service);
  const state = createBehaviorLearningApiState();

  for (const [fragranceId, answer] of Object.entries(answers)) {
    const canonical = service.getCanonicalFragrance(fragranceId);
    if (!canonical) {
      continue;
    }

    for (const attribute of canonical.coreAttributes) {
      const value = answer[attribute.canonicalAttributeId];
      if (typeof value !== "number") {
        continue;
      }

      const current = state.attributes[attribute.canonicalAttributeId] ?? createEmptyAttributeState(attribute.canonicalAttributeId);
      const signed = (value - 50) / 50;
      const updated = {
        ...current,
        evidenceCount: current.evidenceCount + 1,
        affinity: clampSigned((current.affinity + signed) / 2),
        strength: clampSigned((current.strength + signed) / 2),
        confidence: clamp01((current.confidence + Math.abs(signed)) / 2),
        explorationPriority: clamp01(1 - clamp01(current.evidenceCount / 6) - current.confidence * 0.5),
        lastValue: value,
        lastFragranceId: fragranceId,
        lastUpdated: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      };

      state.attributes[attribute.canonicalAttributeId] = updated;
    }
  }

  state.confidence.global = calculateGlobalConfidence(state.attributes);
  state.behaviorVector = deriveBehaviorVector(state.attributes, canonicalAttributes);

  if (calibrationContext?.behaviorVectorOverride) {
    state.behaviorVector = {
      ...state.behaviorVector,
      ...calibrationContext.behaviorVectorOverride,
    };
  }

  if (calibrationContext?.currentConfidenceState) {
    state.confidence = {
      global: clamp01(calibrationContext.currentConfidenceState.global),
      updates: calibrationContext.currentConfidenceState.updates ?? state.confidence.updates,
    };
  }

  return state;
}

function createBehaviorLearningApiState(): BehaviorProjectionState {
  return {
    metadata: {
      projectionName: "BehaviorProjection",
      schemaVersion: 1,
      projectionVersion: 1,
      stateVersion: 1,
      lastEventId: undefined,
      lastSequence: 0,
      rebuiltAt: new Date(0).toISOString(),
      checksum: undefined,
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
    },
    userId: "",
    attributes: {},
    behaviorVector: {
      freshness: 0,
      warmth: 0,
      sweetness: 0,
      darkness: 0,
      cleanliness: 0,
      elegance: 0,
    },
    confidence: {
      global: 0,
      updates: 0,
    },
  };
}

function createEmptyAttributeState(canonicalAttributeId: string) {
  return {
    canonicalAttributeId,
    likedCount: 0,
    dislikedCount: 0,
    ignoredCount: 0,
    uncertainCount: 0,
    evidenceCount: 0,
    affinity: 0,
    strength: 0,
    confidence: 0,
    explorationPriority: 1,
    lastValue: 50,
    lastFragranceId: "",
    lastUpdated: new Date(0).toISOString(),
    lastUpdatedAt: new Date(0).toISOString(),
  };
}

function buildGroundingBias(groundingTokens: string[]): Set<string> {
  const bias = new Set<string>();
  for (const token of groundingTokens) {
    const resolved = resolveCanonicalAttribute(token);
    if (resolved) {
      bias.add(resolved.canonicalAttributeId);
    }
  }
  return bias;
}

function calculateExpectedEnjoyment(
  attributeIds: string[],
  behaviorProjection: BehaviorProjectionState,
  groundingBias: Set<string>
): number {
  if (attributeIds.length === 0) {
    return 0;
  }

  const total = attributeIds.reduce((sum, attributeId) => {
    const knowledge = behaviorProjection.attributes[attributeId];
    const affinity = knowledge?.affinity ?? 0;
    const confidence = knowledge?.confidence ?? 0;
    const groundingBoost = groundingBias.has(attributeId) ? 0.08 : 0;
    return sum + clamp01(0.5 + affinity * 0.35 + confidence * 0.15 + groundingBoost);
  }, 0);

  return clamp01(total / attributeIds.length);
}

function calculateInformationGain(
  attributeIds: string[],
  behaviorProjection: BehaviorProjectionState
): number {
  if (attributeIds.length === 0) {
    return 0;
  }

  const total = attributeIds.reduce((sum, attributeId) => {
    const knowledge = behaviorProjection.attributes[attributeId];
    const confidence = knowledge?.confidence ?? 0;
    const evidenceCount = knowledge?.evidenceCount ?? 0;
    const conflict = Math.abs((knowledge?.affinity ?? 0) - (knowledge?.strength ?? 0));
    const insufficientEvidence = 1 - clamp01(evidenceCount / 6);
    return sum + clamp01((1 - confidence) * 0.55 + insufficientEvidence * 0.3 + conflict * 0.15);
  }, 0);

  return clamp01(total / attributeIds.length);
}

function calculateDiversity(
  attributeIds: string[],
  behaviorProjection: BehaviorProjectionState,
  answeredIds: Set<string>
): number {
  if (attributeIds.length === 0) {
    return 0;
  }

  const seenAttributes = new Set<string>();
  for (const answeredId of answeredIds) {
    const knowledge = behaviorProjection.attributes[answeredId];
    if (knowledge) {
      seenAttributes.add(knowledge.canonicalAttributeId);
    }
  }

  const novelty = attributeIds.filter((attributeId) => !seenAttributes.has(attributeId)).length / attributeIds.length;
  return clamp01(novelty);
}

function buildExplanation(
  attributeIds: string[],
  behaviorProjection: BehaviorProjectionState,
  learningApi: ReturnType<typeof createBehaviorLearningApi>,
  score: number,
  expectedEnjoyment: number,
  informationGain: number,
  behaviorAlignment: number,
  dominantExplanation: string
): string {
  const uncertain = learningApi.getUncertainAttributes(3);
  const targetAttribute = uncertain[0] ?? attributeIds[0] ?? "key attributes";
  const loadedAttribute = attributeIds.find((attributeId) => {
    const knowledge = behaviorProjection.attributes[attributeId];
    return (knowledge?.confidence ?? 0) < 0.5;
  }) ?? targetAttribute;

  if (behaviorAlignment >= expectedEnjoyment && behaviorAlignment >= informationGain) {
    return `${dominantExplanation}. This fragrance was selected because it aligns with your learned preference vector while exploring ${targetAttribute}.`;
  }

  if (informationGain >= expectedEnjoyment) {
    return `${dominantExplanation}. This fragrance was selected because it explores ${targetAttribute} while validating ${loadedAttribute}.`;
  }

  return `${dominantExplanation}. This fragrance was selected because it balances expected enjoyment (${Math.round(score * 100)}%) with learning value across ${targetAttribute}.`;
}

function calculateBehaviorAlignment(
  attributes: Array<{ canonicalAttributeId: string }>,
  behaviorProjection: BehaviorProjectionState
): number {
  if (attributes.length === 0) {
    return 0;
  }

  const total = attributes.reduce((sum, attribute) => {
    const knowledge = behaviorProjection.attributes[attribute.canonicalAttributeId];
    const affinity = knowledge?.affinity ?? 0;
    const confidence = knowledge?.confidence ?? 0;
    const alignment = clamp01(0.5 + affinity * 0.4 + confidence * 0.1);
    return sum + alignment;
  }, 0);

  return clamp01(total / attributes.length);
}

function deriveBehaviorVector(
  attributes: BehaviorProjectionState["attributes"],
  knownAttributes: string[]
): OlfactoryVector {
  const vector: OlfactoryVector = {
    freshness: 0,
    warmth: 0,
    sweetness: 0,
    darkness: 0,
    cleanliness: 0,
    elegance: 0,
  };

  for (const attributeId of knownAttributes) {
    const knowledge = attributes[attributeId];
    if (!knowledge) {
      continue;
    }

    const resolved = resolveCanonicalAttribute(attributeId);
    if (!resolved) {
      continue;
    }

    for (const axis of Object.keys(vector) as Array<keyof OlfactoryVector>) {
      const axisWeight = resolved.vectorMapping[axis] ?? 0;
      vector[axis] += axisWeight * knowledge.affinity * knowledge.confidence;
    }
  }

  for (const axis of Object.keys(vector) as Array<keyof OlfactoryVector>) {
    vector[axis] = clamp01(0.5 + vector[axis] / Math.max(1, knownAttributes.length));
  }

  return vector;
}

function calculateGlobalConfidence(attributes: BehaviorProjectionState["attributes"]): number {
  const entries = Object.values(attributes);
  if (entries.length === 0) {
    return 0;
  }

  const total = entries.reduce((sum, attribute) => sum + attribute.confidence, 0);
  return clamp01(total / entries.length);
}

function buildLeaderboard(
  candidates: AdaptiveSelectionCandidateReport[],
  limit?: number
): AdaptiveSelectionLeaderboardEntry[] {
  const topLimit = Math.max(1, limit ?? 10);

  return candidates.slice(0, topLimit).map((candidate, index) => ({
    rank: index + 1,
    fragranceId: candidate.fragranceId,
    displayName: candidate.displayName,
    finalScore: candidate.score,
    informationGain: candidate.informationGain,
    expectedEnjoyment: candidate.expectedEnjoyment,
    diversity: candidate.diversity,
    behavior: candidate.behaviorAlignment,
    dominantExplanation: candidate.dominantExplanation,
  }));
}

function buildDebugReport(input: {
  mode: AdaptiveSelectionMode;
  selectedFragranceId: string;
  selectedDisplayName: string;
  selectionExplanation: string;
  candidates: AdaptiveSelectionCandidateReport[];
  leaderboard: AdaptiveSelectionLeaderboardEntry[];
  behaviorProjection: BehaviorProjectionState;
}): AdaptiveSelectionDebugReport {
  const candidateScores = input.candidates.map((candidate) => ({
    ...candidate,
  }));

  return {
    mode: input.mode,
    selectedFragranceId: input.selectedFragranceId,
    selectedDisplayName: input.selectedDisplayName,
    selectionExplanation: input.selectionExplanation,
    candidateScores,
    leaderboard: input.leaderboard,
    reproducibilityKey: buildReproducibilityKey(input.mode, input.selectedFragranceId, candidateScores),
  };
}

function buildReproducibilityKey(
  mode: AdaptiveSelectionMode,
  selectedFragranceId: string,
  candidateScores: AdaptiveSelectionCandidateReport[]
): string {
  const signature = candidateScores
    .map((candidate) => `${candidate.rank}:${candidate.fragranceId}:${candidate.score.toFixed(6)}`)
    .join("|");

  return `${mode}:${selectedFragranceId}:${signature}`;
}

function buildDominantContributionExplanation(
  contributions: AdaptiveSelectionContributionBreakdown
): string {
  const entries = Object.entries(contributions) as Array<[keyof AdaptiveSelectionContributionBreakdown, number]>;
  const dominant = entries.reduce((best, current) => (current[1] > best[1] ? current : best), entries[0]);

  switch (dominant[0]) {
    case "expectedEnjoyment":
      return "Dominant signal: expected enjoyment";
    case "informationGain":
      return "Dominant signal: information gain";
    case "diversity":
      return "Dominant signal: diversity";
    case "behavior":
      return "Dominant signal: learned behavior";
    default:
      return "Dominant signal: balanced scoring";
  }
}

function compareCandidatesDeterministically(
  left: AdaptiveSelectionCandidateReport,
  right: AdaptiveSelectionCandidateReport
): number {
  if (left.score !== right.score) {
    return right.score - left.score;
  }

  const fragranceCompare = left.fragranceId.localeCompare(right.fragranceId);
  if (fragranceCompare !== 0) {
    return fragranceCompare;
  }

  return left.displayName.localeCompare(right.displayName);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clampSigned(value: number): number {
  return Math.max(-1, Math.min(1, value));
}