import type {
  AttributeBehaviorSignalPayload,
  CollectionEvaluationSubmittedPayload,
  DnaSessionCheckpointedPayload,
  GroundingSubmittedPayload,
  LegacyStateMirroredPayload,
  PreferenceStrengthChangedPayload,
  TestAnswerSubmittedPayload,
  UserVectorUpdatedPayload,
} from "@/lib/intelligence/events/types";

export const PHASE1_EVENT_CONTRACTS = {
  grounding_submitted: 1,
  test_answer_submitted: 1,
  collection_evaluation_submitted: 1,
  dna_session_checkpointed: 1,
  user_vector_updated: 1,
  legacy_state_mirrored: 1,
  attribute_liked: 1,
  attribute_disliked: 1,
  attribute_ignored: 1,
  attribute_uncertain: 1,
  preference_strength_changed: 1,
} as const;

export type Phase1EventPayloadMap = {
  grounding_submitted: GroundingSubmittedPayload;
  test_answer_submitted: TestAnswerSubmittedPayload;
  collection_evaluation_submitted: CollectionEvaluationSubmittedPayload;
  dna_session_checkpointed: DnaSessionCheckpointedPayload;
  user_vector_updated: UserVectorUpdatedPayload;
  legacy_state_mirrored: LegacyStateMirroredPayload;
  attribute_liked: AttributeBehaviorSignalPayload;
  attribute_disliked: AttributeBehaviorSignalPayload;
  attribute_ignored: AttributeBehaviorSignalPayload;
  attribute_uncertain: AttributeBehaviorSignalPayload;
  preference_strength_changed: PreferenceStrengthChangedPayload;
};
