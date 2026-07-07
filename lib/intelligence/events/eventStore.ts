/**
 * Canonical Architecture v2
 * Phase 1 - Step 4
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 *
 * Purpose:
 * Define event store abstraction independent from concrete persistence technology.
 */

import type { EventRecord } from "@/lib/intelligence/events/eventRepository";

export interface EventStore {
  append(record: EventRecord): Promise<void>;
  getByIdempotencyKey(idempotencyKey: string): Promise<EventRecord | null>;
}

export class NoopEventStore implements EventStore {
  async append(_record: EventRecord): Promise<void> {
    return;
  }

  async getByIdempotencyKey(_idempotencyKey: string): Promise<EventRecord | null> {
    return null;
  }
}
