/**
 * Canonical Architecture v2
 * Phase 1 - Step 2
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 * ADR-0003 Persistent User DNA
 *
 * Purpose:
 * Define canonical projection contracts for replay-safe projection infrastructure.
 */

import type { EventEnvelope, Phase1EventType } from "@/lib/intelligence/events/types";

export const PROJECTION_EPOCH_ISO = "1970-01-01T00:00:00.000Z";

export type ProjectionMetadata = {
  projectionName: string;
  schemaVersion: number;
  projectionVersion: number;
  stateVersion: number;
  lastEventId?: string;
  lastSequence: number;
  rebuiltAt: string;
  checksum?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectionStateBase = {
  metadata: ProjectionMetadata;
};

export type Projection<TState extends ProjectionStateBase> = {
  projectionName: string;
  schemaVersion: number;
  projectionVersion: number;
  buildInitialState: () => TState;
};

export type ProjectionReducer<TState extends ProjectionStateBase> = {
  projectionName: string;
  reducerVersion: number;
  supportedEvents: readonly Phase1EventType[];
  reduce: (previousState: TState, event: EventEnvelope) => TState;
};

export type ProjectionReducerDescriptor = {
  projectionName: string;
  reducerVersion: number;
  supportedEvents: readonly Phase1EventType[];
};

export type ProjectionRegistry = {
  registerReducer: <TState extends ProjectionStateBase>(
    reducer: ProjectionReducer<TState>
  ) => void;
  getReducersForEvent: (eventType: Phase1EventType) => ReadonlyArray<ProjectionReducer<ProjectionStateBase>>;
  getReducersForProjection: (
    projectionName: string
  ) => ReadonlyArray<ProjectionReducer<ProjectionStateBase>>;
  listReducers: () => ReadonlyArray<ProjectionReducerDescriptor>;
};
