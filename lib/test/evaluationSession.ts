import type { AnswerRecord, DNASessionState } from "../types";
import { EMPTY_GROUNDING, NEUTRAL_VECTOR, projectPreferences, submitEvaluation, validateEvaluation,
  type EvaluationDraft, type FragranceEvaluation, type GroundingPrior } from "./preferenceLearning";
import { groundingChoices, restoreGroundingState } from "../engine/groundingPreferences";

export function readGroundingPrior(value: unknown): GroundingPrior {
  if (value === null || value === undefined) return { ...EMPTY_GROUNDING };
  const choices = groundingChoices(restoreGroundingState(value));
  return { love: choices.love, neutral: choices.neutral, redFlag: choices.red_flag };
}

export function parseEvaluationDraft(value: unknown): EvaluationDraft {
  if (!value || typeof value !== "object") throw new Error("Invalid evaluation draft.");
  const draft = value as EvaluationDraft;
  if (draft.schemaVersion !== 2 || typeof draft.id !== "string" || typeof draft.fragranceId !== "string"
    || typeof draft.canonicalFragranceId !== "string" || typeof draft.displayName !== "string"
    || typeof draft.unable !== "boolean" || !Array.isArray(draft.questions) || !Array.isArray(draft.attributeIds)
    || draft.attributeIds.some((id) => typeof id !== "string") || !Number.isFinite(draft.startedAt)
    || !["confirm", "clarify", "explore", "fallback", "composition"].includes(draft.reason)
    || (draft.reasonAttributeId !== null && typeof draft.reasonAttributeId !== "string")
    || draft.questions.some((answer) => !answer || typeof answer.attributeId !== "string"
      || (answer.perception !== null && ![0, 1, 2, 3].includes(answer.perception))
      || (answer.preference !== null && ![-2, -1, 0, 1, 2].includes(answer.preference)))
    || (draft.overall !== null && ![-2, -1, 0, 1, 2].includes(draft.overall))) throw new Error("Invalid saved evaluation format.");
  // Validate identity and conditional invariants without completing unanswered fields.
  validateEvaluation(draft.unable ? draft : { ...draft, overall: draft.overall ?? 0, questions: draft.questions.map((answer) => ({
    ...answer, perception: answer.perception ?? 0, preference: answer.perception ? answer.preference ?? 0 : null,
  })) });
  if (draft.questions.some((answer) => (answer.perception === null || answer.perception === 0) && answer.preference !== null)) throw new Error("Preference without perception.");
  return structuredClone(draft);
}

export function parseEvaluationRecords(value: unknown): FragranceEvaluation[] {
  if (!Array.isArray(value)) throw new Error("Invalid evaluation history.");
  const ids = new Set<string>();
  const canonicalIds = new Set<string>();
  return value.map((item: unknown) => {
    if (!item || typeof item !== "object") throw new Error("Invalid evaluation record.");
    const record = item as FragranceEvaluation;
    if (!["completed", "unable"].includes(record.status) || !Number.isFinite(record.submittedAt)) throw new Error("Invalid evaluation status.");
    const draft = parseEvaluationDraft({ ...record, unable: record.status === "unable" });
    const valid = submitEvaluation(draft, record.submittedAt);
    if (ids.has(valid.id) || canonicalIds.has(valid.canonicalFragranceId)) throw new Error("Duplicate evaluation.");
    ids.add(valid.id);
    canonicalIds.add(valid.canonicalFragranceId);
    return valid;
  });
}

export function projectEvaluationSession(session: DNASessionState, grounding: GroundingPrior): DNASessionState {
  if (!session.evaluationState) throw new Error("Missing versioned evaluation state.");
  const records = session.evaluationState.records;
  const projection = projectPreferences(records, grounding);
  const completed = records.filter((record) => record.status === "completed");
  return {
    ...session, schemaVersion: 2, preferenceProjection: projection, behaviorProjection: undefined,
    currentVector: projection.vector, answeredOrder: completed.map((record) => record.fragranceId),
    currentIndex: completed.length,
    snapshots: completed.map((record) => {
      const partial = projectPreferences(records.slice(0, records.indexOf(record) + 1), grounding);
      return { fragranceId: record.fragranceId, fragranceName: record.displayName, vector: partial.vector, confidenceScore: partial.confidence, completedAt: record.submittedAt };
    }),
    summary: { finalVector: projection.vector, confidenceScore: projection.confidence, answeredCount: completed.length,
      completedAt: completed.at(-1)?.submittedAt ?? session.lastUpdatedAt,
      dominantAxes: Object.entries(projection.vector).sort((a, b) => Math.abs(b[1] - .5) - Math.abs(a[1] - .5)).slice(0, 2).map(([axis]) => axis.charAt(0).toUpperCase() + axis.slice(1)),
      compatibilitySnapshot: [] },
  };
}

export function migrateEvaluationSession(input: Partial<DNASessionState>, grounding: GroundingPrior,
  extraLegacyAnswers: Record<string, AnswerRecord> = {}): DNASessionState {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid saved DNA session.");
  const validateLegacy = (answers: unknown) => {
    if (!answers || typeof answers !== "object" || Array.isArray(answers)
      || Object.values(answers).some((answer: unknown) => !answer || typeof answer !== "object" || Array.isArray(answer)
        || Object.values(answer).some((value: unknown) => typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100))) {
      throw new Error("Invalid legacy perception answers; original data was preserved.");
    }
  };
  validateLegacy(input.answers ?? {});
  validateLegacy(extraLegacyAnswers);
  if (input.answeredOrder !== undefined && (!Array.isArray(input.answeredOrder) || input.answeredOrder.some((id) => typeof id !== "string"))) throw new Error("Invalid evaluation order.");
  if (input.schemaVersion !== undefined && input.schemaVersion !== 2) throw new Error("Unsupported DNA session version.");
  if (input.schemaVersion === 2 && !input.evaluationState) throw new Error("Missing versioned evaluation state.");
  const base: DNASessionState = { answers: {}, answeredOrder: [], currentIndex: 0, currentVector: { ...NEUTRAL_VECTOR }, snapshots: [], lastUpdatedAt: Date.now(), ...input };
  const previous = input.evaluationState;
  if (previous && previous.schemaVersion !== 2) throw new Error("Unsupported evaluation history version.");
  if (previous && (!previous.legacyPerception || previous.legacyPerception.source !== "legacy-intensity"
    || !Array.isArray(previous.legacyPerception.answeredOrder))) throw new Error("Invalid legacy perception archive.");
  if (previous) validateLegacy(previous.legacyPerception.answers);
  const records = previous ? parseEvaluationRecords(previous.records) : [];
  const draft = previous?.draft ? parseEvaluationDraft(previous.draft) : null;
  const state: DNASessionState = {
    ...base,
    evaluationState: previous ? { ...previous, records, draft,
      legacyPerception: { ...previous.legacyPerception, answers: { ...extraLegacyAnswers, ...previous.legacyPerception.answers } } } : {
      schemaVersion: 2, records, draft,
      legacyPerception: { source: "legacy-intensity", answers: { ...extraLegacyAnswers, ...base.answers }, answeredOrder: [...base.answeredOrder] },
      legacyProjection: { currentVector: base.currentVector, summary: base.summary, snapshots: base.snapshots, behaviorProjection: base.behaviorProjection },
    },
  };
  return projectEvaluationSession(state, grounding);
}
