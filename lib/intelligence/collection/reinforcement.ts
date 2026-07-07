import {
  buildCanonicalDefaultAnswers,
  getCanonicalEvaluationQuestionsForFragrance,
  runCanonicalEvaluationWrite,
  type CanonicalEvaluationWriteResult,
} from "@/lib/intelligence/evaluation";
import {
  createFragranceIntelligenceService,
  type FragranceIntelligenceService,
} from "@/lib/intelligence/fragranceIntelligence";
import type { Phase1FeatureFlags } from "@/lib/intelligence/flags/phase1Flags";
import type { QuestionDefinition } from "@/lib/intelligence/questions";
import type { AnswerRecord } from "@/lib/types";

export type CollectionReinforcementInput = {
  userId: string;
  fragranceId: string;
  answerDimensions: Record<string, number>;
  flags: Phase1FeatureFlags;
  sessionId?: string;
  collectionItemId?: string;
};

export type CollectionReinforcementResult = CanonicalEvaluationWriteResult;

export function getCollectionReinforcementQuestions(
  fragranceId: string,
  options?: {
    fragranceService?: FragranceIntelligenceService;
    adaptiveEnabled?: boolean;
    allowLegacyFallback?: boolean;
  }
): QuestionDefinition[] {
  const fragranceService = options?.fragranceService ?? createFragranceIntelligenceService();
  const fragrance = fragranceService.getCanonicalFragrance(fragranceId);

  if (!fragrance) {
    return [];
  }

  return getCanonicalEvaluationQuestionsForFragrance(fragrance, {
    adaptiveEnabled: options?.adaptiveEnabled ?? true,
    allowLegacyFallback: options?.allowLegacyFallback ?? false,
  });
}

export function buildCollectionReinforcementDefaults(
  fragranceId: string,
  options?: {
    fragranceService?: FragranceIntelligenceService;
    adaptiveEnabled?: boolean;
    allowLegacyFallback?: boolean;
  }
): AnswerRecord {
  return buildCanonicalDefaultAnswers(
    getCollectionReinforcementQuestions(fragranceId, options)
  );
}

export async function runCollectionReinforcementEvaluation(
  input: CollectionReinforcementInput
): Promise<CollectionReinforcementResult> {
  return runCanonicalEvaluationWrite({
    userId: input.userId,
    sessionId: input.sessionId,
    fragranceId: input.fragranceId,
    answerDimensions: input.answerDimensions,
    flags: input.flags,
    source: "collection",
    producer: "app/collection:reinforcement",
    submission: {
      eventType: "collection_evaluation_submitted",
      payload: {
        collectionItemId: input.collectionItemId,
        fragranceId: input.fragranceId,
        answerDimensions: { ...input.answerDimensions },
      },
      contextSource: "collection-reinforcement",
    },
    engineVersionLabel: "v2-step8-collection-reinforcement",
  });
}