/**
 * Canonical Architecture v2
 * Phase 1 - Step 2
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 * ADR-0003 Persistent User DNA
 *
 * Purpose:
 * Provide replay-safe reducer skeleton for GroundingProjection.
 */

import type { EventEnvelope } from "@/lib/intelligence/events/types";
import type { GroundingSubmittedPayload } from "@/lib/intelligence/events/types";
import type { GroundingProjectionState } from "@/lib/intelligence/projections/models/groundingProjection";
import type { ProjectionReducer } from "@/lib/intelligence/projections/types";

export const GROUNDING_PROJECTION_REDUCER: ProjectionReducer<GroundingProjectionState> = {
  projectionName: "GroundingProjection",
  reducerVersion: 1,
  supportedEvents: ["grounding_submitted", "legacy_state_mirrored"],
  reduce: (
    previousState: GroundingProjectionState,
    event: EventEnvelope
  ): GroundingProjectionState => {
    switch (event.eventType) {
      case "grounding_submitted": {
        const payload = event.payload as GroundingSubmittedPayload;
        return {
          ...previousState,
          userId: event.userId,
          latestGrounding: {
            hasSubmission: true,
            submittedAt: event.occurredAt,
            loveTokens: [...payload.loveTokens],
            neutralTokens: [...payload.neutralTokens],
            avoidTokens: [...payload.avoidTokens],
          },
          latestSeed: { ...payload.seed },
          latestUserVector: { ...payload.userVector },
        };
      }
      case "legacy_state_mirrored":
        return previousState;
      default:
        return previousState;
    }
  },
};
