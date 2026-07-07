/**
 * Canonical Architecture v2
 * Phase 1 - Step 2
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 * ADR-0003 Persistent User DNA
 *
 * Purpose:
 * Provide replay engine skeleton for deterministic projection rebuild from ordered events.
 */

import type { EventEnvelope } from "@/lib/intelligence/events/types";
import { validateEventsAreReplayOrdered } from "@/lib/intelligence/events/ordering";
import type {
  ProjectionReducer,
  ProjectionStateBase,
  ProjectionRegistry,
} from "@/lib/intelligence/projections/types";

export type ReplayProgress = {
  totalEvents: number;
  processedEvents: number;
  lastProcessedEventId?: string;
};

export type ReplayResult = {
  projectionStates: Record<string, ProjectionStateBase>;
  progress: ReplayProgress;
};

export type ReplayInput = {
  events: EventEnvelope[];
  initialStates: Record<string, ProjectionStateBase>;
  registry: ProjectionRegistry;
};

export function replayProjectionStates(input: ReplayInput): ReplayResult {
  validateReplayOrder(input.events);

  const projectionStates: Record<string, ProjectionStateBase> = {
    ...input.initialStates,
  };

  let processedEvents = 0;
  let lastProcessedEventId: string | undefined;

  for (const event of input.events) {
    const reducers = input.registry.getReducersForEvent(event.eventType);

    for (const reducer of reducers) {
      const currentState = projectionStates[reducer.projectionName];
      if (!currentState) {
        continue;
      }

      const reduced = applyReducer(reducer, currentState, event);

      projectionStates[reducer.projectionName] = {
        ...reduced,
        metadata: {
          ...reduced.metadata,
          lastEventId: event.eventId,
          lastSequence: processedEvents + 1,
          rebuiltAt: event.receivedAt,
          updatedAt: event.receivedAt,
        },
      };
    }

    processedEvents += 1;
    lastProcessedEventId = event.eventId;
  }

  return {
    projectionStates,
    progress: {
      totalEvents: input.events.length,
      processedEvents,
      lastProcessedEventId,
    },
  };
}

export function validateReplayOrder(events: EventEnvelope[]): void {
  validateEventsAreReplayOrdered(events);
}

function applyReducer(
  reducer: ProjectionReducer<ProjectionStateBase>,
  currentState: ProjectionStateBase,
  event: EventEnvelope
): ProjectionStateBase {
  return reducer.reduce(currentState, event);
}
