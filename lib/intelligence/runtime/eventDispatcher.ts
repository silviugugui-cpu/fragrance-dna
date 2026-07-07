/**
 * Canonical Architecture v2
 * Phase 1 - Step 3
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 *
 * Purpose:
 * Define dispatcher scaffold orchestrating publisher and ingestion abstractions.
 */

import type { EventEnvelope } from "@/lib/intelligence/events/types";
import type { EventIngestion, IngestionResult } from "@/lib/intelligence/runtime/eventIngestion";
import type { EventPublisher } from "@/lib/intelligence/runtime/eventPublisher";

export interface EventDispatcher {
  dispatch(event: EventEnvelope): Promise<IngestionResult>;
}

export class DefaultEventDispatcher implements EventDispatcher {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly ingestion: EventIngestion
  ) {}

  async dispatch(event: EventEnvelope): Promise<IngestionResult> {
    const ingestionResult = await this.ingestion.ingest(event);

    if (!ingestionResult.accepted) {
      return ingestionResult;
    }

    await this.publisher.publish(event);
    return ingestionResult;
  }
}
