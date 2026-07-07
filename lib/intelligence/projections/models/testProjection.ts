/**
 * Canonical Architecture v2
 * Phase 1 - Step 2
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 * ADR-0004 Test Engine v2
 *
 * Purpose:
 * Define TestProjection contract scaffolding for learning session progression state.
 */

import type { Projection, ProjectionStateBase } from "@/lib/intelligence/projections/types";
import { PROJECTION_EPOCH_ISO } from "@/lib/intelligence/projections/types";

export type TestProjectionState = ProjectionStateBase & {
  userId: string;
  sessionId: string;
  latestAnswer: {
    fragranceId: string;
    answerDimensions: Record<string, number>;
  };
  progress: {
    currentIndex: number;
    answeredCount: number;
    answeredOrder: string[];
    lastUpdatedAt: string;
  };
  currentVector: Record<string, number>;
  confidenceEstimate: number;
};

export const TEST_PROJECTION: Projection<TestProjectionState> = {
  projectionName: "TestProjection",
  schemaVersion: 1,
  projectionVersion: 1,
  buildInitialState: () => ({
    metadata: {
      projectionName: "TestProjection",
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
    sessionId: "",
    latestAnswer: {
      fragranceId: "",
      answerDimensions: {},
    },
    progress: {
      currentIndex: 0,
      answeredCount: 0,
      answeredOrder: [],
      lastUpdatedAt: PROJECTION_EPOCH_ISO,
    },
    currentVector: {},
    confidenceEstimate: 0,
  }),
};
