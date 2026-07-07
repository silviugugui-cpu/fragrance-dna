import type { BehaviorProjectionState } from "@/lib/intelligence/projections/models/behaviorProjection";
import type { OlfactoryVector } from "@/lib/types";
import type { BehaviorPreferenceSummary, LearningApi } from "@/lib/intelligence/behavior/types";
import type { FragranceIntelligenceService } from "@/lib/intelligence/fragranceIntelligence";

type LearningApiOptions = {
  fragranceService?: FragranceIntelligenceService;
  selectedFragranceId?: string;
};

const EMPTY_BEHAVIOR_VECTOR: OlfactoryVector = {
  freshness: 0,
  warmth: 0,
  sweetness: 0,
  darkness: 0,
  cleanliness: 0,
  elegance: 0,
};

export function createBehaviorLearningApi(
  behaviorProjection: BehaviorProjectionState,
  knownAttributes: string[] = [],
  options: LearningApiOptions = {}
): LearningApi {
  return {
    getAttributePreference(canonicalAttributeId: string): BehaviorPreferenceSummary {
      const attribute = behaviorProjection.attributes[canonicalAttributeId];
      if (!attribute) {
        return {
          canonicalAttributeId,
          strength: 0,
          confidence: 0,
          evidenceCount: 0,
          explorationPriority: 1,
          lastUpdated: "",
          disposition: "uncertain",
          signals: {
            liked: 0,
            disliked: 0,
            ignored: 0,
            uncertain: 0,
          },
        };
      }

      return {
        canonicalAttributeId,
        strength: attribute.strength,
        confidence: attribute.confidence,
        evidenceCount: attribute.evidenceCount,
        explorationPriority: attribute.explorationPriority,
        lastUpdated: attribute.lastUpdated,
        disposition:
          attribute.strength > 0.15
            ? "liked"
            : attribute.strength < -0.15
              ? "disliked"
              : "uncertain",
        signals: {
          liked: attribute.likedCount,
          disliked: attribute.dislikedCount,
          ignored: attribute.ignoredCount,
          uncertain: attribute.uncertainCount,
        },
      };
    },

    getAttributeConfidence(canonicalAttributeId: string): number {
      return behaviorProjection.attributes[canonicalAttributeId]?.confidence ?? 0;
    },

    getAttributesNeedingExploration(limit: number = 5): string[] {
      return getUncertainAttributesInternal(behaviorProjection, knownAttributes, limit);
    },

    getUncertainAttributes(limit: number = 5): string[] {
      return getUncertainAttributesInternal(behaviorProjection, knownAttributes, limit);
    },

    getHighlyEnjoyableFragrances(limit: number = 5): string[] {
      const candidatePool = getCandidatePool(options.fragranceService);
      return scoreCandidates(candidatePool, behaviorProjection, "enjoyment")
        .slice(0, Math.max(1, limit))
        .map((item) => item.fragranceId);
    },

    getLearningMaximizingFragrances(limit: number = 5): string[] {
      const candidatePool = getCandidatePool(options.fragranceService);
      return scoreCandidates(candidatePool, behaviorProjection, "learning")
        .slice(0, Math.max(1, limit))
        .map((item) => item.fragranceId);
    },

    explainNextSelection(fragranceId: string): string {
      const selected = options.fragranceService?.getCanonicalFragrance(fragranceId);
      if (!selected) {
        return "Selected because it is the best available learning candidate.";
      }

      const attributeNames = selected.coreAttributes
        .map((attribute) => attribute.displayName)
        .slice(0, 2);

      const uncertainAttributes = getUncertainAttributesInternal(behaviorProjection, knownAttributes, 3);

      if (uncertainAttributes.length > 0) {
        return `This fragrance was selected because it explores ${attributeNames[0] ?? "key attributes"} while validating ${uncertainAttributes[0]}.`;
      }

      return `This fragrance was selected because it balances expected enjoyment with information gain across ${attributeNames.join(" and ") || "canonical attributes"}.`;
    },

    deriveCurrentDna(groundingVector: OlfactoryVector): OlfactoryVector {
      const behaviorVector = behaviorProjection.behaviorVector ?? EMPTY_BEHAVIOR_VECTOR;
      const blendFactor = clamp01(0.15 + behaviorProjection.confidence.global * 0.35);

      const next: OlfactoryVector = { ...groundingVector };
      for (const axis of Object.keys(next) as Array<keyof OlfactoryVector>) {
        next[axis] = clamp01(groundingVector[axis] + behaviorVector[axis] * blendFactor);
      }

      return next;
    },
  };
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

type CandidateScoreMode = "enjoyment" | "learning";

type CandidateScore = {
  fragranceId: string;
  score: number;
};

function getUncertainAttributesInternal(
  behaviorProjection: BehaviorProjectionState,
  knownAttributes: string[],
  limit: number
): string[] {
  const available = Array.from(new Set([...knownAttributes, ...Object.keys(behaviorProjection.attributes)]));

  return available
    .map((attributeId) => ({
      attributeId,
      confidence: behaviorProjection.attributes[attributeId]?.confidence ?? 0,
      explorationPriority: behaviorProjection.attributes[attributeId]?.explorationPriority ?? 1,
    }))
    .sort((left, right) => {
      const leftScore = left.confidence + left.explorationPriority;
      const rightScore = right.confidence + right.explorationPriority;
      return leftScore - rightScore;
    })
    .slice(0, Math.max(1, limit))
    .map((item) => item.attributeId);
}

function getCandidatePool(service?: FragranceIntelligenceService) {
  const fragrances = service?.listEvaluationFragrances() ?? [];
  return fragrances.map((fragrance) => service?.getCanonicalFragrance(fragrance.fragranceId)).filter(Boolean) as NonNullable<ReturnType<FragranceIntelligenceService["getCanonicalFragrance"]>>[];
}

function scoreCandidates(
  candidatePool: NonNullable<ReturnType<FragranceIntelligenceService["getCanonicalFragrance"]>>[],
  behaviorProjection: BehaviorProjectionState,
  mode: CandidateScoreMode
): CandidateScore[] {
  const attributeMap = behaviorProjection.attributes;

  return candidatePool
    .map((fragrance) => {
      const infoGain = scoreInformationGain(fragrance.coreAttributes, attributeMap);
      const enjoyment = scoreExpectedEnjoyment(fragrance.coreAttributes, attributeMap);
      const diversity = scoreDiversity(fragrance.coreAttributes, attributeMap);

      const score = mode === "enjoyment"
        ? enjoyment * 0.65 + diversity * 0.2 + infoGain * 0.15
        : infoGain * 0.5 + enjoyment * 0.3 + diversity * 0.2;

      return {
        fragranceId: fragrance.fragranceId,
        score,
      };
    })
    .sort((left, right) => right.score - left.score);
}

function scoreInformationGain(
  attributes: { canonicalAttributeId: string }[],
  attributeMap: BehaviorProjectionState["attributes"]
): number {
  if (attributes.length === 0) {
    return 0;
  }

  const total = attributes.reduce((sum, attribute) => {
    const knowledge = attributeMap[attribute.canonicalAttributeId];
    const confidence = knowledge?.confidence ?? 0;
    const evidence = knowledge?.evidenceCount ?? 0;
    const conflict = Math.abs((knowledge?.affinity ?? 0) - (knowledge?.strength ?? 0));
    const novelty = 1 - clamp01(evidence / 6);
    return sum + clamp01((1 - confidence) * 0.55 + novelty * 0.3 + conflict * 0.15);
  }, 0);

  return clamp01(total / attributes.length);
}

function scoreExpectedEnjoyment(
  attributes: { canonicalAttributeId: string }[],
  attributeMap: BehaviorProjectionState["attributes"]
): number {
  if (attributes.length === 0) {
    return 0;
  }

  const total = attributes.reduce((sum, attribute) => {
    const knowledge = attributeMap[attribute.canonicalAttributeId];
    const affinity = knowledge?.affinity ?? 0;
    const confidence = knowledge?.confidence ?? 0;
    const evidenceBoost = clamp01((knowledge?.evidenceCount ?? 0) / 6);
    return sum + clamp01(0.5 + affinity * 0.35 + confidence * 0.15 + evidenceBoost * 0.05);
  }, 0);

  return clamp01(total / attributes.length);
}

function scoreDiversity(
  attributes: { canonicalAttributeId: string }[],
  attributeMap: BehaviorProjectionState["attributes"]
): number {
  if (attributes.length === 0) {
    return 0;
  }

  const total = attributes.reduce((sum, attribute) => {
    const knowledge = attributeMap[attribute.canonicalAttributeId];
    const priority = knowledge?.explorationPriority ?? 1;
    return sum + priority;
  }, 0);

  return clamp01(total / attributes.length);
}
