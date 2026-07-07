/**
 * Canonical Architecture v2
 * Phase 1 - Step 3
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 * ADR-0003 Persistent User DNA
 *
 * Purpose:
 * Define deterministic canonical event ordering for replay and projection rebuild.
 */

import type { EventEnvelope } from "@/lib/intelligence/events/types";

export function compareEventsForReplay(left: EventEnvelope, right: EventEnvelope): number {
  const occurredCompare = compareIsoAsc(left.occurredAt, right.occurredAt);
  if (occurredCompare !== 0) {
    return occurredCompare;
  }

  const receivedCompare = compareIsoAsc(left.receivedAt, right.receivedAt);
  if (receivedCompare !== 0) {
    return receivedCompare;
  }

  if (left.eventId === right.eventId) {
    throw new Error("Duplicate eventId detected in replay stream");
  }

  return left.eventId.localeCompare(right.eventId);
}

export function validateEventsAreReplayOrdered(events: EventEnvelope[]): void {
  for (let index = 1; index < events.length; index += 1) {
    const previous = events[index - 1];
    const current = events[index];

    if (compareEventsForReplay(previous, current) > 0) {
      throw new Error("Replay stream violates canonical event ordering contract");
    }
  }
}

function compareIsoAsc(leftIso: string, rightIso: string): number {
  const leftTime = Date.parse(leftIso);
  const rightTime = Date.parse(rightIso);

  if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
    throw new Error("Invalid ISO timestamp in event ordering comparison");
  }

  if (leftTime < rightTime) {
    return -1;
  }

  if (leftTime > rightTime) {
    return 1;
  }

  return 0;
}
