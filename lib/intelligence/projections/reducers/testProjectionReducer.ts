/**
 * Canonical Architecture v2
 * Phase 1 - Step 2
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 * ADR-0004 Test Engine v2
 *
 * Purpose:
 * Provide replay-safe reducer skeleton for TestProjection.
 */

import type { EventEnvelope } from "@/lib/intelligence/events/types";
import type { DnaSessionCheckpointedPayload, TestAnswerSubmittedPayload } from "@/lib/intelligence/events/types";
import type { TestProjectionState } from "@/lib/intelligence/projections/models/testProjection";
import type { ProjectionReducer } from "@/lib/intelligence/projections/types";

export const TEST_PROJECTION_REDUCER: ProjectionReducer<TestProjectionState> = {
  projectionName: "TestProjection",
  reducerVersion: 1,
  supportedEvents: ["test_answer_submitted", "dna_session_checkpointed", "legacy_state_mirrored"],
  reduce: (previousState: TestProjectionState, event: EventEnvelope): TestProjectionState => {
    switch (event.eventType) {
      case "test_answer_submitted": {
        const payload = event.payload as TestAnswerSubmittedPayload;
        return {
          ...previousState,
          userId: event.userId,
          sessionId: event.sessionId ?? previousState.sessionId,
          latestAnswer: {
            fragranceId: payload.fragranceId,
            answerDimensions: { ...payload.answerDimensions },
          },
          progress: {
            ...previousState.progress,
            currentIndex: payload.currentIndex,
            answeredCount: payload.answeredCount,
            lastUpdatedAt: event.occurredAt,
          },
        };
      }
      case "dna_session_checkpointed": {
        const payload = event.payload as DnaSessionCheckpointedPayload;
        return {
          ...previousState,
          userId: event.userId,
          sessionId: event.sessionId ?? previousState.sessionId,
          progress: {
            currentIndex: payload.currentIndex,
            answeredCount: payload.answeredOrder.length,
            answeredOrder: [...payload.answeredOrder],
            lastUpdatedAt: event.occurredAt,
          },
          currentVector: { ...payload.currentVector },
          confidenceEstimate: payload.confidenceEstimate,
        };
      }
      case "legacy_state_mirrored":
        return previousState;
      default:
        return previousState;
    }
  },
};
