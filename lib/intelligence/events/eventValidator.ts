/**
 * Canonical Architecture v2
 * Phase 1 - Step 4
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 *
 * Purpose:
 * Validate canonical event envelopes for schema compatibility and idempotency consistency.
 */

import { PHASE1_EVENT_CONTRACTS } from "@/lib/intelligence/events/contracts";
import { assertEventEnvelope } from "@/lib/intelligence/events/envelope";
import type { EventEnvelope } from "@/lib/intelligence/events/types";

export type EventValidationResult = {
  valid: boolean;
  errors: string[];
};

export function validateCanonicalEvent(event: EventEnvelope): EventValidationResult {
  const errors: string[] = [];

  try {
    assertEventEnvelope(event);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Envelope assertion failed");
  }

  const supportedVersion = PHASE1_EVENT_CONTRACTS[event.eventType];
  if (!supportedVersion) {
    errors.push("Unknown eventType for current contracts");
  }

  if (event.eventVersion < 1) {
    errors.push("Event version must be >= 1");
  }

  if (event.eventVersion > supportedVersion) {
    errors.push("Event version is not compatible with current contract version");
  }

  if (!event.idempotencyKey.startsWith(`${event.userId}:${event.eventType}:`)) {
    errors.push("Idempotency key is not compatible with canonical key strategy");
  }

  if (!isIsoDateString(event.occurredAt)) {
    errors.push("occurredAt must be a valid ISO timestamp");
  }

  if (!isIsoDateString(event.receivedAt)) {
    errors.push("receivedAt must be a valid ISO timestamp");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function isIsoDateString(value: string): boolean {
  const parsed = Date.parse(value);
  return !Number.isNaN(parsed);
}
