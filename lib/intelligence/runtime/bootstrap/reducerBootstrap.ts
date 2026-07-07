/**
 * Canonical Architecture v2
 * Phase 1 - Step 3
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 * ADR-0003 Persistent User DNA
 *
 * Purpose:
 * Provide reducer bootstrap scaffolding for registry registration.
 */

import { BEHAVIOR_PROJECTION_REDUCER } from "@/lib/intelligence/projections/reducers/behaviorProjectionReducer";
import { GROUNDING_PROJECTION_REDUCER } from "@/lib/intelligence/projections/reducers/groundingProjectionReducer";
import { PROFILE_PROJECTION_REDUCER } from "@/lib/intelligence/projections/reducers/profileProjectionReducer";
import { TEST_PROJECTION_REDUCER } from "@/lib/intelligence/projections/reducers/testProjectionReducer";
import { USER_PROJECTION_REDUCER } from "@/lib/intelligence/projections/reducers/userProjectionReducer";
import type { ProjectionRegistry } from "@/lib/intelligence/projections/types";

export function registerPhase1Reducers(registry: ProjectionRegistry): void {
  registry.registerReducer(USER_PROJECTION_REDUCER);
  registry.registerReducer(GROUNDING_PROJECTION_REDUCER);
  registry.registerReducer(TEST_PROJECTION_REDUCER);
  registry.registerReducer(PROFILE_PROJECTION_REDUCER);
  registry.registerReducer(BEHAVIOR_PROJECTION_REDUCER);
}
