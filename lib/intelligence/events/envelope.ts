import type { EngineComponentVersions, EventEnvelope, Phase1EventType } from "@/lib/intelligence/events/types";

type CreateEnvelopeInput<TPayload extends object> = {
  eventType: Phase1EventType;
  eventVersion?: number;
  eventId: string;
  userId: string;
  sessionId?: string;
  payload: TPayload;
  idempotencyKey: string;
  producer: string;
  engineVersions: EngineComponentVersions;
  context?: Record<string, unknown>;
  correlationId?: string;
  causationId?: string;
  occurredAt?: string;
};

export function createEventEnvelope<TPayload extends object>(
  input: CreateEnvelopeInput<TPayload>
): EventEnvelope<TPayload> {
  const nowIso = new Date().toISOString();

  return {
    eventId: input.eventId,
    eventType: input.eventType,
    eventVersion: input.eventVersion ?? 1,
    userId: input.userId,
    sessionId: input.sessionId,
    occurredAt: input.occurredAt ?? nowIso,
    receivedAt: nowIso,
    payload: input.payload,
    context: input.context,
    engineVersions: input.engineVersions,
    correlationId: input.correlationId,
    causationId: input.causationId,
    idempotencyKey: input.idempotencyKey,
    producer: input.producer,
  };
}

export function assertEventEnvelope(envelope: EventEnvelope): void {
  if (!envelope.eventId) {
    throw new Error("Missing eventId");
  }

  if (!envelope.userId) {
    throw new Error("Missing userId");
  }

  if (!envelope.eventType) {
    throw new Error("Missing eventType");
  }

  if (!envelope.idempotencyKey) {
    throw new Error("Missing idempotencyKey");
  }

  if (!envelope.producer) {
    throw new Error("Missing producer");
  }

  if (!envelope.engineVersions) {
    throw new Error("Missing engineVersions");
  }

  if (envelope.eventVersion < 1) {
    throw new Error("Invalid eventVersion");
  }
}
