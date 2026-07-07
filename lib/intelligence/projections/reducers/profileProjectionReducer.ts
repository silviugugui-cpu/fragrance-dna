/**
 * Canonical Architecture v2
 * Phase 1 - Step 2
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 * ADR-0003 Persistent User DNA
 *
 * Purpose:
 * Provide replay-safe reducer skeleton for ProfileProjection.
 */

import type { EventEnvelope } from "@/lib/intelligence/events/types";
import type { ProfileProjectionState } from "@/lib/intelligence/projections/models/profileProjection";
import type { ProjectionReducer } from "@/lib/intelligence/projections/types";

export const PROFILE_PROJECTION_REDUCER: ProjectionReducer<ProfileProjectionState> = {
  projectionName: "ProfileProjection",
  reducerVersion: 1,
  supportedEvents: ["user_vector_updated", "grounding_submitted", "test_answer_submitted"],
  reduce: (
    previousState: ProfileProjectionState,
    event: EventEnvelope
  ): ProfileProjectionState => {
    switch (event.eventType) {
      case "user_vector_updated":
      case "grounding_submitted":
      case "test_answer_submitted":
        return previousState;
      default:
        return previousState;
    }
  },
};
