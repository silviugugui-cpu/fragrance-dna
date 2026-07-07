/**
 * Canonical Architecture v2
 * Phase 1 - Step 2
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 * ADR-0003 Persistent User DNA
 *
 * Purpose:
 * Define ProfileProjection contract scaffolding for current profile and confidence shape.
 */

import type { Projection, ProjectionStateBase } from "@/lib/intelligence/projections/types";
import { PROJECTION_EPOCH_ISO } from "@/lib/intelligence/projections/types";

export type ProfileProjectionState = ProjectionStateBase & {
  userId: string;
  dna: {
    hasCurrentVector: boolean;
  };
  confidence: {
    global: number;
  };
};

export const PROFILE_PROJECTION: Projection<ProfileProjectionState> = {
  projectionName: "ProfileProjection",
  schemaVersion: 1,
  projectionVersion: 1,
  buildInitialState: () => ({
    metadata: {
      projectionName: "ProfileProjection",
      schemaVersion: 1,
      projectionVersion: 1,
      stateVersion: 1,
      lastEventId: undefined,
      lastSequence: 0,
      rebuiltAt: PROJECTION_EPOCH_ISO,
      checksum: undefined,
      createdAt: PROJECTION_EPOCH_ISO,
      updatedAt: PROJECTION_EPOCH_ISO,
    },
    userId: "",
    dna: {
      hasCurrentVector: false,
    },
    confidence: {
      global: 0,
    },
  }),
};
