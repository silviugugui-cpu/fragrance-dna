/**
 * Canonical Architecture v2
 * Phase 1 - Step 3
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 * ADR-0003 Persistent User DNA
 *
 * Purpose:
 * Provide projection state bootstrap scaffolding.
 */

import {
  BEHAVIOR_PROJECTION,
  GROUNDING_PROJECTION,
  PROFILE_PROJECTION,
  TEST_PROJECTION,
  USER_PROJECTION,
} from "@/lib/intelligence/projections";
import type { ProjectionStateBase } from "@/lib/intelligence/projections";

export function buildPhase1InitialProjectionStates(): Record<string, ProjectionStateBase> {
  return {
    [USER_PROJECTION.projectionName]: USER_PROJECTION.buildInitialState(),
    [GROUNDING_PROJECTION.projectionName]: GROUNDING_PROJECTION.buildInitialState(),
    [TEST_PROJECTION.projectionName]: TEST_PROJECTION.buildInitialState(),
    [PROFILE_PROJECTION.projectionName]: PROFILE_PROJECTION.buildInitialState(),
    [BEHAVIOR_PROJECTION.projectionName]: BEHAVIOR_PROJECTION.buildInitialState(),
  };
}
