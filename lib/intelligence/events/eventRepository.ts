/**
 * Canonical Architecture v2
 * Phase 1 - Step 4
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 *
 * Purpose:
 * Define event repository abstraction for canonical event persistence lifecycle.
 */

import type { EventEnvelope } from "@/lib/intelligence/events/types";

export type EventRecord = {
  eventId: string;
  eventType: string;
  eventVersion: number;
  idempotencyKey: string;
  userId: string;
  occurredAt: string;
  receivedAt: string;
  serializedEnvelope: string;
};

export interface EventRepository {
  save(record: EventRecord): Promise<void>;
  findByIdempotencyKey(idempotencyKey: string): Promise<EventRecord | null>;
}

export class NoopEventRepository implements EventRepository {
  async save(_record: EventRecord): Promise<void> {
    return;
  }

  async findByIdempotencyKey(_idempotencyKey: string): Promise<EventRecord | null> {
    return null;
  }
}

export function toEventRecord(event: EventEnvelope, serializedEnvelope: string): EventRecord {
  return {
    eventId: event.eventId,
    eventType: event.eventType,
    eventVersion: event.eventVersion,
    idempotencyKey: event.idempotencyKey,
    userId: event.userId,
    occurredAt: event.occurredAt,
    receivedAt: event.receivedAt,
    serializedEnvelope,
  };
}
