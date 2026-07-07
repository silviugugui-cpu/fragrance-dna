/**
 * Canonical Architecture v2
 * Phase 1 - Step 7
 *
 * Purpose:
 * Define BehaviorProjection contract for behavior-derived learning signals.
 */

import type { OlfactoryVector } from "@/lib/types";
import type { Projection, ProjectionStateBase } from "@/lib/intelligence/projections/types";
import { PROJECTION_EPOCH_ISO } from "@/lib/intelligence/projections/types";

export type BehaviorAttributeState = {
  canonicalAttributeId: string;
  likedCount: number;
  dislikedCount: number;
  ignoredCount: number;
  uncertainCount: number;
  evidenceCount: number;
  affinity: number;
  strength: number;
  confidence: number;
  explorationPriority: number;
  lastValue: number;
  lastFragranceId: string;
  lastUpdated: string;
  lastUpdatedAt: string;
};

export type BehaviorProjectionState = ProjectionStateBase & {
  userId: string;
  attributes: Record<string, BehaviorAttributeState>;
  behaviorVector: OlfactoryVector;
  confidence: {
    global: number;
    updates: number;
  };
};

const EMPTY_BEHAVIOR_VECTOR: OlfactoryVector = {
  freshness: 0,
  warmth: 0,
  sweetness: 0,
  darkness: 0,
  cleanliness: 0,
  elegance: 0,
};

export const BEHAVIOR_PROJECTION: Projection<BehaviorProjectionState> = {
  projectionName: "BehaviorProjection",
  schemaVersion: 1,
  projectionVersion: 1,
  buildInitialState: () => ({
    metadata: {
      projectionName: "BehaviorProjection",
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
    attributes: {},
    behaviorVector: { ...EMPTY_BEHAVIOR_VECTOR },
    confidence: {
      global: 0,
      updates: 0,
    },
  }),
};
