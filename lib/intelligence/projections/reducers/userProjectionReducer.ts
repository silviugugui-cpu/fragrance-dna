/**
 * Canonical Architecture v2
 * Phase 1 - Step 2
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 * ADR-0003 Persistent User DNA
 *
 * Purpose:
 * Provide replay-safe reducer skeleton for UserProjection.
 */

import type { EventEnvelope } from "@/lib/intelligence/events/types";
import type { ProjectionReducer } from "@/lib/intelligence/projections/types";
import type { UserProjectionState } from "@/lib/intelligence/projections/models/userProjection";

export const USER_PROJECTION_REDUCER: ProjectionReducer<UserProjectionState> = {
  projectionName: "UserProjection",
  reducerVersion: 1,
  supportedEvents: [
    "grounding_submitted",
    "test_answer_submitted",
    "dna_session_checkpointed",
    "user_vector_updated",
    "legacy_state_mirrored",
  ],
  reduce: (previousState: UserProjectionState, event: EventEnvelope): UserProjectionState => {
    switch (event.eventType) {
      case "grounding_submitted":
      case "test_answer_submitted":
      case "dna_session_checkpointed":
      case "user_vector_updated":
      case "legacy_state_mirrored":
        return previousState;
      default:
        return previousState;
    }
  },
};
