/**
 * Canonical Architecture v2
 * Phase 1 - Step 2
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 * ADR-0003 Persistent User DNA
 *
 * Purpose:
 * Provide version-aware reducer registry for projection discovery and event mapping.
 */

import type { Phase1EventType } from "@/lib/intelligence/events/types";
import type {
  ProjectionReducer,
  ProjectionReducerDescriptor,
  ProjectionRegistry,
  ProjectionStateBase,
} from "@/lib/intelligence/projections/types";

type AnyProjectionReducer = ProjectionReducer<ProjectionStateBase>;

export class InMemoryProjectionRegistry implements ProjectionRegistry {
  private readonly reducersByEventType = new Map<
    Phase1EventType,
    Array<AnyProjectionReducer>
  >();

  private readonly reducersByProjectionName = new Map<
    string,
    Array<AnyProjectionReducer>
  >();

  registerReducer<TState extends ProjectionStateBase>(
    reducer: ProjectionReducer<TState>
  ): void {
    const typedReducer = reducer as unknown as AnyProjectionReducer;

    for (const eventType of reducer.supportedEvents) {
      const existing = this.reducersByEventType.get(eventType) ?? [];
      this.reducersByEventType.set(eventType, [...existing, typedReducer]);
    }

    const projectionExisting = this.reducersByProjectionName.get(reducer.projectionName) ?? [];
    this.reducersByProjectionName.set(reducer.projectionName, [...projectionExisting, typedReducer]);
  }

  getReducersForEvent(
    eventType: Phase1EventType
  ): ReadonlyArray<AnyProjectionReducer> {
    return this.reducersByEventType.get(eventType) ?? [];
  }

  getReducersForProjection(
    projectionName: string
  ): ReadonlyArray<AnyProjectionReducer> {
    return this.reducersByProjectionName.get(projectionName) ?? [];
  }

  listReducers(): ReadonlyArray<ProjectionReducerDescriptor> {
    const descriptors: ProjectionReducerDescriptor[] = [];

    for (const reducers of this.reducersByProjectionName.values()) {
      for (const reducer of reducers) {
        descriptors.push({
          projectionName: reducer.projectionName,
          reducerVersion: reducer.reducerVersion,
          supportedEvents: reducer.supportedEvents,
        });
      }
    }

    return descriptors;
  }
}
