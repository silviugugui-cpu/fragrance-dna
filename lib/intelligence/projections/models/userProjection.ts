/**
 * Canonical Architecture v2
 * Phase 1 - Step 2
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 * ADR-0003 Persistent User DNA
 *
 * Purpose:
 * Define UserProjection contract scaffolding for future persistent user intelligence views.
 */

import type { Projection, ProjectionStateBase } from "@/lib/intelligence/projections/types";
import { PROJECTION_EPOCH_ISO } from "@/lib/intelligence/projections/types";

export type UserProjectionState = ProjectionStateBase & {
  userId: string;
  identity: {
    isAuthenticated: boolean;
  };
};

export const USER_PROJECTION: Projection<UserProjectionState> = {
  projectionName: "UserProjection",
  schemaVersion: 1,
  projectionVersion: 1,
  buildInitialState: () => ({
    metadata: {
      projectionName: "UserProjection",
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
    identity: {
      isAuthenticated: false,
    },
  }),
};
