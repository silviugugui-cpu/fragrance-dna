/**
 * Canonical Architecture v2
 * Phase 1 - Step 4
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 *
 * Purpose:
 * Define publishing pipeline abstraction for post-persist event publication.
 */

import type { EventEnvelope } from "@/lib/intelligence/events/types";

export interface EventPublishingPipeline {
  publish(event: EventEnvelope): Promise<void>;
}

export class NoopEventPublishingPipeline implements EventPublishingPipeline {
  async publish(_event: EventEnvelope): Promise<void> {
    return;
  }
}
