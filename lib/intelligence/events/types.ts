export type Phase1EventType =
  | "grounding_submitted"
  | "test_answer_submitted"
  | "collection_evaluation_submitted"
  | "dna_session_checkpointed"
  | "user_vector_updated"
  | "legacy_state_mirrored"
  | "attribute_liked"
  | "attribute_disliked"
  | "attribute_ignored"
  | "attribute_uncertain"
  | "preference_strength_changed";

export type EngineComponentVersions = {
  groundingModel: string;
  dnaModel: string;
  confidenceModel: string;
  projectionModel: string;
  clientSchema: string;
};

export type EventEnvelope<TPayload extends object = Record<string, unknown>> = {
  eventId: string;
  eventType: Phase1EventType;
  eventVersion: number;
  userId: string;
  sessionId?: string;
  occurredAt: string;
  receivedAt: string;
  payload: TPayload;
  context?: Record<string, unknown>;
  engineVersions: EngineComponentVersions;
  correlationId?: string;
  causationId?: string;
  idempotencyKey: string;
  producer: string;
};

export type GroundingSubmittedPayload = {
  loveTokens: string[];
  neutralTokens: string[];
  avoidTokens: string[];
  seed: Record<string, unknown>;
  userVector: Record<string, number>;
};

export type TestAnswerSubmittedPayload = {
  fragranceId: string;
  answerDimensions: Record<string, number>;
  currentIndex: number;
  answeredCount: number;
};

export type CollectionEvaluationSubmittedPayload = {
  collectionItemId?: string;
  fragranceId: string;
  answerDimensions: Record<string, number>;
};

export type DnaSessionCheckpointedPayload = {
  currentIndex: number;
  answeredOrder: string[];
  currentVector: Record<string, number>;
  confidenceEstimate: number;
};

export type UserVectorUpdatedPayload = {
  vector: Record<string, number>;
  confidenceLevel: number;
  totalInteractions: number;
  evolutionStage: string;
};

export type LegacyStateMirroredPayload = {
  legacySessionHash: string;
  legacyProfileHash: string;
  mirroredAt: string;
};

export type AttributeBehaviorSignalPayload = {
  fragranceId: string;
  canonicalAttributeId: string;
  value: number;
  source: "test" | "collection";
};

export type PreferenceStrengthChangedPayload = {
  fragranceId: string;
  canonicalAttributeId: string;
  previousStrength: number;
  currentStrength: number;
  delta: number;
  confidence: number;
  source: "test" | "collection";
};
