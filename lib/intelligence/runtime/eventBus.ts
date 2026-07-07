/**
 * Canonical Architecture v2
 * Phase 1 - Step 3
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 *
 * Purpose:
 * Define in-memory event bus abstraction for infrastructure-level dispatch orchestration.
 */

import type { EventEnvelope } from "@/lib/intelligence/events/types";

export type EventHandler = (event: EventEnvelope) => Promise<void> | void;

export interface EventBus {
  publish(event: EventEnvelope): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): () => void;
}

export class InMemoryEventBus implements EventBus {
  private readonly handlers = new Map<string, EventHandler[]>();

  async publish(event: EventEnvelope): Promise<void> {
    const matchingHandlers = this.handlers.get(event.eventType) ?? [];

    for (const handler of matchingHandlers) {
      await handler(event);
    }
  }

  subscribe(eventType: string, handler: EventHandler): () => void {
    const existing = this.handlers.get(eventType) ?? [];
    this.handlers.set(eventType, [...existing, handler]);

    return () => {
      const latest = this.handlers.get(eventType) ?? [];
      this.handlers.set(
        eventType,
        latest.filter((candidate) => candidate !== handler)
      );
    };
  }
}
