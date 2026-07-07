/**
 * Canonical Architecture v2
 * Phase 1 - Step 6
 *
 * Purpose:
 * Execute Test dual-write in parallel to legacy persistence and validate parity
 * via the canonical evaluation engine and shadow projections.
 */

import {
  runCanonicalEvaluationWrite,
  type CanonicalEvaluationWriteResult,
} from "@/lib/intelligence/evaluation";
import type { Phase1FeatureFlags } from "@/lib/intelligence/flags/phase1Flags";

export type TestDualWriteInput = {
  userId: string;
  sessionId?: string;
  fragranceId: string;
  answerDimensions: Record<string, number>;
  currentIndex: number;
  answeredCount: number;
  answeredOrder: string[];
  currentVector: Record<string, number>;
  confidenceEstimate: number;
  flags: Phase1FeatureFlags;
};

export type TestDualWriteResult = CanonicalEvaluationWriteResult;

export async function runTestDualWrite(input: TestDualWriteInput): Promise<TestDualWriteResult> {
  if (!input.flags.testDualWriteEnabled) {
    return {
      attempted: false,
      persisted: false,
      published: false,
      parityValidated: false,
      parityMatches: false,
      eventIds: [],
      errors: [],
      differences: [],
      metrics: {
        eventsEmitted: 0,
        eventsPersisted: 0,
        eventsPublished: 0,
        eventsFailed: 0,
        eventsRetried: 0,
        parityPassed: 0,
        parityFailed: 0,
        averageWriteTime: 0,
        averageReplayTime: 0,
        averageParityTime: 0,
      },
    };
  }

  return runCanonicalEvaluationWrite({
    userId: input.userId,
    sessionId: input.sessionId,
    fragranceId: input.fragranceId,
    answerDimensions: input.answerDimensions,
    flags: input.flags,
    source: "test",
    producer: "app/test:step6-dual-write",
    submission: {
      eventType: "test_answer_submitted",
      payload: {
        fragranceId: input.fragranceId,
        answerDimensions: { ...input.answerDimensions },
        currentIndex: input.currentIndex,
        answeredCount: input.answeredCount,
      },
      contextSource: "test-next",
    },
    checkpoint: {
      payload: {
        currentIndex: input.currentIndex,
        answeredOrder: [...input.answeredOrder],
        currentVector: { ...input.currentVector },
        confidenceEstimate: input.confidenceEstimate,
      },
    },
    parity: {
      enabled: input.flags.phase1ShadowValidation && input.flags.testShadowValidationEnabled,
      legacyState: {
        currentIndex: input.currentIndex,
        answeredCount: input.answeredCount,
        answeredOrder: [...input.answeredOrder],
        currentVector: { ...input.currentVector },
        lastFragranceId: input.fragranceId,
        lastAnswerDimensions: { ...input.answerDimensions },
      },
    },
    engineVersionLabel: "v2-step6-shadow",
  });
}
