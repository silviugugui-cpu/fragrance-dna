/**
 * Canonical Architecture v2
 * Phase 1 - Step 4
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 * ADR-0003 Persistent User DNA
 *
 * Purpose:
 * Create immutable canonical event envelopes for the event lifecycle pipeline.
 */

import { PHASE1_EVENT_CONTRACTS, type Phase1EventPayloadMap } from "@/lib/intelligence/events/contracts";
import { createEventEnvelope } from "@/lib/intelligence/events/envelope";
import { buildIdempotencyKey } from "@/lib/intelligence/events/idempotency";
import type { EngineComponentVersions, EventEnvelope, Phase1EventType } from "@/lib/intelligence/events/types";

type CreateCanonicalEventInput<TEventType extends Phase1EventType> = {
  eventId: string;
  eventType: TEventType;
  userId: string;
  payload: Phase1EventPayloadMap[TEventType];
  actionId: string;
  producer: string;
  engineVersions: EngineComponentVersions;
  sessionId?: string;
  context?: Record<string, unknown>;
  correlationId?: string;
  causationId?: string;
  occurredAt?: string;
};

export function createCanonicalEvent<TEventType extends Phase1EventType>(
  input: CreateCanonicalEventInput<TEventType>
): EventEnvelope<Phase1EventPayloadMap[TEventType]> {
  const version = PHASE1_EVENT_CONTRACTS[input.eventType];
  const idempotencyKey = buildIdempotencyKey({
    userId: input.userId,
    eventType: input.eventType,
    actionId: input.actionId,
    sessionId: input.sessionId,
  });

  const event = createEventEnvelope({
    eventId: input.eventId,
    eventType: input.eventType,
    eventVersion: version,
    userId: input.userId,
    sessionId: input.sessionId,
    payload: input.payload,
    idempotencyKey,
    producer: input.producer,
    engineVersions: input.engineVersions,
    context: input.context,
    correlationId: input.correlationId,
    causationId: input.causationId,
    occurredAt: input.occurredAt,
  });

  return deepFreeze(event);
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== "object") {
    return value;
  }

  const objectValue = value as Record<string, unknown>;
  for (const key of Object.keys(objectValue)) {
    const child = objectValue[key];
    if (child && typeof child === "object") {
      deepFreeze(child);
    }
  }

  return Object.freeze(value);
}
