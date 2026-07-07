/**
 * Canonical Architecture v2
 * Phase 1 - Step 3
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 *
 * Purpose:
 * Define event publisher abstraction for future ingestion and dispatch pipelines.
 */

import type { EventEnvelope } from "@/lib/intelligence/events/types";
import type { EventBus } from "@/lib/intelligence/runtime/eventBus";

export interface EventPublisher {
  publish(event: EventEnvelope): Promise<void>;
}

export class BusBackedEventPublisher implements EventPublisher {
  constructor(private readonly bus: EventBus) {}

  async publish(event: EventEnvelope): Promise<void> {
    await this.bus.publish(event);
  }
}
