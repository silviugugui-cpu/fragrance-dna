import {
  buildActionId,
  compareEventsForReplay,
  createFailedEvent,
  EventWriter,
  NoopDeadLetterQueue,
  NoopFailedEventRepository,
  type DeadLetterQueue,
  type FailedEventRepository,
  type EventEnvelope,
} from "@/lib/intelligence/events";
import { NoopEventPublishingPipeline, type EventPublishingPipeline } from "@/lib/intelligence/events/eventPublishingPipeline";
import { type EventRecord, type EventRepository } from "@/lib/intelligence/events/eventRepository";
import type {
  AttributeBehaviorSignalPayload,
  CollectionEvaluationSubmittedPayload,
  DnaSessionCheckpointedPayload,
  PreferenceStrengthChangedPayload,
  TestAnswerSubmittedPayload,
} from "@/lib/intelligence/events/types";
import type { Phase1FeatureFlags } from "@/lib/intelligence/flags/phase1Flags";
import { createDefaultEventMetrics, type EventMetricsSnapshot } from "@/lib/intelligence/metrics";
import {
  type TestProjectionState,
  InMemoryProjectionRegistry,
  replayProjectionStates,
} from "@/lib/intelligence/projections";
import { buildPhase1InitialProjectionStates } from "@/lib/intelligence/runtime/bootstrap/projectionBootstrap";
import { registerPhase1Reducers } from "@/lib/intelligence/runtime/bootstrap/reducerBootstrap";
import {
  type TestParityLegacyState,
  type TestParityProjectionState,
  validateTestParity,
} from "@/lib/intelligence/runtime/shadow/shadowValidation";
import {
  buildCanonicalBehaviorEventInputs,
  type CanonicalBehaviorEventType,
  type CanonicalEvaluationSource,
} from "@/lib/intelligence/evaluation/canonicalEvaluationEngine";

export type CanonicalEvaluationWriteResult = {
  attempted: boolean;
  persisted: boolean;
  published: boolean;
  parityValidated: boolean;
  parityMatches: boolean;
  eventIds: string[];
  errors: string[];
  differences: string[];
  metrics: EventMetricsSnapshot;
};

export type CanonicalEvaluationWriteInput = {
  userId: string;
  sessionId?: string;
  fragranceId: string;
  answerDimensions: Record<string, number>;
  flags: Phase1FeatureFlags;
  source: CanonicalEvaluationSource;
  producer: string;
  submission: {
    eventType: "test_answer_submitted" | "collection_evaluation_submitted";
    payload: TestAnswerSubmittedPayload | CollectionEvaluationSubmittedPayload;
    contextSource: "test-next" | "collection-reinforcement";
  };
  checkpoint?: {
    payload: DnaSessionCheckpointedPayload;
  };
  parity?: {
    enabled: boolean;
    legacyState: TestParityLegacyState;
  };
  engineVersionLabel: string;
};

type CapturingPublishingPipeline = EventPublishingPipeline & {
  publishedEvents: EventEnvelope[];
};

export async function runCanonicalEvaluationWrite(
  input: CanonicalEvaluationWriteInput
): Promise<CanonicalEvaluationWriteResult> {
  const metrics = createDefaultEventMetrics();

  if (!input.flags.eventsWriteEnabled) {
    return {
      attempted: false,
      persisted: false,
      published: false,
      parityValidated: false,
      parityMatches: false,
      eventIds: [],
      errors: [],
      differences: [],
      metrics: metrics.getSnapshot(),
    };
  }

  const repository = new InMemoryEventRepository();
  const publishingPipeline = createCapturingPublishingPipeline();
  const writer = new EventWriter(repository, publishingPipeline);
  const deadLetterRepository = new NoopFailedEventRepository();
  const deadLetterQueue = new NoopDeadLetterQueue();

  const errors: string[] = [];
  const eventIds: string[] = [];

  const submissionWriteResult = await writeWithLifecycle({
    writer,
    input,
    metrics,
    deadLetterRepository,
    deadLetterQueue,
    eventType: input.submission.eventType,
    payload: input.submission.payload,
  });

  collectWriteOutcome(submissionWriteResult, errors, eventIds, input.flags.eventsWriteRequired, metrics, input.source);

  const checkpointWriteResults = [] as Array<{
    persisted: boolean;
    published: boolean;
    eventId?: string;
    validationErrors: string[];
  }>;

  if (input.checkpoint) {
    const checkpointWriteResult = await writeWithLifecycle({
      writer,
      input,
      metrics,
      deadLetterRepository,
      deadLetterQueue,
      eventType: "dna_session_checkpointed",
      payload: input.checkpoint.payload,
    });

    checkpointWriteResults.push(checkpointWriteResult);
    collectWriteOutcome(checkpointWriteResult, errors, eventIds, input.flags.eventsWriteRequired, metrics, input.source);
  }

  const behaviorWriteResults = [] as Array<{
    persisted: boolean;
    published: boolean;
    eventId?: string;
    validationErrors: string[];
  }>;

  for (const behaviorEvent of buildCanonicalBehaviorEventInputs({
    fragranceId: input.fragranceId,
    answerDimensions: input.answerDimensions,
    source: input.source,
  })) {
    const behaviorWriteResult = await writeWithLifecycle({
      writer,
      input,
      metrics,
      deadLetterRepository,
      deadLetterQueue,
      eventType: behaviorEvent.eventType,
      payload: behaviorEvent.payload,
    });

    behaviorWriteResults.push(behaviorWriteResult);
    collectWriteOutcome(behaviorWriteResult, errors, eventIds, input.flags.eventsWriteRequired, metrics, input.source);
  }

  const allWriteResults = [submissionWriteResult, ...checkpointWriteResults, ...behaviorWriteResults];
  const persisted = allWriteResults.every((result) => result.persisted);
  const published = allWriteResults.every((result) => result.published);

  if (!persisted || !input.parity?.enabled) {
    return {
      attempted: true,
      persisted,
      published,
      parityValidated: false,
      parityMatches: false,
      eventIds,
      errors,
      differences: [],
      metrics: metrics.getSnapshot(),
    };
  }

  const replayStart = nowMs();
  const replayEvents = collectReplayEvents(repository, publishingPipeline.publishedEvents).sort(compareEventsForReplay);
  const projectionRegistry = new InMemoryProjectionRegistry();
  registerPhase1Reducers(projectionRegistry);

  const replayResult = replayProjectionStates({
    events: replayEvents,
    initialStates: buildPhase1InitialProjectionStates(),
    registry: projectionRegistry,
  });
  metrics.recordReplayDuration(nowMs() - replayStart);

  const projectionState = replayResult.projectionStates["TestProjection"] as TestProjectionState | undefined;

  const parityStart = nowMs();
  const parity = validateTestParity(
    input.parity.legacyState,
    toProjectionParityState(projectionState)
  );
  metrics.recordParityResult(parity.matches, nowMs() - parityStart);

  return {
    attempted: true,
    persisted,
    published,
    parityValidated: true,
    parityMatches: parity.matches,
    eventIds,
    errors,
    differences: parity.differences,
    metrics: metrics.getSnapshot(),
  };
}

async function writeWithLifecycle(args: {
  writer: EventWriter;
  input: CanonicalEvaluationWriteInput;
  metrics: ReturnType<typeof createDefaultEventMetrics>;
  deadLetterRepository: FailedEventRepository;
  deadLetterQueue: DeadLetterQueue;
  eventType:
    | "test_answer_submitted"
    | "collection_evaluation_submitted"
    | "dna_session_checkpointed"
    | CanonicalBehaviorEventType;
  payload:
    | TestAnswerSubmittedPayload
    | CollectionEvaluationSubmittedPayload
    | DnaSessionCheckpointedPayload
    | AttributeBehaviorSignalPayload
    | PreferenceStrengthChangedPayload;
}): Promise<{
  persisted: boolean;
  published: boolean;
  eventId?: string;
  validationErrors: string[];
}> {
  const eventId = buildEventId();
  metricsSafe(args.metrics.recordEventEmitted.bind(args.metrics));

  const startedAt = nowMs();

  try {
    const result = await args.writer.write({
      eventId,
      eventType: args.eventType,
      userId: args.input.userId,
      sessionId: args.input.sessionId,
      actionId: buildActionId(args.eventType, `${args.input.fragranceId}-${eventId}`),
      producer: args.input.producer,
      payload: args.payload as never,
      engineVersions: {
        groundingModel: args.input.engineVersionLabel,
        dnaModel: args.input.engineVersionLabel,
        confidenceModel: args.input.engineVersionLabel,
        projectionModel: args.input.engineVersionLabel,
        clientSchema: args.input.engineVersionLabel,
      },
      context: {
        source: args.input.submission.contextSource,
        mode: "dual-write",
      },
    });

    args.metrics.recordWriteDuration(nowMs() - startedAt);

    if (result.persisted) {
      args.metrics.recordEventPersisted();
    }

    if (result.published) {
      args.metrics.recordEventPublished();
    }

    if (!result.persisted || !result.published) {
      args.metrics.recordEventFailed();
    }

    return {
      persisted: result.persisted,
      published: result.published,
      eventId: result.eventId,
      validationErrors: [...result.validationErrors],
    };
  } catch (error) {
    args.metrics.recordWriteDuration(nowMs() - startedAt);
    args.metrics.recordEventFailed();

    const failedEvent = createFailedEvent({
      originalEvent: {
        eventId,
        eventType: args.eventType,
        eventVersion: 1,
        userId: args.input.userId,
        sessionId: args.input.sessionId,
        occurredAt: new Date().toISOString(),
        receivedAt: new Date().toISOString(),
        payload: args.payload as Record<string, unknown>,
        engineVersions: {
          groundingModel: args.input.engineVersionLabel,
          dnaModel: args.input.engineVersionLabel,
          confidenceModel: args.input.engineVersionLabel,
          projectionModel: args.input.engineVersionLabel,
          clientSchema: args.input.engineVersionLabel,
        },
        idempotencyKey: `${args.input.userId}:${args.eventType}:failed:${eventId}`,
        producer: args.input.producer,
      },
      reason: "write_failed",
      replayable: true,
      maxRetryCount: 0,
      lastErrorMessage: error instanceof Error ? error.message : "write_failed_unknown",
    });

    await args.deadLetterRepository.save(failedEvent);
    await args.deadLetterQueue.enqueue(failedEvent);

    return {
      persisted: false,
      published: false,
      validationErrors: [error instanceof Error ? error.message : "write_failed_unknown"],
    };
  }
}

function collectWriteOutcome(
  writeResult: { persisted: boolean; published: boolean; eventId?: string; validationErrors: string[] },
  errors: string[],
  eventIds: string[],
  writeRequired: boolean,
  metrics: ReturnType<typeof createDefaultEventMetrics>,
  source: CanonicalEvaluationSource
): void {
  if (writeResult.eventId) {
    eventIds.push(writeResult.eventId);
  }

  errors.push(...writeResult.validationErrors);

  if ((!writeResult.persisted || !writeResult.published) && writeRequired) {
    metrics.recordEventRetried();
    errors.push(
      source === "test"
        ? "Test dual-write failure while eventsWriteRequired=true"
        : "Collection reinforcement write failure while eventsWriteRequired=true"
    );
  }
}

function toProjectionParityState(state: TestProjectionState | undefined): TestParityProjectionState {
  if (!state) {
    return {
      currentIndex: 0,
      answeredCount: 0,
      answeredOrder: [],
      currentVector: {},
      lastFragranceId: "",
      lastAnswerDimensions: {},
    };
  }

  return {
    currentIndex: state.progress.currentIndex,
    answeredCount: state.progress.answeredCount,
    answeredOrder: [...state.progress.answeredOrder],
    currentVector: { ...state.currentVector },
    lastFragranceId: state.latestAnswer.fragranceId,
    lastAnswerDimensions: { ...state.latestAnswer.answerDimensions },
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

function nowMs(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }

  return Date.now();
}

function metricsSafe(record: () => void): void {
  try {
    record();
  } catch {
    // Metrics must never affect legacy or dual-write execution.
  }
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