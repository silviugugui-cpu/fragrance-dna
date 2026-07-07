/**
 * Canonical Architecture v2
 * Phase 1 - Step 4
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 * ADR-0003 Persistent User DNA
 *
 * Purpose:
 * Implement canonical event lifecycle pipeline: create, validate, serialize, persist, publish.
 */

import { createCanonicalEvent } from "@/lib/intelligence/events/eventFactory";
import type { EventPublishingPipeline } from "@/lib/intelligence/events/eventPublishingPipeline";
import type { EventRepository } from "@/lib/intelligence/events/eventRepository";
import { toEventRecord } from "@/lib/intelligence/events/eventRepository";
import { serializeEventDeterministically } from "@/lib/intelligence/events/eventSerializer";
import { validateCanonicalEvent } from "@/lib/intelligence/events/eventValidator";
import type { Phase1EventPayloadMap } from "@/lib/intelligence/events/contracts";
import type { EngineComponentVersions, Phase1EventType } from "@/lib/intelligence/events/types";

export type WriteEventInput<TEventType extends Phase1EventType> = {
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

export type WriteEventResult = {
  persisted: boolean;
  published: boolean;
  validationErrors: string[];
  reusedExistingIdempotencyRecord: boolean;
  eventId?: string;
};

export class EventWriter {
  constructor(
    private readonly repository: EventRepository,
    private readonly publishingPipeline: EventPublishingPipeline
  ) {}

  async write<TEventType extends Phase1EventType>(
    input: WriteEventInput<TEventType>
  ): Promise<WriteEventResult> {
    const event = createCanonicalEvent(input);

    const validation = validateCanonicalEvent(event);
    if (!validation.valid) {
      return {
        persisted: false,
        published: false,
        validationErrors: validation.errors,
        reusedExistingIdempotencyRecord: false,
      };
    }

    const existing = await this.repository.findByIdempotencyKey(event.idempotencyKey);
    if (existing) {
      return {
        persisted: true,
        published: false,
        validationErrors: [],
        reusedExistingIdempotencyRecord: true,
        eventId: existing.eventId,
      };
    }

    const serializedEnvelope = serializeEventDeterministically(event);
    const record = toEventRecord(event, serializedEnvelope);

    await this.repository.save(record);
    await this.publishingPipeline.publish(event);

    return {
      persisted: true,
      published: true,
      validationErrors: [],
      reusedExistingIdempotencyRecord: false,
      eventId: event.eventId,
    };
  }
}
