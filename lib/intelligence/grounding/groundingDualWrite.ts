/**
 * Canonical Architecture v2
 * Phase 1 - Step 5
 *
 * Purpose:
 * Execute Grounding dual-write in parallel to legacy persistence and run
 * projection parity validation in shadow mode.
 */

import { buildActionId, EventWriter } from "@/lib/intelligence/events";
import {
  NoopEventPublishingPipeline,
  type EventPublishingPipeline,
} from "@/lib/intelligence/events/eventPublishingPipeline";
import { type EventRecord, type EventRepository } from "@/lib/intelligence/events/eventRepository";
import type { EventEnvelope, GroundingSubmittedPayload } from "@/lib/intelligence/events/types";
import type { Phase1FeatureFlags } from "@/lib/intelligence/flags/phase1Flags";
import { buildPhase1InitialProjectionStates } from "@/lib/intelligence/runtime/bootstrap/projectionBootstrap";
import { registerPhase1Reducers } from "@/lib/intelligence/runtime/bootstrap/reducerBootstrap";
import {
  type GroundingProjectionState,
  InMemoryProjectionRegistry,
  replayProjectionStates,
} from "@/lib/intelligence/projections";
import {
  validateGroundingParity,
  type GroundingParityLegacyState,
  type GroundingParityProjectionState,
} from "@/lib/intelligence/runtime/shadow/shadowValidation";

type GroundingEngineInput = {
  love: string[];
  neutral: string[];
  red_flag: string[];
};

export type GroundingDualWriteInput = {
  userId: string;
  sessionId?: string;
  engineInput: GroundingEngineInput;
  seed: Record<string, unknown>;
  userVector: Record<string, number>;
  flags: Phase1FeatureFlags;
};

export type GroundingDualWriteResult = {
  attempted: boolean;
  persisted: boolean;
  published: boolean;
  parityValidated: boolean;
  parityMatches: boolean;
  eventId?: string;
  reusedIdempotency: boolean;
  errors: string[];
  differences: string[];
};

type CapturingPublishingPipeline = EventPublishingPipeline & {
  publishedEvents: EventEnvelope[];
};

export async function runGroundingDualWrite(
  input: GroundingDualWriteInput
): Promise<GroundingDualWriteResult> {
  if (!input.flags.eventsWriteEnabled) {
    return {
      attempted: false,
      persisted: false,
      published: false,
      parityValidated: false,
      parityMatches: false,
      reusedIdempotency: false,
      errors: [],
      differences: [],
    };
  }

  const repository = new InMemoryEventRepository();
  const publishingPipeline = createCapturingPublishingPipeline();
  const writer = new EventWriter(repository, publishingPipeline);

  const eventId = buildEventId();
  const writeResult = await writer.write({
    eventId,
    eventType: "grounding_submitted",
    userId: input.userId,
    sessionId: input.sessionId,
    actionId: buildActionId("grounding", eventId),
    producer: "app/grounding:step5-dual-write",
    payload: buildGroundingPayload(input),
    engineVersions: {
      groundingModel: "v2-step5-shadow",
      dnaModel: "v2-step5-shadow",
      confidenceModel: "v2-step5-shadow",
      projectionModel: "v2-step5-shadow",
      clientSchema: "v2-step5-shadow",
    },
    context: {
      source: "grounding-finish",
      mode: "dual-write",
    },
  });

  const errors = [...writeResult.validationErrors];

  if (!writeResult.persisted && input.flags.eventsWriteRequired) {
    errors.push("Event write failed while eventsWriteRequired=true");
  }

  if (!writeResult.persisted || !input.flags.phase1ShadowValidation) {
    return {
      attempted: true,
      persisted: writeResult.persisted,
      published: writeResult.published,
      parityValidated: false,
      parityMatches: false,
      eventId: writeResult.eventId,
      reusedIdempotency: writeResult.reusedExistingIdempotencyRecord,
      errors,
      differences: [],
    };
  }

  const replayEvents = collectReplayEvents(repository, publishingPipeline.publishedEvents);
  const projectionRegistry = new InMemoryProjectionRegistry();
  registerPhase1Reducers(projectionRegistry);

  const replayResult = replayProjectionStates({
    events: replayEvents,
    initialStates: buildPhase1InitialProjectionStates(),
    registry: projectionRegistry,
  });

  const groundingProjection = replayResult.projectionStates["GroundingProjection"] as
    | GroundingProjectionState
    | undefined;

  const parity = validateGroundingParity(
    buildLegacyParityState(input),
    toParityProjectionState(groundingProjection)
  );

  return {
    attempted: true,
    persisted: writeResult.persisted,
    published: writeResult.published,
    parityValidated: true,
    parityMatches: parity.matches,
    eventId: writeResult.eventId,
    reusedIdempotency: writeResult.reusedExistingIdempotencyRecord,
    errors,
    differences: parity.differences,
  };
}

function buildGroundingPayload(input: GroundingDualWriteInput): GroundingSubmittedPayload {
  return {
    loveTokens: [...input.engineInput.love],
    neutralTokens: [...input.engineInput.neutral],
    avoidTokens: [...input.engineInput.red_flag],
    seed: input.seed,
    userVector: input.userVector,
  };
}

function buildLegacyParityState(input: GroundingDualWriteInput): GroundingParityLegacyState {
  return {
    hasSubmission: true,
    loveTokens: [...input.engineInput.love],
    neutralTokens: [...input.engineInput.neutral],
    avoidTokens: [...input.engineInput.red_flag],
    userVector: input.userVector,
  };
}

function toParityProjectionState(
  projection: GroundingProjectionState | undefined
): GroundingParityProjectionState {
  if (!projection) {
    return {
      hasSubmission: false,
      loveTokens: [],
      neutralTokens: [],
      avoidTokens: [],
      userVector: {},
    };
  }

  return {
    hasSubmission: projection.latestGrounding.hasSubmission,
    loveTokens: projection.latestGrounding.loveTokens,
    neutralTokens: projection.latestGrounding.neutralTokens,
    avoidTokens: projection.latestGrounding.avoidTokens,
    userVector: projection.latestUserVector,
  };
}

function createCapturingPublishingPipeline(): CapturingPublishingPipeline {
  const noop = new NoopEventPublishingPipeline();
  const publishedEvents: EventEnvelope[] = [];

  return {
    publishedEvents,
    async publish(event: EventEnvelope): Promise<void> {
      publishedEvents.push(event);
      await noop.publish(event);
    },
  };
}

function collectReplayEvents(
  repository: InMemoryEventRepository,
  publishedEvents: EventEnvelope[]
): EventEnvelope[] {
  if (publishedEvents.length > 0) {
    return [...publishedEvents];
  }

  return repository.list().map((record) => JSON.parse(record.serializedEnvelope) as EventEnvelope);
}

function buildEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

class InMemoryEventRepository implements EventRepository {
  private readonly byIdempotencyKey = new Map<string, EventRecord>();
  private readonly records: EventRecord[] = [];

  async save(record: EventRecord): Promise<void> {
    this.byIdempotencyKey.set(record.idempotencyKey, record);
    this.records.push(record);
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<EventRecord | null> {
    return this.byIdempotencyKey.get(idempotencyKey) ?? null;
  }

  list(): EventRecord[] {
    return [...this.records];
  }
}
