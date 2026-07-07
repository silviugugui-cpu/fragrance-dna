/**
 * Canonical Architecture v2
 * Phase 1 - Step 2
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 * ADR-0003 Persistent User DNA
 *
 * Purpose:
 * Define GroundingProjection contract scaffolding for declared preference inputs.
 */

import type { Projection, ProjectionStateBase } from "@/lib/intelligence/projections/types";
import { PROJECTION_EPOCH_ISO } from "@/lib/intelligence/projections/types";

export type GroundingProjectionState = ProjectionStateBase & {
  userId: string;
  latestGrounding: {
    hasSubmission: boolean;
    submittedAt: string;
    loveTokens: string[];
    neutralTokens: string[];
    avoidTokens: string[];
  };
  latestSeed: Record<string, unknown>;
  latestUserVector: Record<string, number>;
};

export const GROUNDING_PROJECTION: Projection<GroundingProjectionState> = {
  projectionName: "GroundingProjection",
  schemaVersion: 1,
  projectionVersion: 1,
  buildInitialState: () => ({
    metadata: {
      projectionName: "GroundingProjection",
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
    latestGrounding: {
      hasSubmission: false,
      submittedAt: PROJECTION_EPOCH_ISO,
      loveTokens: [],
      neutralTokens: [],
      avoidTokens: [],
    },
    latestSeed: {},
    latestUserVector: {},
  }),
};
