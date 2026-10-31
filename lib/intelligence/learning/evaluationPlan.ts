import type { EvaluationFragranceRef, FragranceIntelligenceService } from "@/lib/intelligence/fragranceIntelligence/types";
import { selectNextBestFragrance } from "@/lib/intelligence/learning/adaptiveSelector";
import type { BehaviorProjectionState } from "@/lib/intelligence/projections/models/behaviorProjection";
import type { AnswerRecord } from "@/lib/types";

export type FragrancePlanOption = EvaluationFragranceRef & {
  score: number;
  explanation: string;
};

export type FragranceEvaluationPlanItem = {
  step: number;
  primary: FragrancePlanOption;
  backup: FragrancePlanOption | null;
};

export type PersistedFragrancePlanState = {
  version: 1;
  batchNumber: number;
  currentStep: number;
  items: FragranceEvaluationPlanItem[];
  selectedByStep: Record<number, string>;
  completedSteps: number[];
  excludedFragranceIds: string[];
};

export const buildFragranceEvaluationPlan = (input: {
  fragranceService: FragranceIntelligenceService;
  groundingProfile: { love: string[]; neutral: string[]; redFlag: string[] };
  answers?: Record<string, AnswerRecord>;
  behaviorProjection?: BehaviorProjectionState;
  previousEvaluations?: string[];
  excludedFragranceIds?: string[];
  count?: number;
}): FragranceEvaluationPlanItem[] => {
  const references = input.fragranceService.listEvaluationFragrances();
  const referenceById = new Map(references.map((reference) => [reference.fragranceId, reference]));
  const usedProfileIds = new Set<string>();
  const usedCanonicalIds = new Set<string>();
  const selectedCandidateAttributeIds = new Set<string>();
  const excludedProfileIds = new Set(input.excludedFragranceIds ?? []);
  const excludedCanonicalIds = new Set(references
    .filter((reference) => excludedProfileIds.has(reference.fragranceId))
    .map((reference) => reference.canonicalFragranceId || reference.fragranceId));
  const plan: FragranceEvaluationPlanItem[] = [];
  const requestedCount = Math.max(1, Math.min(6, input.count ?? 6));

  for (let step = 1; step <= requestedCount; step += 1) {
    const ranked = selectNextBestFragrance({
      answers: input.answers ?? {},
      behaviorProjection: input.behaviorProjection,
      groundingProfile: input.groundingProfile,
      fragranceService: input.fragranceService,
      previousEvaluations: [...new Set([...(input.previousEvaluations ?? []), ...usedProfileIds])],
      selectedCandidateAttributeIds: [...selectedCandidateAttributeIds],
      leaderboardLimit: references.length,
    });
    const available = ranked.leaderboard.flatMap((candidate) => {
      const reference = referenceById.get(candidate.fragranceId);
      if (!reference) return [];
      const canonicalId = reference.canonicalFragranceId || reference.fragranceId;
      if (usedCanonicalIds.has(canonicalId) || excludedCanonicalIds.has(canonicalId)) return [];
      return [{
        ...reference,
        score: candidate.finalScore,
        explanation: candidate.dominantExplanation,
      }];
    });
    const primary = available[0];
    if (!primary) break;

    usedProfileIds.add(primary.fragranceId);
    usedCanonicalIds.add(primary.canonicalFragranceId || primary.fragranceId);
    input.fragranceService.getCanonicalFragrance(primary.fragranceId)?.coreAttributes.forEach((attribute) => {
      selectedCandidateAttributeIds.add(attribute.canonicalAttributeId);
    });

    const backup = available.find((candidate) => {
      const canonicalId = candidate.canonicalFragranceId || candidate.fragranceId;
      return !usedProfileIds.has(candidate.fragranceId) && !usedCanonicalIds.has(canonicalId);
    }) ?? null;
    if (backup) {
      usedProfileIds.add(backup.fragranceId);
      usedCanonicalIds.add(backup.canonicalFragranceId || backup.fragranceId);
      input.fragranceService.getCanonicalFragrance(backup.fragranceId)?.coreAttributes.forEach((attribute) => {
        selectedCandidateAttributeIds.add(attribute.canonicalAttributeId);
      });
    }

    plan.push({ step, primary, backup });
  }

  return plan;
};
