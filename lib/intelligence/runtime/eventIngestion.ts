/**
 * Canonical Architecture v2
 * Phase 1 - Step 3
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 *
 * Purpose:
 * Define event ingestion interface and no-op implementation scaffold.
 */

import type { EventEnvelope } from "@/lib/intelligence/events/types";

export type IngestionResult = {
  accepted: boolean;
  reason?: string;
};

export interface EventIngestion {
  ingest(event: EventEnvelope): Promise<IngestionResult>;
}

export class NoopEventIngestion implements EventIngestion {
  async ingest(_event: EventEnvelope): Promise<IngestionResult> {
    return {
      accepted: true,
    };
  }
}
